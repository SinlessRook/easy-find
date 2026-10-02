'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  Check,
  Link2,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/mock-categories'
import {
  categorySectionFilters,
  categoryFilterSections,
  filterValueForSection,
  filtersForSections,
} from '@/lib/category-filters'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/categories/category-icon'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .trim()

type SortMode = 'helpful-desc' | 'helpful-asc' | 'name' | 'count-desc' | 'count-asc'
type SortOption = { label: string; value: SortMode; Icon: LucideIcon }

const sortOptions: SortOption[] = [
  { label: 'Most helpful', value: 'helpful-desc', Icon: ArrowDown },
  { label: 'Least helpful', value: 'helpful-asc', Icon: ArrowUp },
  { label: 'A-Z', value: 'name', Icon: ArrowDownAZ },
  { label: 'Most links', value: 'count-desc', Icon: Link2 },
  { label: 'Fewest links', value: 'count-asc', Icon: Link2 },
]

export default function CategoriesBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sort, setSort] = useState<SortMode>('helpful-desc')
  const [openPanel, setOpenPanel] = useState<'filter' | 'sort' | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const availableFilters = useMemo(
    () => filtersForSections(categories.map((category) => category.slug)),
    [categories]
  )

  const availableSectionFilters = useMemo(
    () => categorySectionFilters.filter((filter) => categories.some((category) => category.slug === filter.value)),
    [categories]
  )

  useEffect(() => {
    const availableValues = new Set([
      ...availableFilters.map((filter) => filter.value),
      ...availableSectionFilters.map((filter) => `section:${filter.value}`),
    ])
    setActiveFilters((current) => current.filter((value) => availableValues.has(value)))
  }, [availableFilters, availableSectionFilters])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpenPanel(null)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const indexed = useMemo(
    () =>
      categories.map((category) => ({
        category,
        haystack: normalize(
          [
            category.name,
            category.slug,
            category.description,
            ...((category as { keywords?: string[] }).keywords ?? []),
          ].join(' ')
        ),
      })),
    [categories]
  )

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    const filtered = indexed
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .filter(
        ({ category }) => {
          if (activeFilters.length === 0) return true
          return activeFilters.some((value) =>
            value.startsWith('section:')
              ? category.slug === value.slice('section:'.length)
              : filterValueForSection(category.slug) === value
          )
        }
      )
      .map(({ category }) => category)

    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'helpful-asc' || sort === 'count-asc') {
        return a.count - b.count || a.name.localeCompare(b.name)
      }
      return b.count - a.count || a.name.localeCompare(b.name)
    })
  }, [activeFilters, indexed, query, sort])

  const hasQuery = query.trim().length > 0
  const hasFilters = activeFilters.length > 0

  function toggleFilter(value: string) {
    setActiveFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    )
  }

  function clearFilters() {
    setActiveFilters([])
  }

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

      <div className="flex items-center gap-4">
        <nav
          aria-label="Filter categories by topic"
          className="min-w-0 flex-1 overflow-x-auto py-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max min-w-full gap-2">
            <button
              type="button"
              aria-pressed={activeFilters.length === 0}
              onClick={() => setActiveFilters([])}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                activeFilters.length === 0
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              All
            </button>
            {availableFilters.map((filter) => {
              const active = activeFilters.includes(filter.value)
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFilter(filter.value)}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                    active
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </nav>

        <div ref={panelRef} className="relative flex shrink-0 items-center gap-2 bg-white pl-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'sort'}
            onClick={() => setOpenPanel((panel) => (panel === 'sort' ? null : 'sort'))}
            aria-label="Open sorting options"
            title="Sort categories"
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg border transition-colors',
              openPanel === 'sort'
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'filter'}
            onClick={() => setOpenPanel((panel) => (panel === 'filter' ? null : 'filter'))}
            aria-label="Open category filters"
            title="Filter categories"
            className={cn(
              'relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors',
              openPanel === 'filter' || hasFilters
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {hasFilters && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-slate-950 px-1 text-[10px] text-white ring-2 ring-white">
                {activeFilters.length}
              </span>
            )}
          </button>

          {openPanel === 'filter' && (
            <BottomSheet title="Filters" onClose={() => setOpenPanel(null)}>
              <div className="space-y-4 p-3">
                {categoryFilterSections.map((section) => {
                  const filters = section.filters
                    .map((value) => availableFilters.find((filter) => filter.value === value))
                    .filter((filter): filter is (typeof availableFilters)[number] => Boolean(filter))

                  if (filters.length === 0) return null

                  return (
                    <section key={section.label} aria-labelledby={`filter-section-${section.label}`}>
                      <h3
                        id={`filter-section-${section.label}`}
                        className="px-1 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                      >
                        {section.label}
                      </h3>
                      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
                        {filters.map((filter) => {
                          const active = activeFilters.includes(filter.value)
                          return (
                            <button
                              key={filter.value}
                              type="button"
                              role="checkbox"
                              aria-checked={active}
                              onClick={() => toggleFilter(filter.value)}
                              className={cn(
                                'flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors',
                                active ? 'bg-slate-200 font-semibold text-slate-950' : 'text-slate-700 hover:bg-white'
                              )}
                            >
                              <span
                                className={cn(
                                  'grid h-4 w-4 place-items-center rounded border bg-white',
                                  active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300'
                                )}
                              >
                                {active && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
                              </span>
                              <span>{filter.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
                {availableSectionFilters.length > 0 && (
                  <section aria-labelledby="filter-section-disciplines">
                    <h3
                      id="filter-section-disciplines"
                      className="px-1 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                    >
                      Academic disciplines
                    </h3>
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
                      {availableSectionFilters.map((filter) => {
                        const value = `section:${filter.value}`
                        const active = activeFilters.includes(value)
                        return (
                          <button
                            key={value}
                            type="button"
                            role="checkbox"
                            aria-checked={active}
                            onClick={() => toggleFilter(value)}
                            className={cn(
                              'flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors',
                              active ? 'bg-slate-200 font-semibold text-slate-950' : 'text-slate-700 hover:bg-white'
                            )}
                          >
                            <span
                              className={cn(
                                'grid h-4 w-4 place-items-center rounded border bg-white',
                                active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300'
                              )}
                            >
                              {active && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
                            </span>
                            <span>{filter.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>
              <div className="border-t border-slate-200 px-4 py-2">
                <button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-600 hover:text-slate-950">
                  Clear selected filters
                </button>
              </div>
            </BottomSheet>
          )}

          {openPanel === 'sort' && (
            <BottomSheet title="Sort by" onClose={() => setOpenPanel(null)}>
              <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:grid-cols-5">
                {sortOptions.map(({ label, value, Icon }) => {
                  const active = sort === value
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSort(value)}
                      className={cn(
                        'flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors',
                        active ? 'bg-slate-200 font-semibold text-slate-950' : 'text-slate-700 hover:bg-white'
                      )}
                    >
                      <Icon className="h-4 w-4 text-slate-500" aria-hidden />
                      <span className="flex-1">{label}</span>
                      {active && <Check className="h-4 w-4" aria-hidden />}
                    </button>
                  )
                })}
              </div>
            </BottomSheet>
          )}
        </div>
      </div>

      {hasQuery && (
        <p className="text-xs text-slate-500" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'category' : 'categories'} found
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
          {hasFilters ? 'No categories match the selected filters.' : `No categories match "${query.trim()}".`}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {visible.map((category, index) => (
            <li key={category.slug}>
              <CategoryCard category={category} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [dragOffset, setDragOffset] = useState(0)
  const startY = useRef<number | null>(null)

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    startY.current = event.touches[0]?.clientY ?? null
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (startY.current === null) return
    const distance = event.touches[0].clientY - startY.current
    if (distance > 0) setDragOffset(distance)
  }

  function handleTouchEnd() {
    if (dragOffset > 80) {
      onClose()
    }
    setDragOffset(0)
    startY.current = null
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      aria-modal="true"
      style={{ transform: `translateY(${dragOffset}px)` }}
      className="fixed inset-x-0 bottom-0 z-[9999] h-1/2 overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.2)] transition-transform duration-200"
    >
      <div
        className="relative flex h-14 touch-none select-none items-center justify-center border-b border-slate-200 bg-white px-4 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300" aria-hidden />
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
          className="absolute right-4 grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="h-[calc(50vh-56px)] overflow-y-auto bg-slate-50">
        {children}
      </div>
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

function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'flex min-h-40 h-full flex-col rounded-2xl border p-3 transition-transform hover:-translate-y-0.5 hover:shadow-md',
        tileTones[index % tileTones.length]
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/75 text-slate-950">
          <CategoryIcon name={category.icon} className="h-5 w-5" />
        </span>
        <span
          className="rounded-full bg-white/70 px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-slate-700"
          aria-label={`${category.count} resources`}
        >
          {new Intl.NumberFormat('en-US').format(category.count)}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-lg font-black leading-[1.05] tracking-[-0.03em] text-slate-950">
        {category.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-700">{category.description}</p>
      <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700">Explore</span>
    </Link>
  )
}
