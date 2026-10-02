import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import { getTopBarUser } from '@/lib/get-user'
import SavedBrowser from '../../components/saved/saved-browser'

export const metadata = { title: 'Saved | EzyFind' }

export default async function SavedPage() {
  const user = await getTopBarUser()

  return (
    <div className="min-h-screen bg-white">
      <TopBar user={user} subtitle="Saved" />

      <main className="mx-auto max-w-xl space-y-5 px-4 pb-32 pt-7">
        <header>
          <h1 className="font-serif text-3xl font-black tracking-[-0.04em] text-slate-950">
            Saved
          </h1>
        </header>
        <SavedBrowser isAuthenticated={Boolean(user)} />
      </main>

      <BottomBar user={user} />
    </div>
  )
}