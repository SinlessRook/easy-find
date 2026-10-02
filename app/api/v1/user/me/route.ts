import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* ------------------------------------------------------------------ */
/* GET /api/user/me                                                    */
/* Requires an authenticated session. Returns the resources this user  */
/* has voted on and/or saved, including the user's activity state.     */
/* ------------------------------------------------------------------ */

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'You must be signed in.' } },
      { status: 401 }
    )
  }

  const [{ data: votes, error: voteError }, { data: saves, error: saveError }] = await Promise.all([
    supabase.from('votes').select('resource_id, vote').eq('user_id', user.id),
    supabase.from('saved_resources').select('resource_id').eq('user_id', user.id),
  ])

  if (voteError || saveError) {
    console.error('GET /api/user/me failed:', voteError ?? saveError)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not load your activity.' } },
      { status: 500 }
    )
  }

  const resourceIds = new Set([
    ...(votes ?? []).map((vote) => vote.resource_id),
    ...(saves ?? []).map((save) => save.resource_id),
  ])

  if (resourceIds.size === 0) return NextResponse.json({ data: [] })

  const { data: resources, error: resourceError } = await supabase
    .from('resources_with_score')
    .select('id, title, description, link, sections, resource_type, created_at, upvotes, downvotes')
    .in('id', [...resourceIds])

  if (resourceError) {
    console.error('GET /api/user/me resources failed:', resourceError)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not load your activity.' } },
      { status: 500 }
    )
  }

  const voteByResource = new Map((votes ?? []).map((vote) => [vote.resource_id, vote.vote]))
  const savedResourceIds = new Set((saves ?? []).map((save) => save.resource_id))

  return NextResponse.json({
    data: (resources ?? []).map((resource) => ({
      id: resource.id,
      section: resource.sections?.[0] ?? '',
      kind: resource.resource_type,
      title: resource.title,
      description: resource.description ?? '',
      url: resource.link,
      tag: resource.sections?.[0] ?? '',
      tagTone: 'indigo',
      userVote: voteByResource.get(resource.id) ?? 0,
      isSaved: savedResourceIds.has(resource.id),
      createdAt: resource.created_at,
      upvotes: resource.upvotes,
      downvotes: resource.downvotes,
      author: { username: 'Unknown' },
    })),
  })
}