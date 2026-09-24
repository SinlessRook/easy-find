'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = { slug: string; name: string }

type Props = {
  categories: Category[]
  defaultSection: string
  error?: string
  onChange?: (section: string) => void
  limit?: number
}

export default function CategoryMultiSelect({ categories, defaultSection, error, onChange, limit=3 }: Props) {
  const initial = categories.some((category) => category.slug === defaultSection) ? [defaultSection] : []
  const [selected, setSelected] = useState(initial)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
const matches = useMemo(() => {
  const term = query.trim().toLowerCase()
  if (!term) return []

  const found = categories.filter(
    (category) =>
      !selected.includes(category.slug) &&
      (category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term))
  )

  const rank = (name: string) => (name.toLowerCase().startsWith(term) ? 0 : 1)
  found.sort((a, b) => rank(a.name) - rank(b.name))

  return found.slice(0, limit)
}, [categories, query, selected, limit])
  const newCategoryName = query.trim()
  const newCategorySlug = newCategoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const canAddCategory = Boolean(
    newCategoryName &&
      newCategorySlug &&
      !categories.some((category) => category.slug === newCategorySlug || category.name.toLowerCase() === newCategoryName.toLowerCase())
  )

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    onChange?.(selected[0] ?? '')
  }, [onChange, selected])

  function toggle(slug: string) {
    setSelected((current) => current.includes(slug)
      ? current.filter((value) => value !== slug)
      : [...current, slug])
  }

  function addCategory() {
    if (!canAddCategory) return
    toggle(newCategorySlug)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={cn(field, 'flex min-h-[54px] flex-wrap items-center gap-2 pr-3', error && 'ring-2 ring-red-200')}
        onClick={() => setOpen(true)}
      >
        {selected.map((slug) => {
          const category = categories.find((item) => item.slug === slug)
          const name = category?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
          return (
            <span key={slug} className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              {name}
              <button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(slug)} className="rounded-full hover:bg-indigo-200">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          )
        })}
        <input
          id="section"
          type="text"
          value={query}
          required={selected.length === 0}
          autoComplete="off"
          placeholder={selected.length ? 'Add another category' : 'Choose categories'}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && matches[0]) {
              event.preventDefault()
              toggle(matches[0].slug)
              setQuery('')
              setOpen(false)
            }
          }}
          className="min-w-28 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
      </div>
      <input type="hidden" name="section" value={selected[0] ?? ''} />

      {open && (matches.length > 0 || canAddCategory) && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
          {canAddCategory && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={addCategory}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add &ldquo;{newCategoryName}&rdquo;
            </button>
          )}
          {matches.map((category) => {
            const active = selected.includes(category.slug)
            return (
              <button
                key={category.slug}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => { toggle(category.slug); setQuery('') }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>
                  {category.name}
                </span>
                {active && <Check className="h-4 w-4" aria-hidden />}
              </button>
            )
          })}
        </div>
      )}
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

const field =
  'w-full rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus-within:ring-2 focus-within:ring-indigo-500/40'