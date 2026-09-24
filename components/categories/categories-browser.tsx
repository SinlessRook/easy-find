'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import type { Category } from '@/lib/mock-categories'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/categories/category-icon'

// Lowercase, strip accents, and treat dashes/underscores as spaces,
// so "ai tools", "AI-Tools" and "ai_tools" all compare equal.
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .trim()

export default function CategoriesBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')

  // Build the searchable text once per category, not on every keystroke.
  const indexed = useMemo(
    () =>
      categories.map((category) => ({
        category,
        haystack: normalize(
          [
            category.name,
            category.slug,
            category.description,
            // Optional: if your Category type has keywords/tags, they become searchable too.
            ...((category as { keywords?: string[] }).keywords ?? []),
          ].join(' ')
        ),
      })),
    [categories]
  )

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    if (terms.length === 0) return categories
    // Every typed word must appear somewhere ("ai tools", "chess games", "notes ktu" all work).
    return indexed
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .map(({ category }) => category)
  }, [categories, indexed, query])

  const hasQuery = query.trim().length > 0

  return (
    <div className="space-y-4">
      <div
        role="search"
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-slate-400 focus-within:bg-white"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('')
          }}
          placeholder="Search categories"
          aria-label="Search categories"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {hasQuery && (
        <p className="text-xs text-slate-500" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'category' : 'categories'} found
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
          No categories match &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {visible.map((c, index) => (
            <li key={c.slug}>
              <CategoryCard category={c} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const tileTones = [
  'bg-[#e8edb8] border-[#d9df9b]',
  'bg-[#eee5fa] border-[#dfd0f3]',
  'bg-[#dcecf0] border-[#c5e0e6]',
  'bg-[#f8e5c6] border-[#f0d5a8]',
  'bg-[#f4dce5] border-[#ecc6d3]',
  'bg-[#dce8d5] border-[#c6dbbc]',
]

function CategoryCard({ category: c, index }: { category: Category; index: number }) {
  return (
    <Link
      href={`/categories/${c.slug}`}
      className={cn(
        'flex min-h-40 h-full flex-col rounded-2xl border p-3 transition-transform hover:-translate-y-0.5 hover:shadow-md',
        tileTones[index % tileTones.length]
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/75 text-slate-950">
          <CategoryIcon name={c.icon} className="h-5 w-5" />
        </span>
        <span
          className="rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-slate-700"
          aria-label={`${c.count} resources`}
        >
          {new Intl.NumberFormat('en-US').format(c.count)}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-lg font-black leading-[1.05] tracking-[-0.03em] text-slate-950">{c.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-700">{c.description}</p>

      <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700">
        Explore
      </span>
    </Link>
  )
}