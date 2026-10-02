'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Bookmark,
  Check,
  Code,
  ExternalLink,
  Flag,
  Package,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryResource, ResourceKind } from '@/lib/mock-category-resources'
import { ApiError, api } from '@/lib/axios'
import { cn } from '@/lib/utils'
import SignInDialog from '@/components/auth/sign-in-dialog'

const kindIcon: Record<ResourceKind, LucideIcon> = {
  docs: ExternalLink,
  opensource: Code,
  tutorial: BookOpen,
  boilerplate: Package,
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function helpfulPercent(r: Pick<CategoryResource, 'upvotes' | 'downvotes'>) {
  const total = r.upvotes + r.downvotes
  return total === 0 ? 0 : Math.round((r.upvotes / total) * 100)
}

export default function CategoryResourceCard({
  resource: r,
  isSignedIn,
}: {
  resource: CategoryResource
  isSignedIn: boolean
}) {
  const LinkIcon = kindIcon[r.kind] || ExternalLink

  const [vote, setVote] = useState({
    userVote: r.userVote,
    upvotes: r.upvotes,
    downvotes: r.downvotes,
  })
  const [votePending, setVotePending] = useState(false)
  const [voteError, setVoteError] = useState('')
  const [signInOpen, setSignInOpen] = useState(false)

  const [saved, setSaved] = useState(Boolean((r as CategoryResource & { isSaved?: boolean }).isSaved))
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [justShared, setJustShared] = useState(false)

  useEffect(() => {
    setVote({
      userVote: r.userVote,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
    })
    setSaved(Boolean(r.isSaved))
  }, [r.id, r.userVote, r.upvotes, r.downvotes, r.isSaved])

  const score = vote.upvotes - vote.downvotes

  function openResource() {
    window.open(r.url, '_blank', 'noopener,noreferrer')
  }

  async function submitVote(nextVote: -1 | 1) {
    if (votePending) return
    if (!isSignedIn) {
      setSignInOpen(true)
      return
    }

    const selectedVote = vote.userVote === nextVote ? 0 : nextVote
    const previousVote = vote
    const optimisticVote = {
      userVote: selectedVote as -1 | 0 | 1,
      upvotes: vote.upvotes,
      downvotes: vote.downvotes,
    }

    if (vote.userVote === 1) optimisticVote.upvotes -= 1
    if (vote.userVote === -1) optimisticVote.downvotes -= 1
    if (selectedVote === 1) optimisticVote.upvotes += 1
    if (selectedVote === -1) optimisticVote.downvotes += 1

    setVote(optimisticVote)
    setVotePending(true)
    setVoteError('')

    try {
      const response = await api.post(
        `/resources/${r.id}/vote`,
        { vote: selectedVote },
        { timeout: 30_000 }
      )
      setVote(response.data.data)
    } catch (error) {
      setVote(previousVote)
      if (error instanceof ApiError && error.status === 401) {
        setSignInOpen(true)
      }
      setVoteError(error instanceof Error ? error.message : 'Could not save your vote.')
    } finally {
      setVotePending(false)
    }
  }

  const handleSaveClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()

    if (savePending) return

    if (!isSignedIn) {
      setSignInOpen(true)
      return
    }

    const nextSavedState = !saved
    const previousSaved = saved

    setSaved(nextSavedState)
    setSavePending(true)
    setSaveError('')

    try {
      const response = nextSavedState
        ? await api.put(`/resources/${r.id}/save`, undefined, { timeout: 30_000 })
        : await api.delete(`/resources/${r.id}/save`, { timeout: 30_000 })

      if (response.data?.data?.saved !== undefined) {
        setSaved(response.data.data.saved)
      }
    } catch (error) {
      setSaved(previousSaved)
      if (error instanceof ApiError && error.status === 401) {
        setSignInOpen(true)
      }
      setSaveError(error instanceof Error ? error.message : 'Could not save this resource.')
    } finally {
      setSavePending(false)
    }
  }

  async function shareResource() {
    const shareData = { title: r.title, text: r.description, url: r.url }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(r.url)
        setJustShared(true)
        setTimeout(() => setJustShared(false), 1500)
      }
    } catch {
      // User cancelled share
    }
  }

  return (
    <article className="group flex gap-3 bg-white py-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <BookOpen className="absolute inset-0 m-auto h-7 w-7 text-slate-300" aria-hidden />
        {domainOf(r.url) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://icons.duckduckgo.com/ip3/${domainOf(r.url)}.ico`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full rounded-lg bg-white p-2 object-contain shadow-sm transition group-hover:scale-105"
          />
        )}
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${r.title}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
        >
          <LinkIcon className="h-3 w-3 pointer-events-none" aria-hidden />
        </a>
      </div>

      <div className="min-w-0 flex-1">
        <div
          role="button"
          tabIndex={0}
          onClick={openResource}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openResource()
            }
          }}
          className="cursor-pointer text-left"
        >
          <h2 className="truncate text-sm font-semibold text-slate-900">{r.title}</h2>
          <p className="mt-1 text-xs text-slate-500">{helpfulPercent(r)}% helpful · {score > 0 ? `+${score}` : score} votes</p>
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-slate-500">{r.description}</p>
        </div>

        <footer
          onClick={(event) => event.stopPropagation()}
          className="mt-2 flex items-center justify-between"
        >
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1',
              vote.userVote === 1 ? 'bg-emerald-100 text-emerald-700' : vote.userVote === -1 ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
            )}
          >
            <button
              type="button"
              aria-label="Upvote"
              aria-pressed={vote.userVote === 1}
              aria-busy={votePending}
              disabled={votePending}
              onClick={(event) => {
                event.stopPropagation()
                void submitVote(1)
              }}
              className="cursor-pointer disabled:cursor-wait"
            >
              <ArrowUp className="h-4 w-4 pointer-events-none" aria-hidden />
            </button>
            <span className="min-w-6 text-center text-xs font-bold tabular-nums">
              {score > 0 ? `+${score}` : score}
            </span>
            <button
              type="button"
              aria-label="Downvote"
              aria-pressed={vote.userVote === -1}
              aria-busy={votePending}
              disabled={votePending}
              onClick={(event) => {
                event.stopPropagation()
                void submitVote(-1)
              }}
              className="cursor-pointer disabled:cursor-wait"
            >
              <ArrowDown className="h-4 w-4 pointer-events-none" aria-hidden />
            </button>
          </div>

          {voteError && <p role="alert" className="sr-only">{voteError}</p>}
          {saveError && <p role="alert" className="sr-only">{saveError}</p>}

          <div className="flex items-center gap-0.5 text-slate-500">
            <button
              type="button"
              aria-label="Save"
              aria-pressed={saved}
              aria-busy={savePending}
              disabled={savePending}
              onClick={handleSaveClick}
              className={cn(
                'relative z-10 pointer-events-auto grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100 disabled:cursor-wait cursor-pointer',
                saved && 'text-indigo-600'
              )}
            >
              <Bookmark className="h-3.5 w-3.5 pointer-events-none" aria-hidden fill={saved ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              aria-label="Share"
              onClick={(event) => {
                event.stopPropagation()
                void shareResource()
              }}
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100"
            >
              {justShared ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 pointer-events-none" aria-hidden />
              ) : (
                <Share2 className="h-3.5 w-3.5 pointer-events-none" aria-hidden />
              )}
            </button>

            <button
              type="button"
              aria-label="Report"
              onClick={(event) => event.stopPropagation()}
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100"
            >
              <Flag className="h-3.5 w-3.5 pointer-events-none" aria-hidden />
            </button>
          </div>
        </footer>
      </div>
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </article>
  )
}