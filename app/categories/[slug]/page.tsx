import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTopBarUser } from '@/lib/get-user'
import { mockCategories } from '@/lib/mock-categories'
import { filterNoun, kindTabs, mockCategoryResources } from '@/lib/mock-category-resources'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import CategoryHeader from '@/components/category/category-header'
import ResourceBrowser from '@/components/category/resource-browser'
import AddLinkButton from '@/components/category/add-link-button'
import {api} from "@/lib/axios"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = mockCategories.find((c) => c.slug === slug)
  return { title: category ? `${category.name} | EzyFind` : 'Category | EzyFind' }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

 const response = await api.get('/resources', {
  params: {
    section: slug,
  },
})
const category = response.data.data
  if (!category) notFound()

  const resources =category;
  const user = await getTopBarUser()

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar user={user} subtitle="Categories" showSignIn={false} />

      <main className="mx-auto max-w-xl space-y-4 px-4 pb-44 pt-5">
        <CategoryHeader name={category.name} count={category.count} />
        <ResourceBrowser
          resources={resources}
          tabs={kindTabs}
          noun={filterNoun[slug] ?? category.name}
        />
      </main>

      <AddLinkButton section={slug} />
      <BottomBar user={user} />
    </div>
  )
}