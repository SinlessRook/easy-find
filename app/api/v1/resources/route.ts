import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Public fields only: no created_by, no username.
const COLUMNS =
  'id, title, description, link, sections, resource_type, created_at, score, upvotes, downvotes'

function badRequest(field: string, message: string) {
  return NextResponse.json(
    { error: { code: 'validation_error', message, fields: { [field]: message } } },
    { status: 400 }
  )
}

// Turns "AI Tools", "ai tools", " Documentation " into "ai-tools", "ai-tools", "documentation".
// Used by BOTH GET (filter) and POST (storage) so reads and writes always agree.
// Note: not exported on purpose. Next.js route files may only export HTTP methods and config.
const slugify = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-')

const SECTION_SLUG_RE = /^[a-z0-9-]{1,40}$/

/* ------------------------------------------------------------------ */
/* GET /api/v1/resources?section=documentation&top=true&page=1&limit=20 */
/* Public read: no login needed, so there is no getUser() check here.  */
/* ------------------------------------------------------------------ */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Optional single section. Case-insensitive and space-tolerant
  // (?section=AI%20Tools and ?section=ai-tools both become "ai-tools").
  // Empty or missing means "all resources".
  const rawSection = searchParams.get('section')
  const section = rawSection && rawSection.trim() ? slugify(rawSection) : null
  if (section && !SECTION_SLUG_RE.test(section)) {
    return badRequest('section', 'Section may only contain letters, numbers, spaces and dashes.')
  }

  // Optional: top=true sorts by score. Case-insensitive ("True", "TRUE" all work).
  const topParam = searchParams.get('top')?.trim().toLowerCase() ?? null
  if (topParam !== null && topParam !== 'true' && topParam !== 'false') {
    return badRequest('top', 'top must be true or false.')
  }
  const top = topParam === 'true'

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '', 10) || 20))
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase.from('resources_with_score').select(COLUMNS, { count: 'exact' })
  if (section) query = query.contains('sections', [section])

  // top=true: highest score first (newest wins ties). Otherwise: newest first.
  const ordered = top
    ? query.order('score', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false })

  const { data, error, count } = await ordered.range(from, from + limit - 1)

  if (error) {
    console.error('GET /api/v1/resources failed:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not load resources.' } },
      { status: 500 }
    )
  }

  const items = data.map((r) => {
    // When filtering, report the section that was asked for so the response
    // matches the request even if it is not the first element of the array.
    const primary = section ?? r.sections?.[0] ?? ''
    return {
      id: r.id,
      section: primary,
      kind: r.resource_type,
      title: r.title,
      description: r.description ?? '',
      url: r.link,
      tag: primary,
      tagTone: 'indigo' as const, // TODO: derive from the section name
      userVote: 0, // TODO: get the signed-in user's vote from the votes table
      createdAt: r.created_at,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      // COLUMNS deliberately excludes created_by, so it is not available here (and a raw
      // uuid should not be shown as a username anyway). TODO: expose a public username
      // from a profiles table via the view, then read it here.
      author: { username: 'Unknown' },
    }
  })

  return NextResponse.json({ data: items, meta: { page, limit, total: count ?? 0 } })
}

/* ------------------------------------------------------------------ */
/* POST /api/v1/resources  (login required)                           */
/* body: { sections, resourcetype, url, title, description }          */
/* ------------------------------------------------------------------ */

const RESOURCE_TYPES = ['link', 'tool', 'article', 'video', 'course', 'other'] as const

// Each section is slugified BEFORE validation, so "AI Tools" is stored as "ai-tools".
const sectionSlug = z
  .string()
  .transform(slugify)
  .pipe(z.string().regex(SECTION_SLUG_RE, 'Use letters, numbers, spaces and dashes only (max 40 characters)'))

const createSchema = z.object({
  sections: z
    .array(sectionSlug)
    .min(1, 'Pick at least one section')
    .max(5, 'At most 5 sections')
    .transform((list) => [...new Set(list)]), // drop duplicates
  resourcetype: z.enum(RESOURCE_TYPES).default('link'),
  url: z
    .string()
    .trim()
    .url('Enter a full link, e.g. https://example.com')
    .refine((v) => /^https?:\/\//i.test(v), 'The url must start with http:// or https://'),
  title: z
    .string()
    .trim()
    .min(3, 'The title needs at least 3 characters')
    .max(150, 'The title can be at most 150 characters'),
  description: z.string().trim().max(2000, 'The description can be at most 2000 characters').optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1) Who is calling? Writes need a logged-in user.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Please sign in to add a resource.' } },
      { status: 401 }
    )
  }

  // 2) Read and validate the body. The client can send anything, so check every field.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'The request body must be valid JSON.' } },
      { status: 400 }
    )
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      // sections.0, sections.1 ... are reported under a single "sections" key.
      const key = issue.path.length
        ? issue.path[0] === 'sections'
          ? 'sections'
          : issue.path.join('.')
        : 'body'
      if (!fields[key]) fields[key] = issue.message
    }
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Some fields are invalid.', fields } },
      { status: 400 }
    )
  }

  // 3) Insert. `sections` is already slugified and de-duplicated by the schema.
  //    created_by is NOT sent: the column default (auth.uid()) fills it in
  //    from the verified login, and row-level security double-checks it.
  const { title, url, sections, resourcetype, description } = parsed.data
  const { data, error } = await supabase
    .from('resources')
    .insert({
      title,
      link: url,
      sections,
      resource_type: resourcetype,
      description: description || null,
    })
    .select('id, title, description, link, sections, resource_type, created_at')
    .single()

  if (error) {
    console.error('POST /api/v1/resources failed:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not save your resource. Please try again.' } },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        url: data.link,
        sections: data.sections,
        resourceType: data.resource_type,
        createdAt: data.created_at,
        score: 0,
        upvotes: 0,
        downvotes: 0,
        helpfulPercent: null,
      },
    },
    { status: 201 }
  )
}