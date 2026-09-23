import { ArrowUp, Eye, Link2 } from 'lucide-react'

type Props = {
  title: string
  description: string
  previewImageUrl?: string | null
}

// Shows how the resource will look in the community feed while the user types.
export default function FeedPreview({ title, description, previewImageUrl }: Props) {
  return (
    <section aria-labelledby="preview-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="preview-heading"
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700"
        >
          <Eye className="h-5 w-5 text-indigo-600" aria-hidden />
          Live community feed preview
        </h2>
      </div>

      <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mt-3 flex gap-3">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-indigo-50 text-indigo-500">
            {previewImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Link2 className="h-8 w-8" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-slate-900">
              {title.trim() || 'Your resource title'}
            </h3>
            <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-slate-600">
              {description.trim() || 'Why it is helpful will show up here.'}
            </p>
          </div>
        </div>

        <footer className="mt-3 flex justify-end">
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
            <ArrowUp className="h-4 w-4" aria-hidden />1
          </span>
        </footer>
      </article>
    </section>
  )
}