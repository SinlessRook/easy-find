'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function GoogleButton({ next = '/' }: { next?: string }) {
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    // On success the browser navigates to Google, so we only land here on error
    if (error) setLoading(false)
  }

  return (
    <Button onClick={signIn} disabled={loading} className="w-full rounded-full py-6">
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Continue with Google
    </Button>
  )
}