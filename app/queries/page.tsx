import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/layout/top-bar'
import BottomBar from '@/components/layout/bottom-bar'
import { getTopBarUser } from '@/lib/get-user'
import QueryList from '@/components/query/query-list'
import AddQueryButton from '@/components/query/add-query-button'
import { api } from '@/lib/axios'

export const metadata: Metadata = { title: 'Queries | EzyFind' }

export default async function QueriesPage() {
  const [user, response] = await Promise.all([
    getTopBarUser(),
    api.get('/queries'),
  ])
  const contactByQuery = new Map<string, string | null>()
  if (user?.id && response.data.data.length > 0) {
    const supabase = await createClient()
    const { data: contactRows } = await supabase
      .from('queries')
      .select('id, contact_num')
      .in('id', response.data.data.map((query: { id: string }) => query.id))

    for (const row of contactRows ?? []) contactByQuery.set(row.id, row.contact_num)
  }

  const queries = response.data.data.map((query: {
    id: string
    title: string
    description: string | null
    created_at: string
    expiry_date: string
    created_by: string
    contact_num: string | null
  }) => ({
    id: query.id,
    title: query.title,
    description: query.description,
    status: 'open' as const,
    createdAt: query.created_at,
    expiresAt: query.expiry_date,
    answers: 0,
    participants: [],
    createdBy: query.created_by,
    contactNum: contactByQuery.get(query.id) ?? query.contact_num,
    author: { username: query.created_by },
  }))
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar user={user} subtitle="Queries" />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-32 pt-5">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Community Queries</h1>
          <p className="mt-1 text-sm text-slate-500">Find classmates, coordinate plans, and get quick campus help.</p>
        </header>
        <QueryList queries={queries} currentUserId={user?.id} />
      </main>
      <AddQueryButton />
      <BottomBar user={user} />
    </div>
  )
}