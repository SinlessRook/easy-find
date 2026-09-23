'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BookOpen, LogOut, Menu, UserRound } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import SignInDialog from '@/components/auth/sign-in-dialog'

type Props = {
  user: { id?: string; name?: string | null; avatarUrl?: string | null } | null
  subtitle?: string // small label under the logo, e.g. "Explore" or "Categories"
  showSignIn?: boolean
}

export default function TopBar({ user, subtitle = 'Explore', showSignIn = true }: Props) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <span className="leading-tight">
            <span className="block font-serif text-[25px] font-black tracking-[-0.04em] text-slate-950">
              <BookOpen className="mr-1.5 inline h-6 w-6 stroke-[2.5]" aria-hidden />
              EzyFind
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>

          {profileOpen && !user && (
            <div className="absolute right-4 top-16 z-40 min-w-36 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <Link href="/categories" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Browse tools
              </Link>
              <Link href="/queries" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Campus asks
              </Link>
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 text-slate-700 hover:ring-2 hover:ring-slate-300"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name ?? 'Your profile'}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-5 w-5" aria-hidden />
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-40 min-w-36 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Log out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : showSignIn ? (
            <SignInDialog />
          ) : null}
        </div>
      </div>
    </header>
  )
}