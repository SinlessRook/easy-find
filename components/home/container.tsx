'use client'

import {useCallback,useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  ExternalLink,
  MessageCircle,
  MessagesSquare,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Query, Resource } from '@/lib/mock-data'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/utils'
import { api } from '@/lib/axios'
import ResourceThumbnail from './resource-thumbnail'

type Props = {
  resources: Resource[]
  queries: Query[]
  notice?: string
}

export default function Container({ resources, queries, notice }: Props) {
  return (
    <div className="space-y-10 pb-4">
      {resources.length === 0 ? (
        <Empty text="No resources match your search yet. Try another tag or add one." />
      ) : (
        <>
          <FeaturedTools resources={resources} />

          <section aria-labelledby="popular-heading">
            <SectionHeader
              id="popular-heading"
              icon={BadgeCheck}
              title="Top Tools"
              href="/categories"
              linkLabel=""
            />
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {resources.map((resource) => (
                <ToolCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="queries-heading">
        <SectionHeader
          id="queries-heading"
          icon={MessagesSquare}
          title="Campus Ask"
          href="/queries"
          linkLabel="See all"
        />
        <div className="space-y-3">
          {queries.length === 0 ? (
            <Empty text="No requests yet. Ask about campus life, group plans, or something you need help finding." />
          ) : (
            queries.map((q) => <QueryCard key={q.id} query={q} />)
          )}
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Small building blocks (private to this file)                     */
/* ---------------------------------------------------------------- */

function Notice({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-3 py-2.5 text-sm text-slate-700">
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
      <p className="min-w-0 flex-1 truncate">{text}</p>
      <Zap className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
    </div>
  )
}

function SectionHeader({
  id,
  icon: Icon,
  title,
  href,
  linkLabel,
}: {
  id: string
  icon: LucideIcon
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 id={id} className="flex items-center gap-2 font-serif text-[28px] font-black tracking-[-0.03em] text-slate-950">
        <Icon className="h-5 w-5 text-slate-950" aria-hidden />
        {title}
      </h2>
      <Link
        href={href}
        aria-label={`See all ${title}`}
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-800 hover:bg-slate-50"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
      {text}
    </p>
  )
}

const card = 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'

function FeaturedTools({ resources }: { resources: Resource[] }) {
  const [[activeIndex, direction], setSlide] = useState<[number, number]>([0, 1])
  const resource = resources[activeIndex]

  const paginate = useCallback(
    (dir: number) => {
      setSlide(([current]) => [(current + dir + resources.length) % resources.length, dir])
    },
    [resources.length],
  )

  // Depends on activeIndex, so any manual swipe/click restarts the 4.5s timer
  useEffect(() => {
    if (resources.length < 2) return
    const timer = window.setInterval(() => paginate(1), 4500)
    return () => window.clearInterval(timer)
  }, [resources.length, activeIndex, paginate])

  const slideTones = [
    'bg-[#dce6a2]',
    'bg-[#e9ddf8]',
    'bg-[#cfe8e7]',
    'bg-[#f7dfc1]',
    'bg-[#f3d6df]',
    'bg-[#dce7d0]',
  ] 

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%' }),
    center: { x: 0 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%' }),
  }

  const SWIPE_DISTANCE = 60
  const SWIPE_VELOCITY = 400

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (resources.length < 2) return
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
      paginate(1) // swiped left -> next
    } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
      paginate(-1) // swiped right -> previous
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative min-h-[280px] overflow-hidden rounded-[22px]">
        <AnimatePresence initial={false} mode="sync" custom={direction}>
          <motion.article
            key={resource.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            drag={resources.length > 1 ? 'x' : false}
            dragDirectionLock
            dragSnapToOrigin
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`absolute inset-0 touch-pan-y cursor-grab overflow-hidden rounded-[22px] p-6 active:cursor-grabbing ${slideTones[activeIndex % slideTones.length]}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#68713d_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
            <div className="relative z-10 max-w-[72%]">
              <span className="inline-block bg-[#9b65ff] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                Featured tool
              </span>
              <h1 className="mt-3 font-serif text-[34px] font-black leading-[0.96] tracking-[-0.04em] text-slate-950">
                {resource.title.slice(0, 60)}...
              </h1>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">
                {resource.description.slice(0, 100)}...
              </p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
                Try it free <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="pointer-events-none absolute -bottom-12 -right-12 grid h-48 w-48 place-items-center rounded-full bg-white/70 shadow-2xl">
              <ResourceThumbnail url={resource.url}  />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5" aria-label="Featured tool slides">
        {resources.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show featured tool ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => setSlide([index, index > activeIndex ? 1 : -1])}
            className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-slate-950' : 'w-1.5 bg-slate-300'}`}
          />
        ))}
      </div>
    </div>
  )
}

function ToolCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-[220px] shrink-0 rounded-xl border border-violet-200 bg-violet-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <ResourceThumbnail url={resource.url} />
        <ExternalLink className="h-4 w-4 text-slate-500" aria-hidden />
      </div>
      <h3 className="mt-4 line-clamp-2 font-serif text-xl font-black leading-tight text-slate-950">{resource.title}</h3>
      <div className="mt-3 flex gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700">
        <span className="rounded bg-violet-200 px-1.5 py-1">Top pick</span>
        {resource.verified && <span className="rounded bg-white px-1.5 py-1">Verified</span>}
      </div>
    </a>
  )
}

