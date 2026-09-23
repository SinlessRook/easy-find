'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ThumbsUp,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AvatarProps = { name: string; tone?: string; className?: string }

function Avatar({ name, tone = 'bg-indigo-100 text-indigo-700', className }: AvatarProps) {
  return (
    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold', tone, className)}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {children}
    </button>
  )
}

export default function QueryDetail() {
  const [votes, setVotes] = useState(28)
  const [voted, setVoted] = useState(false)
  const [watching, setWatching] = useState(false)
  const [reply, setReply] = useState('')

  function toggleVote() {
    setVoted((value) => !value)
    setVotes((value) => value + (voted ? -1 : 1))
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'Query details', url: window.location.href })
      else await navigator.clipboard.writeText(window.location.href)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#fbfbff] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-[#fbfbff]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <IconButton label="Go back">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </IconButton>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 text-white shadow-sm shadow-indigo-500/30">
              <MessageCircle className="h-4 w-4" aria-hidden />
            </span>
            <h1 className="text-lg font-bold">Query Details</h1>
          </div>
          <div className="flex items-center gap-1">
            <IconButton label="Share query" onClick={share}>
              <Share2 className="h-5 w-5" aria-hidden />
            </IconButton>
            <Avatar name="me" tone="bg-amber-100 text-amber-800" className="h-9 w-9 text-xs" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16">
        <section className="border-b border-slate-100 py-5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-indigo-700">
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
                Status: Active
              </span>
              <span className="text-slate-500">Expires in 2 days</span>
            </div>
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden /> ID: 09XY-8921
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name="David" tone="bg-slate-200 text-slate-700" />
              <div>
                <p className="font-semibold text-slate-900">@david_dev</p>
                <p className="text-xs text-slate-500">Asked 4 hours ago · Pro Curator</p>
              </div>
            </div>
            <button type="button" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600">
              <UserRound className="h-4 w-4" aria-hidden /> Contact
            </button>
          </div>

          <h2 className="mt-6 text-[26px] font-bold leading-tight tracking-tight text-slate-950">
            How to structure Cron Job for hourly query cleanup with Supabase Edge Functions?
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-600">
            I have a table storing temporary queries with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px]">expiryDate</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px]">createdAt</code>. What&apos;s the best practice to trigger a cleanup cron job every hour without spiking database CPU? Should I use pg_cron or an external webhook scheduler?
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Supabase', 'CronJob', 'Postgres', '#Performance'].map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{tag}</span>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-5 text-sm text-slate-500">
            <button type="button" onClick={toggleVote} className={cn('flex items-center gap-1.5 font-semibold', voted ? 'text-indigo-600' : 'hover:text-indigo-600')}>
              <ThumbsUp className={cn('h-4 w-4', voted && 'fill-current')} aria-hidden /> {votes}
            </button>
            <button type="button" onClick={share} className="flex items-center gap-1.5 font-semibold hover:text-indigo-600">
              <Share2 className="h-4 w-4" aria-hidden /> Share
            </button>
            <button type="button" onClick={() => setWatching((value) => !value)} className={cn('flex items-center gap-1.5 font-semibold', watching ? 'text-indigo-600' : 'hover:text-indigo-600')}>
              <Bell className={cn('h-4 w-4', watching && 'fill-current')} aria-hidden /> {watching ? 'Watching' : 'Watch'}
            </button>
          </div>
        </section>

        <section className="py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Community Answers <span className="ml-1 text-sm font-medium text-slate-400">5</span></h2>
            <button type="button" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
              Sort by: Top Solution <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <article className="mt-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm shadow-slate-200/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name="Elena" tone="bg-rose-100 text-rose-700" />
                <div>
                  <p className="font-semibold">@elena_db <span className="ml-1 text-xs font-normal text-slate-400">Senior Architect</span></p>
                  <p className="text-xs text-slate-500">Answered 3 hours ago</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Verified Solution</span>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">Use Supabase&apos;s built-in <code className="font-mono text-[13px]">pg_cron</code> extension directly inside your database migration. This avoids HTTP network overhead completely and schedules native Postgres tasks cleanly without spiking cold-start runtimes.</p>
            <div className="mt-4 overflow-hidden rounded-xl bg-slate-950 text-slate-200">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-slate-400"><span className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5" aria-hidden /> migration.sql</span><button type="button" className="hover:text-white">Copy</button></div>
              <pre className="overflow-x-auto p-4 text-[11px] leading-6"><code>{`-- Enable pg_cron and schedule hourly job\nSELECT cron.schedule(\n  'cleanup-temp-queries',\n  '0 * * * *',\n  $$DELETE FROM queries WHERE expiry_date < now()$$\n);`}</code></pre>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">This runs internally at microsecond query speeds. Make sure to index <code className="font-mono text-[13px]">expiry_date</code> for immediate vacuum performance.</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
              <button type="button" className="hover:text-indigo-600">Reply (2)</button>
              <button type="button" className="flex items-center gap-1 hover:text-indigo-600"><Heart className="h-3.5 w-3.5" aria-hidden /> Accepted by David</button>
            </div>
          </article>

          <article className="border-b border-slate-100 py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><Avatar name="Alex" tone="bg-cyan-100 text-cyan-700" /><div><p className="font-semibold">@alex_dev <span className="ml-1 text-xs font-normal text-slate-400">Contributor</span></p><p className="text-xs text-slate-500">1 hour ago</p></div></div>
              <button type="button" aria-label="More answer options" className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="h-5 w-5" aria-hidden /></button>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">If you ever need external notifications, an Edge Function triggered by a GitHub Action or webhook scheduler is a good fallback. But for raw speed inside PostgreSQL, Elena&apos;s <code className="font-mono text-[13px]">pg_cron</code> solution is by far the leanest.</p>
            <button type="button" className="mt-4 text-xs font-semibold text-slate-500 hover:text-indigo-600">Reply (0)</button>
          </article>

          <div className="mt-6 rounded-2xl bg-indigo-50 p-4">
            <label htmlFor="reply" className="mb-2 block text-sm font-semibold text-slate-900">Join the discussion</label>
            <textarea id="reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Share your experience or ask a follow-up..." rows={3} className="w-full resize-none rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-1 ring-indigo-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400" />
            <div className="mt-3 flex justify-end"><button type="button" disabled={!reply.trim()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Post answer</button></div>
          </div>
        </section>
      </main>
    </div>
  )
}