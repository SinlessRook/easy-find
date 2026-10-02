'use client'

import { useState } from 'react'
import { Check, Clock, MessageCircle, Share2, Trash2 } from 'lucide-react'
import type { Query } from '@/lib/mock-data'
import { timeAgo } from '@/lib/time'
import { api } from '@/lib/axios'
import SignInDialog from '@/components/auth/sign-in-dialog'

type QueryWithOwner = Query & { createdBy: string }

function WhatsAppIcon() {
  const [failed, setFailed] = useState(false)

  if (failed) return <MessageCircle className="h-5 w-5" aria-hidden />

  return (
    // Simple Icons provides the official WhatsApp mark; keep a local fallback if the asset is unavailable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://cdn.simpleicons.org/whatsapp/25D366"
      alt=""
      className="h-5 w-5"
      onError={() => setFailed(true)}
    />
  )
}

function whatsappHref(contactNum?: string | null) {
  const digits = contactNum?.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

export default function QueryList({
  queries: initialQueries,
  currentUserId,
}: {
  queries: QueryWithOwner[]
  currentUserId?: string
}) {
  const [queries, setQueries] = useState(initialQueries)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [signInOpen, setSignInOpen] = useState(false)
  const [sharedQueryId, setSharedQueryId] = useState<string | null>(null)

  async function shareQuery(query: QueryWithOwner) {
    const url = typeof window === 'undefined' ? '/queries' : `${window.location.origin}/queries`
    const shareData = {
      title: query.title,
      text: `Check out this campus query: ${query.title}`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setSharedQueryId(query.id)
        window.setTimeout(() => setSharedQueryId(null), 1500)
      }
    } catch {
      // The user cancelled sharing or clipboard access was unavailable.
    }
  }

  async function deleteQuery(id: string) {
    if (deletingId || !window.confirm('Delete this query?')) return

    const deletedQuery = queries.find((query) => query.id === id)
    const deletedIndex = queries.findIndex((query) => query.id === id)
    if (!deletedQuery) return

    setDeletingId(id)
    setDeleteError('')
    setQueries((current) => current.filter((query) => query.id !== id))

    try {
      await api.post(`/queries/${id}`)
    } catch {
      setQueries((current) => {
        const restored = [...current]
        restored.splice(Math.min(deletedIndex, restored.length), 0, deletedQuery)
        return restored
      })
      setDeleteError('Could not delete the query. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (queries.length === 0) {
    return (
      <>
        {deleteError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">No queries yet.</p>
      </>
    )
  }

  return (
    <div className="space-y-3">
      {deleteError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}
      {queries.map((query) => {
        const contactUrl = whatsappHref(query.contactNum)
        const contactMessage = `Hey, I responded regarding "${query.title}" on EzyFind.`

        return (
        <article key={query.id} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <header className="flex items-center justify-between gap-3">
            <span className="truncate text-xs font-medium text-slate-500">@{query.author.username}</span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-slate-400">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {timeAgo(query.createdAt)}
            </span>
          </header>
          <h2 className="mt-1.5 text-lg font-bold leading-snug text-slate-900">
            {query.title}
          </h2>
          <footer className="mt-2.5 flex justify-end">
            <button
              type="button"
              aria-label="Share query"
              title="Share query"
              onClick={() => void shareQuery(query)}
              className="mr-2 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {sharedQueryId === query.id ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden />
              )}
            </button>
            {currentUserId === query.createdBy && (
              <button
                type="button"
                aria-label="Delete query"
                title="Delete query"
                disabled={deletingId === query.id}
                onClick={() => void deleteQuery(query.id)}
                className="mr-2 grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
            {contactUrl && currentUserId ? (
              <a
                href={`${contactUrl}?text=${encodeURIComponent(contactMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contact ${query.author.username} on WhatsApp`}
                title="Contact on WhatsApp"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-950 hover:bg-slate-200"
              >
                <WhatsAppIcon />
              </a>
            ) : !currentUserId ? (
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                aria-label="Sign in to contact this user"
                title="Sign in to contact"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-950 hover:bg-slate-200"
              >
                <WhatsAppIcon />
              </button>
            ) : (
              <span
                aria-label="No contact number provided"
                title="No contact number provided"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-300"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
            )}
          </footer>
        </article>
        )
      })}
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} next="/queries" />
    </div>
  )
}