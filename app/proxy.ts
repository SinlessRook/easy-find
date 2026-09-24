import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'


export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Refresh and expose the authenticated session for page and API requests.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}