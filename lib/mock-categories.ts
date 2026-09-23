// TEMPORARY placeholder data for /categories.
// `slug` matches resources.section, so a category card links to /?tag=<slug>.
// Counts will come from: select section, count(*) from resources group by section.

export type IconKey =
  | 'panels'
  | 'terminal'
  | 'database'
  | 'cloud'
  | 'sparkles'
  | 'layers'
  | 'book'
  | 'briefcase'
  | 'calendar'
  | 'compass'
  | 'graduation'
  | 'heart'
  | 'map'
  | 'trophy'
  | 'wrench'
export type Tone = 'blue' | 'green' | 'violet' | 'orange' | 'rose' | 'cyan'

export type Category = {
  slug: string
  name: string
  description: string
  count: number
  group: 'web' | 'cloud' | 'ai'
  tone: Tone
  icon: IconKey
  chips: string[]
}

export type Collection = {
  slug: string
  title: string
  description: string
  badge: 'Staff Pick' | 'Trending'
  links: number
  icon: IconKey
  tone: Tone
}

export const categoryGroups = [
  { label: 'All Stacks', value: '' },
  { label: 'Web Dev', value: 'web' },
  { label: 'Cloud & Infra', value: 'cloud' },
  { label: 'AI & Models', value: 'ai' },
]

export const mockCategories: Category[] = [
  {
    slug: 'frontend',
    name: 'Study & Presentation Tools',
    description: 'Notes, slides & diagrams',
    count: 420,
    group: 'web',
    tone: 'blue',
    icon: 'panels',
    chips: ['Notion', 'Canva', 'Figma', 'Miro'],
  },
  {
    slug: 'backend',
    name: 'Projects & Collaboration',
    description: 'Build together on campus',
    count: 312,
    group: 'web',
    tone: 'green',
    icon: 'terminal',
    chips: ['GitHub', 'Drive', 'Trello', 'Discord'],
  },
  {
    slug: 'databases',
    name: 'Campus Essentials',
    description: 'Everyday student resources',
    count: 185,
    group: 'cloud',
    tone: 'blue',
    icon: 'database',
    chips: ['Transport', 'Food', 'Printing', 'Maps'],
  },
  {
    slug: 'devops',
    name: 'Events & Opportunities',
    description: 'Clubs, contests & careers',
    count: 148,
    group: 'cloud',
    tone: 'green',
    icon: 'cloud',
    chips: ['Hackathons', 'Internships', 'Clubs', 'Scholarships'],
  },
  {
    slug: 'ai',
    name: 'Lost & Found',
    description: 'Help return missing items',
    count: 290,
    group: 'ai',
    tone: 'blue',
    icon: 'sparkles',
    chips: ['ID Cards', 'Books', 'Electronics', 'Keys'],
  },
  {
    slug: 'system-design',
    name: 'Student Life',
    description: 'Questions and quick help',
    count: 94,
    group: 'cloud',
    tone: 'green',
    icon: 'layers',
    chips: ['Roommates', 'Group Orders', 'Notes', 'Travel'],
  },
]

export const mockCollections: Collection[] = [
  {
    slug: 'system-design-essentials',
    title: 'The College Starter Kit',
    description: 'Planning, presentations, study apps, and campus shortcuts',
    badge: 'Staff Pick',
    links: 18,
    icon: 'layers',
    tone: 'blue',
  },
  {
    slug: 'supabase-starter-kit',
    title: 'Student Life Quick Links',
    description: 'Food, transport, events, discounts, and useful campus services',
    badge: 'Trending',
    links: 12,
    icon: 'database',
    tone: 'green',
  },
]