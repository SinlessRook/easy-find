import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Google -> Supabase -> here. Exchanges the one-time code for a session
// and stores it in httpOnly cookies.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Only allow redirects to paths inside our own app
  const nextParam = searchParams.get('next') ?? '/'
  const next =
    nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log(searchParams.get('error_description'))
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}