/* ---------------------------------------------------------------- */
/* Resource card                                                    */
/* ---------------------------------------------------------------- */

function ResourceCard({ resource: r }: { resource: Resource }) {
  const [userVote, setUserVote] = useState<-1 | 0 | 1>(0)
  const [score, setScore] = useState(r.score)
  const [votePending, setVotePending] = useState(false)
  useEffect(() => {
    let active = true

    async function loadUserVote() {
      try {
        const response = await api.get(`/resources/${r.id}/vote`, { timeout: 30_000 })
        if (active) setUserVote(response.data.data.userVote)
      } catch {
        // Voting still works when the initial vote lookup is unavailable.
      }
    }

    void loadUserVote()
    return () => {
      active = false
    }
  }, [r.id])

  async function submitVote(nextVote: -1 | 1) {
    if (votePending) return

    const selectedVote = userVote === nextVote ? 0 : nextVote
    const previousVote = userVote
    const previousScore = score
    const scoreDelta = selectedVote - previousVote

    setUserVote(selectedVote)
    setScore((current) => current + scoreDelta)
    setVotePending(true)

    try {
      const response = await api.post(
        `/resources/${r.id}/vote`,
        { vote: selectedVote },
        { timeout: 30_000 }
      )
      setUserVote(response.data.data.userVote)
      setScore(response.data.data.score)
    } catch {
      setUserVote(previousVote)
      setScore(previousScore)
    } finally {
      setVotePending(false)
    }
  }

  return (
    <article className={card}>
      <div className="flex items-center gap-3">
        <ResourceThumbnail url={r.url} />
        <h3 className="min-w-0 flex-1 text-lg font-bold leading-snug text-slate-900">
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 hover:underline">
            {r.title}
          </a>
        </h3>
      </div>

      <div className="mt-3 flex justify-end">
        <a
          href={`/categories/`}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          View more
        </a>
      </div>

      <footer className="mt-2.5 flex items-center justify-between gap-3">
        <div
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'flex shrink-0 items-center gap-3 rounded-full px-3.5 py-2',
            userVote === 1 ? 'bg-emerald-50 text-emerald-700' : userVote === -1 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
          )}
        >
          <button
            type="button"
            aria-label="Upvote"
            aria-pressed={userVote === 1}
            disabled={votePending}
            onClick={(event) => {
              event.stopPropagation()
              void submitVote(1)
            }}
            className="cursor-pointer disabled:cursor-wait"
          >
            <ThumbsUp className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-sm font-semibold tabular-nums">
            {score > 0 ? `+${score}` : score}
          </span>
          <button
            type="button"
            aria-label="Downvote"
            aria-pressed={userVote === -1}
            disabled={votePending}
            onClick={(event) => {
              event.stopPropagation()
              void submitVote(-1)
            }}
            className="cursor-pointer text-slate-500 disabled:cursor-wait"
          >
            <ThumbsDown className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </footer>
    </article>
  )
}

/* ---------------------------------------------------------------- */
/* Query card                                                       */
/* ---------------------------------------------------------------- */

function QueryCard({ query: q }: { query: Query }) {
  const [shared, setShared] = useState(false)

  async function shareQuery() {
    const url = typeof window === 'undefined' ? '/queries' : `${window.location.origin}/queries`
    const shareData = {
      title: q.title,
      text: `Check out this campus query: ${q.title}`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShared(true)
        window.setTimeout(() => setShared(false), 1500)
      }
    } catch {
      // The user cancelled sharing or clipboard access was unavailable.
    }
  }

  return (
    <article className={card}>
      <header className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-medium text-slate-500">@{q.author.username}</span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-slate-400">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {timeAgo(q.createdAt)}
        </span>
      </header>

      <h3 className="mt-1.5 text-lg font-bold leading-snug text-slate-900">{q.title}</h3>

      <footer className="mt-2.5 flex justify-end gap-1">
        <button
          type="button"
          aria-label="Share query"
          title="Share query"
          onClick={() => void shareQuery()}
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {shared ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
        </button>
        <Link
          href="/queries"
          aria-label="Open queries to contact the poster"
          title="Open queries"
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-green-500 hover:bg-slate-200"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </Link>
      </footer>
    </article>
  )
}