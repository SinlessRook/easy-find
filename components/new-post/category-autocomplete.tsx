'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = { slug: string; name: string }

type Props = {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  error?: string
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoryAutocomplete({ categories, value, onChange, error }: Props) {
  const [query, setQuery] = useState(() => categories.find((category) => category.slug === value)?.name ?? value)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const selected = categories.find((category) => category.slug === value)
    if (selected && selected.name !== query) setQuery(selected.name)
  }, [categories, value, query])

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    return categories.filter((category) => !term || category.name.toLowerCase().includes(term))
  }, [categories, query])

  const existing = categories.some(
    (category) => category.name.toLowerCase() === query.trim().toLowerCase()
  )
  const newSlug = slugify(query)

  function choose(category: Category) {
    setQuery(category.name)
    onChange(category.slug)
    setOpen(false)
  }

  function acceptNew() {
    if (!newSlug) return
    onChange(newSlug)
    setQuery(query.trim())
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className={cn(field, 'flex items-center gap-2 pr-3', error && 'ring-2 ring-red-200')}>
        <input
          id="section"
          type="text"
          value={query}
          required
          autoComplete="off"
          placeholder="Type a category, e.g. Lost & Found"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            onChange(slugify(event.target.value))
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && newSlug && !existing) {
              event.preventDefault()
              acceptNew()
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
      </div>
      <input type="hidden" name="section" value={value} />

      {open && (matches.length > 0 || (newSlug && !existing)) && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
          {matches.map((category) => (
            <button
              key={category.slug}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(category)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {category.name}
              {category.slug === value && <Check className="h-4 w-4" aria-hidden />}
            </button>
          ))}
          {newSlug && !existing && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={acceptNew}
              className="flex w-full items-center gap-2 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add “{query.trim()}” as a new category
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

const field =
  'w-full rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus-within:ring-2 focus-within:ring-indigo-500/40'