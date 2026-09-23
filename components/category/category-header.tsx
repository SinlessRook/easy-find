import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CategoryHeader({ name, count }: { name: string; count: number }) {
  return (
    <header className="flex items-center gap-3">
      <nav aria-label="Breadcrumb">
        <Link
          href="/categories"
          aria-label="Back to categories"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
      </nav>

      <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{name}</h1>
      <span className="sr-only">{new Intl.NumberFormat('en-US').format(count)} links</span>
    </header>
  )
}