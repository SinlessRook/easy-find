export type CategoryFilter = {
  value: string
  label: string
  description: string
  sections: string[]
}

// Add a new section slug to the most relevant group when the API gains one.
// Sections not listed here appear under "Other" automatically.
export const categoryFilters: CategoryFilter[] = [
  {
    value: 'study',
    label: 'Study & Learning',
    description: 'Notes, courses, subjects and exam prep',
    sections: [
      'books',
      'courses',
      'exam-prep',
      'flashcards',
      'ktu',
      'languages',
      'lecture-notes',
      'online-courses',
      'question-papers',
      'reading',
    ],
  },
  {
    value: 'computer-science',
    label: 'Computer Science',
    description: 'Programming, algorithms, data and software engineering',
    sections: [
      'ai-tools',
      'algorithms',
      'api',
      'coding',
      'coding-practice',
      'competitive-programming',
      'computer-science',
      'data-science',
      'data-structures',
      'debugging',
      'dev-tools',
      'machine-learning',
      'networking',
      'open-source',
      'programming',
      'software-engineering',
      'storage',
    ],
  },
  {
    value: 'engineering-electronics',
    label: 'Engineering & Electronics',
    description: 'Circuits, embedded systems, mechanics and simulations',
    sections: ['biomedical', 'digital-logic', 'electronics', 'embedded', 'engineering', 'mechanical', 'simulation'],
  },
  {
    value: 'math-sciences',
    label: 'Math & Sciences',
    description: 'Mathematics, physics, chemistry and science resources',
    sections: ['biology', 'chemistry', 'mathematics', 'physics', 'science'],
  },
  {
    value: 'research',
    label: 'Research & Reference',
    description: 'Papers, citations, documentation and research tools',
    sections: ['citations', 'documentation', 'papers', 'preprints', 'reference', 'research', 'research-tools'],
  },
  {
    value: 'career',
    label: 'Career & Opportunities',
    description: 'Jobs, internships, contests and scholarships',
    sections: [
      'career',
      'certifications',
      'competitions',
      'hackathons',
      'internships',
      'interview-prep',
      'jobs',
      'placements',
      'portfolio',
      'roadmaps',
      'scholarships',
    ],
  },
  {
    value: 'productivity',
    label: 'Productivity',
    description: 'Planning, focus, collaboration and organization',
    sections: [
      'collaboration',
      'focus',
      'learning',
      'note-taking',
      'notes',
      'planning',
      'productivity',
      'project-management',
    ],
  },
  {
    value: 'campus',
    label: 'Campus Life',
    description: 'Student services, events and everyday essentials',
    sections: ['circulars', 'community', 'discussion', 'essentials', 'government', 'results', 'student-services'],
  },
  {
    value: 'food-travel',
    label: 'Food & Travel',
    description: 'Transport, stays, maps, food and groceries',
    sections: [
      'accommodation',
      'booking',
      'buses',
      'food-delivery',
      'groceries',
      'hostels-housing',
      'maps',
      'navigation',
      'rentals',
      'restaurants',
    ],
  },
  {
    value: 'creative',
    label: 'Creative & Design',
    description: 'Design, presentations, editing and prototyping',
    sections: ['design', 'documents', 'editor', 'fashion', 'presentations', 'prototyping'],
  },
  {
    value: 'shopping',
    label: 'Shopping & Budget',
    description: 'Shopping, deals and second-hand finds',
    sections: ['budget', 'second-hand', 'shopping'],
  },
  {
    value: 'leisure',
    label: 'Leisure',
    description: 'Games, music, puzzles, hobbies and entertainment',
    sections: ['chess', 'games', 'hobbies', 'lifestyle', 'movies', 'music', 'pc-gaming', 'podcasts', 'puzzles', 'reviews'],
  },
]

export const otherCategoryFilter: CategoryFilter = {
  value: 'other',
  label: 'Other',
  description: 'Sections not assigned to a broad group yet',
  sections: [],
}

export type CategoryFilterSection = {
  label: string
  filters: string[]
}

// Controls the order and headings used by the filter bottom sheet.
// Add new filter values here when adding another broad category above.
export const categoryFilterSections: CategoryFilterSection[] = [
  {
    label: 'Learn & Build',
    filters: ['study', 'computer-science', 'engineering-electronics', 'math-sciences', 'research'],
  },
  {
    label: 'Work & Growth',
    filters: ['career', 'productivity', 'creative'],
  },
  {
    label: 'Campus & Everyday Life',
    filters: ['campus', 'food-travel', 'shopping', 'leisure', 'other'],
  },
]

// Exact discipline filters shown separately from the broader topic groups.
// Add a slug here when a new academic or engineering section should be directly selectable.
export const categorySectionFilters = [
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'biomedical', label: 'Biomedical' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'embedded', label: 'Embedded Systems' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'programming', label: 'Programming' },
] as const

const filterBySection = new Map(
  categoryFilters.flatMap((filter) => filter.sections.map((section) => [section, filter.value] as const))
)

export function filterValueForSection(section: string) {
  return filterBySection.get(section) ?? otherCategoryFilter.value
}

export function filtersForSections(sections: string[]) {
  const present = new Set(sections)
  return [
    ...categoryFilters.filter((filter) => filter.sections.some((section) => present.has(section))),
    ...(sections.some((section) => !filterBySection.has(section)) ? [otherCategoryFilter] : []),
  ]
}
