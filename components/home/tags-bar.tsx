'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tag = { label: string; value: string }

type Props = {
  tags: Tag[]
  active?: string // current tag value, '' means "All"
  q?: string // keep the search term when switching tags
}

function hrefFor(value: string, q?: string) {
  const params = new URLSearchParams()
  if (value) params.set('tag', value)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}

export default function TagsBar({ tags, active = '', q }: Props) {
  return (
    <nav
      aria-label="Filter by tag"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tags.map((tag) => {
        const isActive = tag.value === active
        return (
          <Link
            key={tag.value || 'all'}
            href={hrefFor(tag.value, q)}
            scroll={false}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold',
              isActive
                ? 'border-transparent text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="active-tag"
                className="absolute inset-0 rounded-full bg-indigo-600"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tag.value === 'trending' && (
                <Flame
                  className={cn('h-4 w-4', isActive ? 'text-white' : 'text-orange-500')}
                  aria-hidden
                />
              )}
              {tag.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}