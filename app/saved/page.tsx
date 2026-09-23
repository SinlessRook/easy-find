import { type SavedBrowserItem } from '../../components/saved/saved-browser'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import { getTopBarUser } from '@/lib/get-user'
import SavedBrowser from '../../components/saved/saved-browser'

const savedItems: SavedBrowserItem[] = [
  {
    title: 'Notion Student Planner',
    href: 'https://www.notion.so/templates/category/student',
    tone: 'bg-slate-900 text-white',
    kind: 'Tool',
  },
  {
    title: 'Canva Education',
    href: 'https://www.canva.com/education/',
    tone: 'bg-cyan-100 text-cyan-700',
    kind: 'Tool',
  },
  {
    title: 'Google Drive Project Folder',
    href: 'https://drive.google.com/',
    tone: 'bg-blue-100 text-blue-700',
    kind: 'Tool',
  },
  {
    title: 'Find teammates for a project',
    href: '/queries',
    tone: 'bg-amber-100 text-amber-700',
    kind: 'Query',
  },
  {
    title: 'Group Swiggy order tonight',
    href: '/queries',
    tone: 'bg-rose-100 text-rose-700',
    kind: 'Query',
  },
  {
    title: 'Lost calculator near the library',
    href: '/queries',
    tone: 'bg-emerald-100 text-emerald-700',
    kind: 'Query',
  },
]

export const metadata = { title: 'Saved | EzyFind' }

export default async function SavedPage() {
  const user = await getTopBarUser()

  return (
    <div className="min-h-screen bg-white">
      <TopBar user={user} subtitle="Saved" />

      <main className="mx-auto max-w-xl space-y-5 px-4 pb-32 pt-7">
        <header>
          <h1 className="font-serif text-3xl font-black tracking-[-0.04em] text-slate-950">Saved</h1>
        </header>
        <SavedBrowser items={savedItems} />
      </main>

      <BottomBar user={user} />
    </div>
  )
}
