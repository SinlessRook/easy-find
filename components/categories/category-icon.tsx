import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Cloud,
  Compass,
  Database,
  GraduationCap,
  HeartHandshake,
  Layers,
  MapPin,
  PanelsTopLeft,
  Sparkles,
  SquareTerminal,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { IconKey, Tone } from '@/lib/mock-categories'

// Icons are referenced by string key so data can cross the server -> client boundary.
const icons: Record<IconKey, LucideIcon> = {
  panels: PanelsTopLeft,
  terminal: SquareTerminal,
  database: Database,
  cloud: Cloud,
  sparkles: Sparkles,
  layers: Layers,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  compass: Compass,
  graduation: GraduationCap,
  heart: HeartHandshake,
  map: MapPin,
  trophy: Trophy,
  wrench: Wrench,
}

// Full class names so Tailwind can detect them.
export const tones: Record<Tone, { icon: string; count: string; badge: string }> = {
  blue: {
    icon: 'bg-indigo-50 text-indigo-600',
    count: 'bg-indigo-50 text-indigo-700',
    badge: 'bg-indigo-50 text-indigo-700',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600',
    count: 'bg-emerald-100 text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600',
    count: 'bg-violet-50 text-violet-700',
    badge: 'bg-violet-50 text-violet-700',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-600',
    count: 'bg-orange-50 text-orange-700',
    badge: 'bg-orange-50 text-orange-700',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    count: 'bg-rose-50 text-rose-700',
    badge: 'bg-rose-50 text-rose-700',
  },
  cyan: {
    icon: 'bg-cyan-50 text-cyan-600',
    count: 'bg-cyan-50 text-cyan-700',
    badge: 'bg-cyan-50 text-cyan-700',
  },
}

export function CategoryIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = icons[name]
  return <Icon className={className} aria-hidden />
}