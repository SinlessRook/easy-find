import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { api } from '@/lib/axios'
import { CloseButton } from '@/components/new-post/new-post-chrome'
import PostTypeTabs from '@/components/new-post/post-type-tabs'
import QueryForm from '@/components/new-post/query-form'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import SignInDialog from '@/components/auth/sign-in-dialog'

export const metadata: Metadata = { title: 'Ask a query | EzyFind' }

export default async function NewQueryPage({
	searchParams,
}: {
	searchParams: Promise<{ section?: string }>
}) {
	const { section } = await searchParams
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return (
			<div className="min-h-screen bg-slate-50">
				<TopBar user={null} subtitle="Ask a Query" showSignIn={false} />
				<main className="grid min-h-[calc(100vh-72px)] place-items-center px-5 pb-32">
					<SignInDialog autoOpen hideTrigger next="/queries/new" />
				</main>
				<BottomBar user={null} />
			</div>
		)
	}

	const { data: profile } = await supabase
		.from('users')
		.select('username')
		.eq('id', user.id)
		.single()
	const sectionsResponse = await api.get<{ data: { slug: string; name: string }[] }>('/sections')
	const sections = sectionsResponse.data.data

	const avatarUrl =
		(user.user_metadata?.avatar_url as string | undefined) ??
		(user.user_metadata?.picture as string | undefined) ??
		null
	const defaultSection = sections.find((category) => category.slug === section)?.slug ?? ''

	return (
		<div data-post-sheet className="min-h-screen bg-slate-50">
			<TopBar
				user={{
					name: (user.user_metadata?.full_name as string | undefined) ?? user.email,
					avatarUrl,
				}}
				subtitle="Ask a Query"
			/>
			<div data-sheet-overlay className="fixed inset-0 z-10 bg-slate-900/35" aria-hidden />
			<main data-sheet-panel className="relative z-20 mx-auto mt-20 max-w-xl space-y-5 rounded-t-[2rem] bg-white px-5 pb-28 pt-4 shadow-2xl ring-1 ring-black/5">
				<div className="flex items-center justify-between">
					<p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-700">
						<span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
						   Ask your campus community
					</p>
					<CloseButton href="/queries" />
				</div>
				<PostTypeTabs active="query" />
				<QueryForm
					categories={sections}
					defaultSection={defaultSection}
					author={{
						username: profile?.username ?? user.email?.split('@')[0] ?? 'you',
						avatarUrl,
					}}
				/>
			</main>
				<BottomBar user={user} />
		</div>
	)
}