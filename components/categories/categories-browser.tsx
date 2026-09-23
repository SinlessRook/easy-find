'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Category } from '@/lib/mock-categories'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/categories/category-icon'

export default function CategoriesBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return categories
    return categories.filter((category) =>
      `${category.name} ${category.description}`.toLowerCase().includes(term)
    )
  }, [categories, query])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-slate-400 focus-within:bg-white">
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
          No categories found.
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