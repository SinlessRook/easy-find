import Link from 'next/link'
import { MessageSquare, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Two routes, one shared look: /resources/new and /queries/new.
export default function PostTypeTabs({ active }: { active: 'resource' | 'query' }) {
  const base = 'flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold touch-manipulation'
  return (
    <nav aria-label="Post type" className="grid grid-cols-2 gap-1 rounded-2xl bg-indigo-100/70 p-1.5">
      <Link
        href="/resources/new"
        aria-current={active === 'resource' ? 'page' : undefined}
        className={cn(base, active === 'resource' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
      >
        <Share2 className="h-5 w-5" aria-hidden />
        Share Tool
      </Link>
      <Link
        href="/queries/new"
        aria-current={active === 'query' ? 'page' : undefined}
        className={cn(base, active === 'query' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
      >
        <MessageSquare className="h-5 w-5" aria-hidden />
        Ask
      </Link>
    </nav>
  )
}