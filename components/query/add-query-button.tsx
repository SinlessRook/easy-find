import Link from 'next/link'
import { MessageCirclePlus } from 'lucide-react'

export default function AddQueryButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
      <div className="mx-auto flex max-w-xl justify-end px-4">
        <Link
          href="/queries/new"
          className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700"
        >
          <MessageCirclePlus className="h-5 w-5" aria-hidden />
          Ask
        </Link>
      </div>
    </div>
  )
}