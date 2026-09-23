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

// GET /api/v1/resources?section=backend&top=true&page=1&limit=20
// Public read: no login needed, so there is no getUser() check here.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Optional single section. Empty or missing means "all resources".
  const section = searchParams.get('section') || null
  if (section && !/^[a-z0-9-]{1,40}$/.test(section)) {
    return badRequest('section', 'Section may only contain lowercase letters, numbers and dashes.')
  }

  // Optional: top=true sorts by score (upvotes minus downvotes), highest first.
  const topParam = searchParams.get('top')
  if (topParam !== null && topParam !== 'true' && topParam !== 'false') {
    return badRequest('top', 'top must be true or false.')
  }
  const top = topParam === 'true'

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '', 10) || 20))
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase.from('resources_with_score').select(COLUMNS, { count: 'exact' })
  if (section) query = query.contains('sections', [section]) // "sections includes this value"

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
    const votes = r.upvotes + r.downvotes
    return {
      id: r.id,
      section: r.sections[0] ?? '',
      kind: r.resource_type,
      title: r.title,
      description: r.description ?? '',
      url: r.link,
      tag: r.sections[0] ?? '',
      tagTone: 'indigo' as const, // TODO: derive from the section name
      userVote: 0, // TODO: get the signed-in user's vote from the votes table
      createdAt: r.created_at,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      author: { username: 'ken_architect' },
    }
  })

  return NextResponse.json({ data: items, meta: { page, limit, total: count ?? 0 } })
}

/* ------------------------------------------------------------------ */
/* POST /api/v1/resources  (login required)                           */
/* body: { sections, resourcetype, url, title, description }          */
/* ------------------------------------------------------------------ */

const RESOURCE_TYPES = ['link', 'tool', 'article', 'video', 'course', 'other'] as const

const createSchema = z.object({
  sections: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9-]{1,40}$/, 'Use lowercase letters, numbers and dashes only')
    )
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
      const key = issue.path.length ? issue.path.join('.') : 'body'
      if (!fields[key]) fields[key] = issue.message
    }
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Some fields are invalid.', fields } },
      { status: 400 }
    )
  }

  // 3) Insert. created_by is NOT sent: the column default (auth.uid()) fills it in
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