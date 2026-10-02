// TEMPORARY placeholder data for /categories/[slug].
// `section` matches the category slug (resources.section in the database).
// "Helpful score" is derived: upvotes / (upvotes + downvotes).

export type ResourceKind = 'docs' | 'tutorial' | 'opensource' | 'boilerplate'
export type TagTone = 'green' | 'indigo' | 'slate'

export type CategoryResource = {
  id: string
  section: string
  kind: ResourceKind
  title: string
  description: string
  url: string
  tag: string // small pill, e.g. "Caching"
  tagTone: TagTone
  upvotes: number
  downvotes: number
  userVote: -1 | 0 | 1 // the signed-in user's vote (from the votes table)
  isSaved?: boolean
  createdAt: string
  author: { username: string; avatarUrl?: string | null }
}

export const kindTabs = [
  { label: 'All', value: '' },
  { label: 'Official Docs', value: 'docs' },
  { label: 'Tutorials', value: 'tutorial' },
  { label: 'Open Source', value: 'opensource' },
  { label: 'Boilerplates', value: 'boilerplate' },
]

// Word used in the filter placeholder: "Filter database resources..."
export const filterNoun: Record<string, string> = {
  frontend: 'frontend',
  backend: 'backend',
  databases: 'database',
  devops: 'DevOps',
  ai: 'AI',
  'system-design': 'system design',
}

const ago = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

export const mockCategoryResources: CategoryResource[] = [
  {
    id: 'db-1',
    section: 'databases',
    kind: 'docs',
    title: 'Exam Revision Checklist and Weekly Study Planner',
    description:
      'A practical checklist for breaking a difficult syllabus into weekly goals, revision blocks, and manageable tasks.',
    url: 'https://www.notion.so/templates/category/student',
    tag: 'Study Planning',
    tagTone: 'green',
    upvotes: 188,
    downvotes: 4,
    userVote: 1,
    createdAt: ago(2),
    author: { username: 'ken_architect' },
  },
  {
    id: 'db-2',
    section: 'databases',
    kind: 'opensource',
    title: 'Shared Drive Templates for College Projects',
    description:
      'Organise research, meeting notes, presentations, and final submissions so every teammate can find the latest file.',
    url: 'https://support.google.com/drive/answer/2424384',
    tag: 'Collaboration',
    tagTone: 'indigo',
    upvotes: 150,
    downvotes: 8,
    userVote: 0,
    createdAt: ago(4),
    author: { username: 'elena_db' },
  },
  {
    id: 'db-3',
    section: 'databases',
    kind: 'tutorial',
    title: 'How to Find Affordable Student Travel Options',
    description:
      'A useful starting point for comparing student discounts, public transport routes, and shared rides around campus.',
    url: 'https://www.studentbeans.com/student-discount/',
    tag: 'Campus Life',
    tagTone: 'slate',
    upvotes: 105,
    downvotes: 10,
    userVote: 0,
    createdAt: ago(7),
    author: { username: 'marco_tech' },
  },
  {
    id: 'fe-1',
    section: 'frontend',
    kind: 'docs',
    title: 'Free Presentation and Poster Design Templates',
    description:
      'Ready-to-edit templates for seminars, club announcements, project demos, and internship presentations.',
    url: 'https://www.canva.com/education/',
    tag: 'Presentations',
    tagTone: 'indigo',
    upvotes: 132,
    downvotes: 6,
    userVote: 0,
    createdAt: ago(3),
    author: { username: 'alex_dev' },
  },
  {
    id: 'fe-2',
    section: 'frontend',
    kind: 'tutorial',
    title: 'Find Teammates for Hackathons and College Projects',
    description:
      'Tips for finding classmates with complementary skills and setting up a simple shared task board.',
    url: 'https://trello.com/templates/education',
    tag: 'Teamwork',
    tagTone: 'green',
    upvotes: 96,
    downvotes: 9,
    userVote: 0,
    createdAt: ago(9),
    author: { username: 'sarah_k' },
  },
]