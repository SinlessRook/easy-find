import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CloseButton, PostSheet } from '@/components/new-post/new-post-chrome'
import PostTypeTabs from '@/components/new-post/post-type-tabs'
import ResourceForm from '@/components/new-post/resource-form'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import SignInDialog from '@/components/auth/sign-in-dialog'

export const metadata: Metadata = { title: 'Share a resource | EzyFind' }

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const { section } = await searchParams

  const supabase = await createClient()
  const [authResult, sectionsResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('distinct_sections').select('section').order('section'),
  ])
  const { data: { user } } = authResult

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar user={null} subtitle="Share Resource" showSignIn={false} />
        <main className="grid min-h-[calc(100vh-72px)] place-items-center px-5 pb-32">
          <SignInDialog autoOpen hideTrigger next="/resources/new" />
        </main>
        <BottomBar user={null} />
      </div>
    )
  }

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null

  const sections = (sectionsResult.data ?? []).map((row) => ({
    slug: row.section,
    name: row.section.replace(/-/g, ' ').replace(/\b\w/g, (character: string) => character.toUpperCase()),
  }))

  // Only accept a ?section= that matches a real section
  const defaultSection = sections.find((item) => item.slug === section)?.slug ?? ''

  return (
    <PostSheet closeHref="/">
      <TopBar
        user={{
          name: (user.user_metadata?.full_name as string | undefined) ?? user.email,
          avatarUrl,
        }}
        subtitle="Share Resource"
      />
      <div data-sheet-overlay className="fixed inset-0 z-10 bg-slate-950/45" aria-hidden />
      <main data-sheet-panel className="relative z-20 mx-auto mt-20 max-w-xl space-y-5 rounded-t-[2rem] bg-white px-5 pb-28 pt-4 shadow-2xl ring-1 ring-black/5">
        <div data-sheet-drag-handle className="flex touch-none items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-950">
            <span className="h-2 w-2 rounded-full bg-slate-950" aria-hidden />
            Share with your campus
          </p>
          <CloseButton href="/" />
        </div>

        <PostTypeTabs active="resource" />

        <ResourceForm
          categories={sections}
          defaultSection={defaultSection}
        />
      </main>
      <BottomBar user={user} />
    </PostSheet>
  )
}