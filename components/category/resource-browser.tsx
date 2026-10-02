'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpDown, ChevronDown, Search, X } from 'lucide-react'
import type { CategoryResource } from '@/lib/mock-category-resources'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/axios'
import CategoryResourceCard, { helpfulPercent } from './resource-card'

type Tab = { label: string; value: string }
type Sort = 'helpful' | 'newest' | 'top'

const sortLabels: Record<Sort, string> = {
  helpful: 'Most Helpful',
  newest: 'Newest',
  top: 'Top Voted',
}

export default function ResourceBrowser({
  resources,
  tabs,
  noun,
}: {
  resources: CategoryResource[]
  tabs: Tab[]
  noun: string // "database" -> placeholder "Filter database resources..."
}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('')
  const [sort, setSort] = useState<Sort>('helpful')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [activity, setActivity] = useState<Record<string, { userVote: -1 | 0 | 1; isSaved: boolean }>>({})

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function syncActivity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return

      setIsSignedIn(Boolean(user))
      if (!user) {
        setActivity({})
        return
      }

      try {
        const response = await api.get('/user/me')
        if (!active) return
        setActivity(
          Object.fromEntries(
            (response.data?.data ?? []).map((item: { id: string; userVote: -1 | 0 | 1; isSaved: boolean }) => [
              item.id,
              { userVote: item.userVote, isSaved: item.isSaved },
            ])
          )
        )
      } catch {
        if (active) setActivity({})
      }
    }

    void syncActivity()

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      void syncActivity()
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = resources.filter(
      (r) =>
        (!kind || r.kind === kind) &&
        (!term || `${r.title} ${r.description} ${r.tag} ${r.url}`.toLowerCase().includes(term))
    )
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return +new Date(b.createdAt) - +new Date(a.createdAt)
      if (sort === 'top') return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      return helpfulPercent(b) - helpfulPercent(a) || b.upvotes - a.upvotes
    })
  }, [resources, query, kind, sort])

  return (
    <div className="space-y-3">
      {/* Filter input */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-400">
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${noun} resources...`}
          aria-label={`Filter ${noun} resources`}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-900">
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Kind tabs */}
      <div
        role="group"
        aria-label="Resource type"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => {
          const active = t.value === kind
          return (
            <button
              key={t.value || 'all'}
              type="button"
              onClick={() => setKind(t.value)}
              aria-pressed={active}
              className={cn(
                'relative shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium',
                active ? 'border-slate-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-kind"
                  className="absolute inset-0 rounded-full bg-slate-700"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Info + sort */}
      <div className="flex items-center justify-between gap-3 border-y border-slate-100 py-2">
        <p className="text-xs text-slate-500">Useful resources</p>
        <label className="relative shrink-0">
          <span className="sr-only">Sort by</span>
          <ArrowUpDown
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700"
            aria-hidden
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="appearance-none rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {(Object.keys(sortLabels) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {sortLabels[s]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700"
            aria-hidden
          />
        </label>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {resources.length === 0
            ? 'No links here yet. Add the first one with the button below.'
            : 'No links match your filters. Clear the search or pick another type.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((r) => (
            <li key={r.id} className="min-w-0">
              <CategoryResourceCard
                resource={{
                  ...r,
                  userVote: activity[r.id]?.userVote ?? r.userVote ?? 0,
                  isSaved: activity[r.id]?.isSaved ?? Boolean((r as CategoryResource & { isSaved?: boolean }).isSaved),
                }}
                isSignedIn={isSignedIn}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}