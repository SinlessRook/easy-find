import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoogleButton from '@/components/auth/google-button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  // Already logged in? Skip the login page.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          New here? Signing in with Google creates your account.
        </p>

        {error && (
          <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
            Sign-in failed. Please try again.
          </p>
        )}

        <GoogleButton next={next ?? '/'} />
      </div>
    </main>
  )
}