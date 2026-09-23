'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import GoogleButton from '@/components/auth/google-button'

type Props = {
  next?: string
  children?: ReactNode
  label?: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  autoOpen?: boolean
  hideTrigger?: boolean
}

export default function SignInDialog({
  next = '/',
  children,
  label = 'Sign in',
  className = 'rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800',
  open: controlledOpen,
  onOpenChange,
  autoOpen = false,
  hideTrigger = false,
}: Props) {
  const [localOpen, setLocalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = controlledOpen ?? localOpen

  function setOpen(value: boolean) {
    setLocalOpen(value)
    onOpenChange?.(value)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (autoOpen) setLocalOpen(true)
  }, [autoOpen])

  useEffect(() => {
    if (!open) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {!isControlled && !hideTrigger && (
        <button type="button" onClick={() => setOpen(true)} className={className}>
          {children ?? label}
        </button>
      )}

      {mounted && open && createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[9999] grid min-h-screen min-w-full place-items-center overflow-y-auto bg-slate-950/55 p-5 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
            event.stopPropagation()
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-title"
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close sign in dialog"
              onClick={(event) => {
                event.stopPropagation()
                setOpen(false)
              }}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <div className="pr-8">
              <h2 id="sign-in-title" className="font-serif text-3xl font-black tracking-[-0.04em] text-slate-950">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Sign in with Google to save tools, vote, and post queries.
              </p>
            </div>
            <div className="mt-6">
              <GoogleButton next={next} />
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  )
}
