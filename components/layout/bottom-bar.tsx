'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Plus,
  Bookmark,
  Grid2X2,
  Home,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SignInDialog from '@/components/auth/sign-in-dialog'

type Item = { href: string; label: string; icon: LucideIcon }
type Props = { user?: { id?: string } | null }

const left: Item[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: Grid2X2 },
]
const right: Item[] = [
  { href: '/queries', label: 'Queries', icon: MessagesSquare },
  { href: '/saved', label: 'Saved', icon: Bookmark },
]

export default function BottomBar({ user }: Props) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const renderItem = ({ href, label, icon: Icon }: Item) => {
    const active = isActive(href)
    const className = cn(
      'grid h-12 w-12 place-items-center rounded-full transition-transform hover:bg-white/10 active:scale-90',
      active ? 'text-white' : 'text-white/75 hover:text-white'
    )

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={className}
        title={label}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden />
      </Link>
    )
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-3 pt-2"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 items-center rounded-full bg-slate-950 px-3 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.24)] ring-1 ring-white/10">
        {left.map(renderItem)}

        <div className="flex justify-center">
          <motion.div whileTap={{ scale: 0.9 }} className="-mt-7">
            {user ? (
              <Link
                href="/resources/new"
                aria-label="Add a resource"
                className="grid h-14 w-14 place-items-center rounded-full bg-white text-slate-950 shadow-lg ring-4 ring-slate-950 hover:bg-slate-100"
              >
                <Plus className="h-6 w-6" aria-hidden />
              </Link>
            ) : (
              <SignInDialog
                label="Sign in to add a resource"
                className="grid h-14 w-14 place-items-center rounded-full bg-white text-slate-950 shadow-lg ring-4 ring-slate-950 hover:bg-slate-100"
              >
                <Plus className="h-6 w-6" aria-hidden />
              </SignInDialog>
            )}
          </motion.div>
        </div>

        {right.map(renderItem)}
      </div>
    </nav>
  )
}