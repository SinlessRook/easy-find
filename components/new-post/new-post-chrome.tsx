'use client'

import { useRouter } from 'next/navigation'
import { AlignLeft, ArrowLeft, Share2, UserRound, X } from 'lucide-react'

function useGoBack() {
  const router = useRouter()
  // If the page was opened directly (no history), fall back to the home page.
  return () => (window.history.length > 1 ? router.back() : router.push('/'))
}

export function NewPostBar({
  user,
}: {
  user: { name?: string | null; avatarUrl?: string | null } | null
}) {
  const goBack = useGoBack()

  async function share() {
    const data = { title: 'EzyFind', url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else await navigator.clipboard.writeText(data.url)
    } catch {
      // user cancelled the share sheet, or clipboard is blocked
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-200/60"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white">
            <AlignLeft className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="text-xl font-bold text-slate-900">New Post</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            aria-label="Share this page"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-200/60"
          >
            <Share2 className="h-5 w-5" aria-hidden />
          </button>
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-200 text-slate-600">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'Your profile'}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5" aria-hidden />
            )}
          </span>
        </div>
      </div>
    </header>
  )
}

export function CloseButton({ href = '/' }: { href?: string }) {
  const router = useRouter()

  function close() {
    const sheet = document.querySelector<HTMLElement>('[data-post-sheet]')
    sheet?.classList.add('post-sheet-closing')
    window.setTimeout(() => router.push(href), 220)
  }

  return (
    <button
      type="button"
      onClick={close}
      aria-label="Close"
      className="grid h-11 w-11 place-items-center rounded-full bg-indigo-100/80 text-slate-800 hover:bg-indigo-100"
    >
      <X className="h-5 w-5" aria-hidden />
    </button>
  )
}