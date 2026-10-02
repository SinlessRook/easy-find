import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// body: { vote: 1 }  = upvote,  { vote: -1 } = downvote,  { vote: 0 } = remove my vote
const voteSchema = z.object({
  vote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
})

function json(status: number, code: string, message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status })
}

// POST /api/resources/:id/vote  (login required)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: id } = await params
  if (!UUID.test(id)) return json(404, 'not_found', 'Resource not found.')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ data: { resourceId: id, userVote: 0 } })
  }

  const { data, error } = await supabase
    .from('votes')
    .select('vote')
    .eq('resource_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('GET /api/resources/[id]/vote failed:', error)
    return json(500, 'server_error', 'Could not load your vote.')
  }

  return NextResponse.json({
    data: {
      resourceId: id,
      userVote: data?.vote ?? 0,
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: id } = await params
  const supabase = await createClient()

  // 1) Who is calling? Voting needs a logged-in user.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return json(401, 'unauthorized', 'Please sign in to vote.')

  // 2) The id in the URL must look like a uuid (otherwise Postgres throws a confusing error).
  if (!UUID.test(id)) return json(404, 'not_found', 'Resource not found.')

  // 3) Read and validate the body.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, 'invalid_json', 'The request body must be valid JSON.')
  }
  const parsed = voteSchema.safeParse(body)
  if (!parsed.success) {
    return json(400, 'validation_error', 'Some fields are invalid.', {
      vote: 'vote must be -1, 0 or 1',
    })
  }
  const { vote } = parsed.data

  // 4) Save the vote. The primary key is (resource_id, user_id), so a second vote
  //    from the same user UPDATES the existing row instead of adding another one.
  const { error } = await supabase
    .from('votes')
    .upsert({ resource_id: id, user_id: user.id, vote }, { onConflict: 'resource_id,user_id' })

  if (error) {
    // 23503 = foreign key violation: there is no resource with this id.
    if (error.code === '23503') return json(404, 'not_found', 'Resource not found.')
    console.error('POST /api/resources/[id]/vote failed:', error)
    return json(500, 'server_error', 'Could not save your vote. Please try again.')
  }

  // 5) Send back the fresh totals so the UI can update.
  const { data: totals, error: totalsError } = await supabase
    .from('resources_with_score')
    .select('score, upvotes, downvotes')
    .eq('id', id)
    .single()

  if (totalsError) {
    console.error('vote totals failed:', totalsError)
    return json(500, 'server_error', 'Your vote was saved, but the totals could not be loaded.')
  }

  const votes = totals.upvotes + totals.downvotes
  return NextResponse.json({
    data: {
      resourceId: id,
      userVote: vote,
      isSaved: true,
      score: totals.score,
      upvotes: totals.upvotes,
      downvotes: totals.downvotes,
      helpfulPercent: votes === 0 ? null : Math.round((totals.upvotes / votes) * 100),
    },
  })
}