import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isIP } from 'node:net'

const requestSchema = z.object({
  url: z.string().url().refine((value) => /^https?:\/\//i.test(value)),
})

function clean(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function metadataContent(html: string, keys: string[]) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of tags) {
    const keyMatch = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i)
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)
    if (keyMatch && contentMatch && keys.includes(keyMatch[1].toLowerCase())) {
      return clean(contentMatch[1])
    }
  }
  return ''
}

function titleFromHtml(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match?.[1] ? clean(match[1]) : ''
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (host === 'localhost' || host === '::1' || host.endsWith('.local')) return true
  if (isIP(host) !== 4) return false

  const parts = host.split('.').map(Number)
  return parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url') ?? ''
  const parsed = requestSchema.safeParse({ url })

  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'Enter a valid website URL.' } }, { status: 400 })
  }

  if (isPrivateHost(new URL(parsed.data.url).hostname)) {
    return NextResponse.json({ error: { code: 'invalid_url', message: 'That website address cannot be previewed.' } }, { status: 400 })
  }

  try {
    const response = await fetch(parsed.data.url, {
      headers: { 'User-Agent': 'EzyFind-Link-Preview/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error(`Metadata request returned ${response.status}`)

    const html = (await response.text()).slice(0, 1_000_000)
    const pageTitle = metadataContent(html, ['og:title', 'twitter:title']) || titleFromHtml(html)
    const description = metadataContent(html, ['description', 'og:description', 'twitter:description'])

    return NextResponse.json({ data: { title: pageTitle.slice(0, 150), description: description.slice(0, 280) } })
  } catch {
    return NextResponse.json({ data: { title: '', description: '' } })
  }
}
