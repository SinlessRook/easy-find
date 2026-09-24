import type { ReactNode } from 'react'

function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

export function PageLoadingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto max-w-xl space-y-5">{children}</div>
    </main>
  )
}

export function HomeLoading() {
  return (
    <PageLoadingShell>
      <div className="flex items-center justify-between"><Bar className="h-8 w-32" /><Bar className="h-9 w-9 rounded-full" /></div>
      <Bar className="h-64 w-full rounded-[22px]" />
      <Bar className="h-8 w-40" />
      <div className="flex gap-3 overflow-hidden">{Array.from({ length: 3 }).map((_, index) => <Bar key={index} className="h-40 w-52 shrink-0 rounded-xl" />)}</div>
    </PageLoadingShell>
  )
}

export function CategoriesLoading() {
  return (
    <PageLoadingShell>
      <div className="flex items-center justify-between"><Bar className="h-8 w-32" /><Bar className="h-9 w-9 rounded-full" /></div>
      <Bar className="h-10 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => <Bar key={index} className="h-40 rounded-2xl" />)}
      </div>
    </PageLoadingShell>
  )
}

export function ResourceListLoading() {
  return (
    <PageLoadingShell>
      <div className="flex items-center justify-between"><Bar className="h-8 w-32" /><Bar className="h-9 w-9 rounded-full" /></div>
      <Bar className="h-9 w-48" />
      <Bar className="h-10 w-full rounded-xl" />
      <div className="flex gap-2"><Bar className="h-8 w-20 rounded-full" /><Bar className="h-8 w-24 rounded-full" /><Bar className="h-8 w-24 rounded-full" /></div>
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3 py-4"><Bar className="h-16 w-16 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Bar className="h-4 w-3/4" /><Bar className="h-3 w-1/2" /><Bar className="h-3 w-full" /></div></div>
        ))}
      </div>
    </PageLoadingShell>
  )
}

export function QueriesLoading() {
  return (
    <PageLoadingShell>
      <div className="flex items-center justify-between"><Bar className="h-8 w-32" /><Bar className="h-9 w-9 rounded-full" /></div>
      <Bar className="h-8 w-56" /><Bar className="h-4 w-72" />
      <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Bar key={index} className="h-32 rounded-2xl" />)}</div>
    </PageLoadingShell>
  )
}

export function SavedLoading() {
  return (
    <PageLoadingShell>
      <div className="flex items-center justify-between"><Bar className="h-8 w-32" /><Bar className="h-9 w-9 rounded-full" /></div>
      <Bar className="h-9 w-28" />
      <div className="flex gap-2"><Bar className="h-8 w-20 rounded-full" /><Bar className="h-8 w-24 rounded-full" /><Bar className="h-8 w-28 rounded-full" /></div>
      <div className="grid grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, index) => <Bar key={index} className="aspect-square rounded-2xl" />)}</div>
    </PageLoadingShell>
  )
}

export function FormLoading() {
  return (
    <PageLoadingShell>
      <div className="mx-auto mt-16 space-y-5 rounded-t-[2rem] bg-white px-5 pb-28 pt-5 shadow-sm">
        <div className="flex items-center justify-between"><Bar className="h-5 w-48" /><Bar className="h-8 w-8 rounded-full" /></div>
        <Bar className="h-10 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="space-y-2"><Bar className="h-5 w-40" /><Bar className="h-12 w-full rounded-xl" /></div>)}
      </div>
    </PageLoadingShell>
  )
}
