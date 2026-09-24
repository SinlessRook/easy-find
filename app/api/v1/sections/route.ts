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

// Fixed descriptions for the main categories. Edit these freely.
const DESCRIPTIONS: Record<string, string> = {
  'study-resources': 'Notes, courses and study material',
  'ai-tools': 'AI assistants for coding, writing and study',
  'research-tools': 'Find, read and cite research papers',
  'youtube-channels': 'Channels worth subscribing to',
  'subject-wise': 'Tools and references by subject',
  'coding-practice': 'Practice problems and contests',
  'dev-tools': 'Editors, version control and dev utilities',
  career: 'Internships, jobs and roadmaps',
  productivity: 'Notes, planning and focus tools',
  hobbies: 'Games, music and things to unwind',
  'food-delivery': 'Food and grocery delivery',
  shopping: 'Shopping and second-hand deals',
  'hostels-housing': 'Hostels, PGs and rentals',
  travel: 'Trains, buses and maps',
  'student-services': 'Results, scholarships and documents',
}

// Fallback pool for any section that has no entry above (e.g. "mathematics", "ktu").
const GENERIC_DESCRIPTIONS = [
  'Hand-picked links and tools',
  'Useful picks from the community',
  'Curated resources worth bookmarking',
  'Handy links for everyday student life',
  'Tools, guides and references',
  'Shared by students, for students',
]

// Deterministic "random": the same slug always gets the same icon, tone and description,
// so tiles don't change on every refresh (Math.random() would reshuffle them each request).
function hash(value: string) {
  let h = 7
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function pick<T>(items: T[], seed: string) {
  return items[hash(seed) % items.length]
}

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('distinct_sections')
    .select('section, count')
    .order('count', { ascending: false })
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
    description: DESCRIPTIONS[row.section] ?? pick(GENERIC_DESCRIPTIONS, row.section),
    count: Number(row.count) || 0,
    group: 'web',
    tone: pick(tones, `${row.section}:tone`),
    icon: pick(iconKeys, `${row.section}:icon`),
    chips: [],
  }))

  return NextResponse.json({ data: categories })
}