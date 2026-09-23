'use client'

import { useState } from 'react'
import { Clock, MessageCircle, Trash2 } from 'lucide-react'
import type { Query } from '@/lib/mock-data'
import { timeAgo } from '@/lib/time'
import { api } from '@/lib/axios'

type QueryWithOwner = Query & { createdBy: string }

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
      {queries.map((query) => (
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
            <button
              type="button"
              aria-label={`Contact ${query.author.username} on WhatsApp`}
              title="Contact on WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
            </button>
          </footer>
        </article>
      ))}
    </div>
  )
}