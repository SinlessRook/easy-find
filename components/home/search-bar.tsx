'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'

type Props = {
  defaultValue?: string
  total?: number // shown in the placeholder, e.g. "Search 2,400+ ..."
}

export default function SearchBar({ defaultValue = '', total }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const placeholder =
    total !== undefined
      ? `Search ${new Intl.NumberFormat('en-US').format(total)}+ student links...`
      : 'Search student links...'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/40"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search student resources"
        className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-500"
      />
      {/* Filters: wired up in the search-and-filter step */}
      <button
        type="button"
        aria-label="Filters"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </form>
  )
}