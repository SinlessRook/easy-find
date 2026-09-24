import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import Container from '@/components/home/container'
import SplashScreen from '@/components/auth/splash-screen'
import { api } from '@/lib/axios'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
const { q = '', tag = '' } = await searchParams

const term = q.toLowerCase()

const supabase = await createClient()
const [authResult, response, queriesResponse] = await Promise.all([
  supabase.auth.getUser(),
  api.get('/resources', { params: { top: true, limit: 6 } }),
  api.get('/queries'),
])

const { data: { user } } = authResult

let resources = response.data.data
  if (tag === 'trending') resources = [...resources].sort((a, b) => b.score - a.score)
  const queries = queriesResponse.data.data
    .map((query: {
      id: string
      title: string
      created_at: string
      expiry_date: string
      created_by: string
    }) => ({
      id: query.id,
      title: query.title,
      status: 'open' as const,
      createdAt: query.created_at,
      expiresAt: query.expiry_date,
      answers: 0,
      participants: [],
      author: { username: query.created_by },
    }))
    .filter((query: { title: string }) => !term || query.title.toLowerCase().includes(term))

  const content = (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        user={
          user
            ? {
                name: user.user_metadata?.full_name ?? user.email,
                avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
              }
            : null
        }
      />

      <main className="mx-auto max-w-xl space-y-4 px-4 pb-32 pt-4">
        <Container resources={resources.slice(0, 6)} queries={queries.slice(0, 2)} />
      </main>

      <BottomBar user={user} />
    </div>
  )

  return user ? content : <SplashScreen>{content}</SplashScreen>
}