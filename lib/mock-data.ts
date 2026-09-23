// TEMPORARY: types + placeholder data so the landing page renders.
// Replaced by lib/read/resources.ts and lib/read/queries.ts in the read-layer step.

export type Resource = {
  id: string
  title: string
  description: string
  url: string
  sections: string[] // matches the tag values, e.g. 'frontend'
  score: number // upvotes - downvotes
  createdAt: string // ISO date
  verified?: boolean
  author: { username: string; avatarUrl?: string | null }
}

export type Query = {
  id: string
  title: string
  status: 'open' | 'solved'
  createdAt: string
  expiresAt: string
  answers: number
  participants: string[] // usernames, for the avatar stack
  author: { username: string }
}

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString()
const HOUR = 60 * 60 * 1000
const MIN = 60 * 1000
const DAY = 24 * HOUR

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Best Free Tools for Making College Presentations',
    description:
      'A practical collection of Canva, Figma, and diagram tools for creating clear project presentations and seminar slides.',
    url: 'https://www.canva.com/education/',
    sections: ['frontend'],
    score: 142,
    createdAt: ago(3 * HOUR),
    verified: true,
    author: { username: 'alex_dev' },
  },
  {
    id: '2',
    title: 'Student Discount and Education Apps Directory',
    description:
      'Find useful student plans for cloud storage, design software, coding practice, and productivity without paying full price.',
    url: 'https://www.studentbeans.com/student-discount/',
    sections: ['ai'],
    score: 98,
    createdAt: ago(5 * HOUR),
    author: { username: 'sarah_k' },
  },
  {
    id: '3',
    title: 'Free Habit and Study Planner Templates',
    description:
      'Simple weekly planners and revision trackers for managing lectures, assignments, exams, and personal projects.',
    url: 'https://www.notion.so/templates/category/student',
    sections: ['devops'],
    score: 76,
    createdAt: ago(8 * HOUR),
    author: { username: 'dev_marcus' },
  },
]

export const mockQueries: Query[] = [
  {
    id: '1',
    title: 'Anyone up for a group Swiggy order from campus tonight?',
    status: 'open',
    createdAt: ago(12 * MIN),
    expiresAt: fromNow(3 * DAY),
    answers: 6,
    participants: ['ak', 'rv'],
    author: { username: 'david_dev' },
  },
  {
    id: '2',
    title: 'Lost my black calculator near the library study area',
    status: 'solved',
    createdAt: ago(2 * HOUR),
    expiresAt: fromNow(2 * DAY),
    answers: 14,
    participants: ['jd', 'mk'],
    author: { username: 'priya_pg' },
  },
]

export const tags = [
  { label: 'All', value: '' },
  { label: 'Trending', value: 'trending' },
  { label: 'Study Tools', value: 'frontend' },
  { label: 'Projects', value: 'backend' },
  { label: 'Campus Life', value: 'devops' },
  { label: 'Opportunities', value: 'ai' },
]