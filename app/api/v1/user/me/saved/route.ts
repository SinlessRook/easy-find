import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// File location: app/api/v1/user/me/saved/route.ts
// GET /api/v1/user/me/saved?page=1&limit=20  (login required)
// Returns the signed-in user's saved resources, newest save first.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '', 10) || 20))
  const from = (page - 1) * limit

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Please sign in to see your saved resources.' } },
      { status: 401 }
    )
  }

  // 1) The user's saves for this page (RLS also restricts this to their own rows).
  const { data: saves, error: savesError, count } = await supabase
    .from('saved_resources')
    .select('resource_id, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (savesError) {
    console.error('GET /api/v1/user/me/saved (saves) failed:', savesError)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not load your saved resources.' } },
      { status: 500 }
    )
  }

  if (!saves || saves.length === 0) {
    return NextResponse.json({ data: [], meta: { page, limit, total: count ?? 0 } })
  }

  // 2) The resource details for those saves.
  const { data: resources, error: resourcesError } = await supabase
    .from('resources_with_score')
    .select('id, title, link, upvotes, downvotes')
    .in('id', saves.map((s) => s.resource_id))

  if (resourcesError) {
    console.error('GET /api/v1/user/me/saved (resources) failed:', resourcesError)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not load your saved resources.' } },
      { status: 500 }
    )
  }

  const byId = new Map(resources.map((r) => [r.id, r]))

  // Keep the "newest save first" order from step 1.
  const items = saves.flatMap((s) => {
    const r = byId.get(s.resource_id)
    if (!r) return []
    return [
      {
        resourceId: r.id,
        title: r.title,
        resourceLink: r.link,
        rating: r.upvotes - r.downvotes, // likes minus dislikes
        dateAdded: s.created_at,
      },
    ]
  })

  return NextResponse.json({ data: items, meta: { page, limit, total: count ?? 0 } })
}