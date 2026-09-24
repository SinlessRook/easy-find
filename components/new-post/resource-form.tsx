'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Link2, LoaderCircle, Rocket, Zap } from 'lucide-react'
import { ApiError, api } from '@/lib/axios'
import { cn } from '@/lib/utils'
import FeedPreview from './feed-preview'
import CategoryMultiSelect from './category-multi-select'

type Props = {
  categories: { slug: string; name: string }[]
  defaultSection: string // from ?section=, already validated on the server ('' if none)
}

const WHY_MAX = 280
const DRAFT_KEY = 'EzyFind:resource-draft'
const DRAFT_EVENT = 'EzyFind:draft-changed'

/* ---- Draft storage (localStorage), read through useSyncExternalStore ---- */

function subscribeDraft(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(DRAFT_EVENT, callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(DRAFT_EVENT, callback)
  }
}

function readDraft() {
  try {
    return localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return trimmed
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function checkUrl(value: string): 'empty' | 'valid' | 'invalid' {
  const normalized = normalizeUrl(value)
  if (!normalized) return 'empty'

  try {
    const u = new URL(normalized)
    return /^https?:$/.test(u.protocol) && u.hostname.includes('.')
      ? 'valid'
      : 'invalid'
  } catch {
    return 'invalid'
  }
}

function previewImageFor(value: string) {
  try {
    const hostname = new URL(normalizeUrl(value)).hostname.replace(/^www\./, '')
    return hostname
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`
      : null
  } catch {
    return null
  }
}

const field =
  'w-full rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/40'

export default function ResourceForm({
  categories,
  defaultSection,
}: Props) {
  const router = useRouter()

  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [titleEdited, setTitleEdited] = useState(false)
  const [section, setSection] = useState(defaultSection)
  const [why, setWhy] = useState('')
  const [whyEdited, setWhyEdited] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)
  const [draftNote, setDraftNote] = useState('')
  const [draftHandled, setDraftHandled] = useState(false)

  const draftRaw = useSyncExternalStore(
    subscribeDraft,
    readDraft,
    () => null
  )

  const urlStatus = checkUrl(url)

  useEffect(() => {
    setPreviewImageUrl(null)

    const timer = window.setTimeout(() => {
      if (checkUrl(url) === 'valid') {
        setPreviewImageUrl(previewImageFor(url))
      }
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [url])

  useEffect(() => {
    const normalizedUrl = normalizeUrl(url)
    if (checkUrl(normalizedUrl) !== 'valid') return

    let active = true
    setMetadataLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get<{ data: { title: string; description: string } }>(
          '/resources/metadata',
          { params: { url: normalizedUrl }, timeout: 7000 }
        )
        if (!active) return
        const metadata = response.data.data
        if (!titleEdited && metadata.title) setTitle(metadata.title)
        if (!whyEdited && metadata.description) setWhy(metadata.description)
      } catch {
        // Metadata is an enhancement; the user can still complete the form manually.
      } finally {
        if (active) setMetadataLoading(false)
      }
    }, 450)

    return () => {
      active = false
      window.clearTimeout(timer)
      setMetadataLoading(false)
    }
  }, [url, titleEdited, whyEdited])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setFormError(undefined)
    setErrors({})

    const nextErrors: Record<string, string> = {}
    const trimmedUrl = normalizeUrl(url)
    const trimmedTitle = title.trim()
    const trimmedWhy = why.trim()

    if (checkUrl(trimmedUrl) !== 'valid') nextErrors.url = 'Enter a valid website or link.'
    if (trimmedTitle.length < 3) nextErrors.title = 'The title needs at least 3 characters.'
    else if (trimmedTitle.length > 150) nextErrors.title = 'The title can be at most 150 characters.'
    if (!section) nextErrors.section = 'Pick at least one category.'
    if (trimmedWhy.length > WHY_MAX) nextErrors.description = `Keep the description under ${WHY_MAX} characters.`

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFormError('Please fix the highlighted fields before publishing.')
      return
    }

    setPending(true)

    try {
      await api.post('/resources', {
        sections: section ? [section] : [],
        resourcetype: 'link',
        url: trimmedUrl,
        title: trimmedTitle,
        description: trimmedWhy || undefined,
      })

      // Clear saved draft after successful publish
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {}

      // Go back to the category page
      if (section) {
        router.push(`/categories/${section}`)
      } else {
        router.push('/categories')
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null

      if (apiError?.code === 'validation_error') {
        setErrors(apiError.fields ?? {})
        setFormError(apiError.message)
      } else if (apiError?.code === 'unauthorized') {
        setFormError('Please sign in to add a resource.')
      } else {
        setFormError(
          apiError?.message ??
            'Could not save your resource. Please try again.'
        )
      }
    } finally {
      setPending(false)
    }
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          url,
          title,
          section,
          why,
        })
      )

      window.dispatchEvent(new Event(DRAFT_EVENT))
      setDraftNote('Draft saved on this device.')
    } catch {
      setDraftNote('Could not save the draft. Browser storage is blocked.')
    }

    setDraftHandled(true)
  }

  function restoreDraft() {
    try {
      const d = JSON.parse(draftRaw ?? '{}')

      const restoredTitle = typeof d.title === 'string' ? d.title : ''
      const restoredWhy = typeof d.why === 'string' ? d.why.slice(0, WHY_MAX) : ''
      setUrl(typeof d.url === 'string' ? d.url : '')
      setTitle(restoredTitle)
      setTitleEdited(Boolean(restoredTitle))
      setWhy(
        restoredWhy
      )
      setWhyEdited(Boolean(restoredWhy))

      // A ?section= in the URL wins over the saved category
      if (
        !defaultSection &&
        categories.some((c) => c.slug === d.section)
      ) {
        setSection(d.section)
      }
    } catch {}

    setDraftHandled(true)
  }

  function discardDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
      window.dispatchEvent(new Event(DRAFT_EVENT))
    } catch {}

    setDraftHandled(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {draftRaw && !draftHandled && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>You have a saved draft on this device.</p>

          <div className="flex shrink-0 gap-3 font-semibold">
            <button
              type="button"
              onClick={restoreDraft}
              className="text-indigo-700 hover:underline"
            >
              Restore
            </button>

            <button
              type="button"
              onClick={discardDraft}
              className="text-slate-600 hover:underline"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {formError && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      {/* Target URL */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="link"
            className="text-[17px] font-semibold text-slate-900"
          >
            Tool or Resource URL
          </label>

          <span
            className={cn(
              'flex items-center gap-1 font-mono text-xs font-medium',
              urlStatus === 'invalid'
                ? 'text-red-600'
                : 'text-emerald-700'
            )}
            aria-live="polite"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />

            {urlStatus === 'invalid'
              ? 'Invalid link'
              : urlStatus === 'valid'
                ? 'Looks valid'
                : 'Real-time check'}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-1.5 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/40">
          <Link2
            className="h-5 w-5 shrink-0 text-slate-500"
            aria-hidden
          />

          <input
            id="link"
            name="link"
            type="url"
            inputMode="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="notion.so or https://notion.so/templates"
            list="resource-url-suggestions"
            onBlur={() => setUrl(normalizeUrl(url))}
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          <datalist id="resource-url-suggestions">
            <option value="notion.so" />
            <option value="canva.com" />
            <option value="drive.google.com" />
            <option value="github.com" />
          </datalist>
        </div>

        {errors.url && (
          <p
            role="alert"
            className="mt-1.5 text-sm text-red-600"
          >
            {errors.url}
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate-500" aria-live="polite">
          {metadataLoading ? 'Getting the site name and description...' : 'Paste a link and we will suggest the title and description.'}
        </p>
      </div>

            {/* Category */}
      <div>
        <label
          htmlFor="section"
          className="mb-2 block text-[17px] font-semibold text-slate-900"
        >
          Category / Student Need
        </label>

        <CategoryMultiSelect
          categories={categories}
          defaultSection={defaultSection}
          onChange={setSection}
          error={errors.section}
        />
      </div>

      {/* Title */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="title"
            className="text-[17px] font-semibold text-slate-900"
          >
            Tool or Resource Title
          </label>

          <span className="text-sm text-slate-500">
            Short &amp; descriptive
          </span>
        </div>

        <input
          id="title"
          name="title"
          required
          maxLength={150}
          value={title}
          onChange={(e) => {
            setTitleEdited(true)
            setTitle(e.target.value)
          }}
          placeholder="Free exam planner for first-year students"
          className={field}
        />

        {errors.title && (
          <p
            role="alert"
            className="mt-1.5 text-sm text-red-600"
          >
            {errors.title}
          </p>
        )}
      </div>


      {/* Why it's helpful */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="description"
            className="text-[17px] font-semibold text-slate-900"
          >
            Why It&apos;s Useful
          </label>

          <span
            className="font-mono text-sm text-slate-500"
            aria-live="polite"
          >
            {why.length}/{WHY_MAX}
          </span>
        </div>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={WHY_MAX}
          value={why}
          onChange={(e) => {
            setWhyEdited(true)
            setWhy(e.target.value)
          }}
          placeholder="How will this help another student save time, money, or effort?"
          className={cn(field, 'resize-none leading-relaxed')}
        />

        {errors.description && (
          <p
            role="alert"
            className="mt-1.5 text-sm text-red-600"
          >
            {errors.description}
          </p>
        )}
      </div>

      {/* Health check message */}
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-200 p-4 text-emerald-950">
        <BadgeCheck
          className="mt-0.5 h-7 w-7 shrink-0"
          aria-hidden
        />

        <p className="text-sm leading-snug">
          <strong>Quick Link Check:</strong> EzyFind checks that your
          shared link is reachable before showing it to the campus
          community.
        </p>
      </div>

      <FeedPreview
        title={title}
        description={why}
        previewImageUrl={previewImageUrl}
      />

      {/* Actions */}
      <div className="space-y-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 py-4 text-[17px] font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-70"
        >
          {pending ? (
            <LoaderCircle
              className="h-5 w-5 animate-spin"
              aria-hidden
            />
          ) : (
            <Rocket className="h-5 w-5" aria-hidden />
          )}

          {pending ? 'Publishing...' : 'Publish Resource'}
        </button>

        <button
          type="button"
          onClick={saveDraft}
          className="w-full rounded-2xl bg-indigo-50 py-4 text-[17px] font-semibold text-slate-900 hover:bg-indigo-100"
        >
          Save as Draft
        </button>

        <p
          role="status"
          className="min-h-5 text-center text-sm text-slate-500"
        >
          {draftNote}
        </p>
      </div>
    </form>
  )
}
