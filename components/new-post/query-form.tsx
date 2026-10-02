'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, LoaderCircle, Send } from 'lucide-react'
import { ApiError, api } from '@/lib/axios'
import { cn } from '@/lib/utils'
import CategoryAutocomplete from './category-autocomplete'
import { scrollFocusedField } from './new-post-chrome'

type Props = {
  categories: { slug: string; name: string }[]
  defaultSection: string
  author: { username: string; avatarUrl: string | null }
}

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-950/20'

export default function QueryForm({ categories, defaultSection, author }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [title, setTitle] = useState('')
  const [section, setSection] = useState(defaultSection)
  const [description, setDescription] = useState('')
  const [contactNum, setContactNum] = useState('')
  const [ttlMinutes, setTtlMinutes] = useState(60)

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes === 0
      ? `${hours} ${hours === 1 ? 'hour' : 'hours'}`
      : `${hours}h ${remainingMinutes}m`
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setErrors({})

    const nextErrors: Record<string, string> = {}
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedContact = contactNum.trim()

    if (trimmedTitle.length < 3) nextErrors.title = 'The title needs at least 3 characters.'
    else if (trimmedTitle.length > 150) nextErrors.title = 'The title can be at most 150 characters.'
    if (!section) nextErrors.section = 'Choose a category.'
    if (trimmedDescription.length < 1) nextErrors.description = 'Add some details to help others respond.'
    else if (trimmedDescription.length > 1000) nextErrors.description = 'Details can be at most 1000 characters.'
    if (ttlMinutes < 5 || ttlMinutes > 720 || ttlMinutes % 5 !== 0) {
      nextErrors.expiry_date = 'Choose a duration between 5 minutes and 12 hours.'
    }
    if (trimmedContact.length > 40) nextErrors.contact_num = 'The contact number is too long.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFormError('Please fix the highlighted fields before posting.')
      return
    }

    setPending(true)

    try {
      const expiry = new Date(Date.now() + ttlMinutes * 60 * 1000)
      await api.post('/queries', {
        title: trimmedTitle,
        description: trimmedDescription,
        contact_num: trimmedContact || null,
        expiry_date: expiry.toISOString(),
      })
      router.push('/queries')
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      setErrors(apiError?.fields ?? {})
      setFormError(apiError?.message ?? 'Could not post your request. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} onFocusCapture={scrollFocusedField} className="space-y-5" noValidate>
      {formError && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="rounded-2xl bg-slate-100 p-4 text-slate-950">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-slate-950" aria-hidden />
          <p className="text-sm leading-relaxed">Share what you need, where you are, and when it matters so nearby students can help.</p>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-2 block text-[17px] font-semibold text-slate-900">
          What do you want to ask?
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={180}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Anyone joining a group Swiggy order from campus tonight?"
          className={field}
        />
        {errors.title && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="ttl" className="text-[17px] font-semibold text-slate-900">Keep active for</label>
            <output
              htmlFor="ttl"
              className="inline-flex h-10 w-16 shrink-0 items-center justify-center rounded-full bg-slate-950 px-1 text-center text-xs font-semibold leading-tight text-white"
            >
              {formatDuration(ttlMinutes)}
            </output>
          </div>
          <input
            id="ttl"
            name="ttl"
            type="range"
            min="5"
            max="720"
            step="5"
            value={ttlMinutes}
            onChange={(event) => setTtlMinutes(Number(event.target.value))}
            aria-valuetext={formatDuration(ttlMinutes)}
            className="h-2 w-full cursor-pointer accent-slate-950"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>5 min</span>
            <span>12 hr</span>
          </div>
          {errors.expiry_date && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.expiry_date}</p>}
        </div>
        <div>
          <label htmlFor="contactNum" className="mb-2 block text-[17px] font-semibold text-slate-900">Contact number</label>
          <input
            id="contactNum"
            type="tel"
            maxLength={40}
            value={contactNum}
            onChange={(event) => setContactNum(event.target.value)}
            placeholder="Optional"
            className={field}
          />
          {errors.contact_num && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.contact_num}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="section" className="mb-2 block text-[17px] font-semibold text-slate-900">
          Category / Student Need
        </label>
        <CategoryAutocomplete
          categories={categories}
          value={section}
          onChange={setSection}
          error={errors.section}
          limit={3}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="description" className="text-[17px] font-semibold text-slate-900">Add some details</label>
          <span className="font-mono text-sm text-slate-500">{description.length}/1000</span>
        </div>
        <textarea
          id="description"
          name="description"
          required
          rows={7}
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mention the place, time, location, or details that will help classmates respond."
          className={cn(field, 'resize-none leading-relaxed')}
        />
        {errors.description && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Posting as <strong className="text-slate-900">{author.username}</strong>. Avoid sharing phone numbers, passwords, or other private details.
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-950 py-4 text-[17px] font-semibold text-white shadow-md shadow-slate-950/20 hover:bg-slate-800 disabled:opacity-70"
      >
        {pending ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
        {pending ? 'Posting...' : 'Post Query'}
      </button>
    </form>
  )
}