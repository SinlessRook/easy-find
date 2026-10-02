'use client'

import { useEffect, useState } from 'react'
import { Check, Clock, MessageCircle, Share2, Trash2, X } from 'lucide-react'
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
  const [selectedQuery, setSelectedQuery] = useState<QueryWithOwner | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedQuery) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedQuery(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedQuery])

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
        <article
          key={query.id}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedQuery(query)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setSelectedQuery(query)
            }
          }}
          className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
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
          <footer onClick={(event) => event.stopPropagation()} className="mt-2.5 flex justify-end">
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
      {selectedQuery && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedQuery(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="query-detail-title"
            onTouchStart={(event) => setTouchStartY(event.touches[0]?.clientY ?? null)}
            onTouchEnd={(event) => {
              if (touchStartY !== null && (event.changedTouches[0]?.clientY ?? touchStartY) - touchStartY > 80) {
                setSelectedQuery(null)
              }
              setTouchStartY(null)
            }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close query details"
              onClick={() => setSelectedQuery(null)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <p className="pr-10 text-xs font-medium text-slate-500">@{selectedQuery.author.username}</p>
            <h2 id="query-detail-title" className="mt-2 pr-10 text-xl font-bold leading-snug text-slate-950">
              {selectedQuery.title}
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {selectedQuery.description || 'No additional details were provided for this query.'}
            </p>
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              {whatsappHref(selectedQuery.contactNum) && currentUserId ? (
                <a
                  href={`${whatsappHref(selectedQuery.contactNum)}?text=${encodeURIComponent(`Hey, I responded regarding "${selectedQuery.title}" on EzyFind.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Contact ${selectedQuery.author.username} on WhatsApp`}
                  title="Contact on WhatsApp"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <WhatsAppIcon />
                  Contact on WhatsApp
                </a>
              ) : !currentUserId ? (
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <WhatsAppIcon />
                  Sign in to contact
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  No contact number
                </span>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}