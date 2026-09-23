import { createClient } from '@/lib/supabase/server'

// Returns the signed-in user in the shape <TopBar user={...} /> expects, or null.
export async function getTopBarUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? null,
    avatarUrl:
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null,
  }
}