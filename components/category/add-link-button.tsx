import Link from 'next/link'
import { Wrench } from 'lucide-react'

// Floats above the bottom bar, aligned to the page column's right edge.
export default function AddLinkButton({ section }: { section: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
      <div className="mx-auto flex max-w-xl justify-end px-4">
        <Link
          href={`/resources/new?section=${encodeURIComponent(section)}`}
          className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-black/20 transition hover:scale-[1.02] active:scale-95"
        >
          <Wrench className="h-5 w-5" aria-hidden />
          Add a Tool
        </Link>
      </div>
    </div>
  )
}