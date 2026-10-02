import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

//   PUT    /api/v1/resources/{resourceId}/save   save it
//   DELETE /api/v1/resources/{resourceId}/save   unsave it
// Both require a logged-in user and are idempotent (safe to repeat).

type Context = { params: Promise<{ slug: string }> }

const idSchema = z.string().uuid('resourceId must be a valid id')

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'unauthorized', message: 'Please sign in to save resources.' } },
    { status: 401 }
  )
}

function invalidId(message: string) {
  return NextResponse.json(
    { error: { code: 'validation_error', message, fields: { resourceId: message } } },
    { status: 400 }
  )
}

export async function PUT(_request: Request, { params }: Context) {
  const parsedId = idSchema.safeParse((await params).slug)
  if (!parsedId.success) return invalidId(parsedId.error.issues[0].message)
  const resourceId = parsedId.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // ON CONFLICT DO NOTHING: saving twice keeps the original date and does not error.
  const { error } = await supabase
    .from('saved_resources')
    .upsert(
      { user_id: user.id, resource_id: resourceId },
      { onConflict: 'user_id,resource_id', ignoreDuplicates: true }
    )

  if (error) {
    // 23503 = foreign key violation: that resource id does not exist.
    if (error.code === '23503') {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'That resource does not exist.' } },
        { status: 404 }
      )
    }
    console.error('PUT /api/v1/user/me/saved/[resourceId] failed:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not save this resource. Please try again.' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { resourceId, saved: true } })
}

export async function DELETE(_request: Request, { params }: Context) {
  const parsedId = idSchema.safeParse((await params).slug)
  if (!parsedId.success) return invalidId(parsedId.error.issues[0].message)
  const resourceId = parsedId.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { error } = await supabase
    .from('saved_resources')
    .delete()
    .eq('user_id', user.id)
    .eq('resource_id', resourceId)

  if (error) {
    console.error('DELETE /api/v1/user/me/saved/[resourceId] failed:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Could not remove this resource. Please try again.' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { resourceId, saved: false } })
}