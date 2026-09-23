import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { IconKey, Tone } from '@/lib/mock-categories'

const iconKeys: IconKey[] = [
  'panels',
  'terminal',
  'database',
  'cloud',
  'sparkles',
  'layers',
  'book',
  'briefcase',
  'calendar',
  'compass',
  'graduation',
  'heart',
  'map',
  'trophy',
  'wrench',
]
const tones: Tone[] = ['blue', 'green', 'violet', 'orange', 'rose', 'cyan']

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('distinct_sections')
    .select('section')
    .order('section')

  if (error) {
    console.error('GET /api/v1/sections failed:', error)

    return NextResponse.json(
      {
        error: {
          code: 'server_error',
          message: 'Could not load sections.',
        },
      },
      { status: 500 }
    )
  }

  const categories = data.map((row) => ({
    slug: row.section,
    name: row.section.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: 'Notes, slides & diagrams',
    count: 0,
    group: 'web',
    tone: randomItem(tones),
    icon: randomItem(iconKeys),
    chips: [],
  }))

  return NextResponse.json({ data: categories })
}