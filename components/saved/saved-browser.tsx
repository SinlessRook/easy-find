'use client'

import { useMemo, useState } from 'react'
import {
  Link2,
} from 'lucide-react'

export type SavedBrowserItem = {
  title: string
  href: string
  tone: string
  kind: 'Tool' | 'Query'
}

type SortMode = 'rank' | 'rating' | 'recent'

function domainOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function displayName(href: string, title: string) {
  const domain = domainOf(href)
  if (!domain) return href === '/queries' ? 'Queries' : title

  const words = domain
    .split('.')
    .filter((part) => !['com', 'org', 'net', 'so', 'io', 'co', 'in'].includes(part))
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function SavedBrowser({ items }: { items: SavedBrowserItem[] }) {
  const [sort, setSort] = useState<SortMode>('rank')
  const visibleItems = useMemo(() => {
    if (sort === 'rating') return [...items].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'recent') return [...items].reverse()
    return items
  }, [items, sort])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ['rank', 'By Rank'],
          ['rating', 'By Rating'],
          ['recent', 'Recently Added'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSort(value as SortMode)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
              sort === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
      {visibleItems.map((item) => {
        const domain = domainOf(item.href)
        const label = displayName(item.href, item.title)
        return (
          <a
            key={item.title}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={`Open ${item.title}`}
            title={item.title}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-white/70 p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}
          >
            {domain ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
                alt=""
                loading="lazy"
                className="h-12 w-12 rounded-xl bg-white p-2 object-contain"
              />
            ) : (
              <Link2 className="h-10 w-10" strokeWidth={1.8} aria-hidden />
            )}
            <span className="max-w-full truncate text-xs font-semibold">{label}</span>
          </a>
        )
      })}
    </div>
    </div>
  )
}
