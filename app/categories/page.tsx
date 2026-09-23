import { getTopBarUser } from '@/lib/get-user'
import { Category } from '@/lib/mock-categories'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import CategoriesBrowser from '@/components/categories/categories-browser'
import {api} from "@/lib/axios"

export const metadata = { title: 'Categories | EzyFind' }

export default async function CategoriesPage() {
  const user = await getTopBarUser()
  const response = await api.get<{ data: Category[] }>('/sections')
  const categories = response.data.data
  return (
    <div className="min-h-screen bg-white">
      <TopBar user={user} subtitle="Categories" showSignIn={false} />

      <main className="mx-auto max-w-xl px-4 pb-32 pt-7">
        <CategoriesBrowser categories={categories} />
      </main>

      <BottomBar user={user} />
    </div>
  )
}