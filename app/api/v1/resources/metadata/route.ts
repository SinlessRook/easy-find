import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_REDIRECTS = 5
const MAX_BYTES = 512 * 1024
const TIMEOUT_MS = 8000

const requestSchema = z.object({
  url: z.string().url().refine((value) => /^https?:\/\//i.test(value)),
})

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…',
}

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m)
}

function safeFromCodePoint(code: number) {
  try {
    return String.fromCodePoint(code)
  } catch {
    return ''
  }
}

function clean(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function parseAttributes(tag: string) {
  const attrs: Record<string, string> = {}
  const re = /([^\s=/"'<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tag))) {
    attrs[m[1].toLowerCase()] ??= m[2] ?? m[3] ?? m[4] ?? ''
  }
  return attrs
}

function collectMeta(html: string) {
  const meta = new Map<string, string>()
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag)
    const key = (attrs.property ?? attrs.name)?.toLowerCase()
    if (key && attrs.content && !meta.has(key)) meta.set(key, attrs.content)
  }
  return meta
}

// Returns the first non-empty value in the priority order of `keys`
function pickMeta(meta: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = meta.get(key)
    if (value) {
      const cleaned = clean(value)
      if (cleaned) return cleaned
    }
  }
  return ''
}

function titleFromHtml(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match?.[1] ? clean(match[1]) : ''
}

/* ---------- SSRF protection ---------- */

function isPrivateIp(ip: string): boolean {
  const family = isIP(ip)
  if (family === 4) {
    const [a, b] = ip.split('.').map(Number)
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
  }
  if (family === 6) {
    const l = ip.toLowerCase()
    if (l === '::' || l === '::1') return true
    if (l.startsWith('::ffff:')) return isPrivateIp(l.slice(7)) // non-dotted form -> treated as private
    return /^f[cd]/.test(l) || /^fe[89ab]/.test(l)
  }
  return true
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('bad protocol')

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('private host')
  }

  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error('private ip')
    return
  }

  const addresses = await lookup(host, { all: true })
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error('private ip')
  }
}

/* ---------- Fetching ---------- */

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 EzyFind-Link-Preview/1.0',
  Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

async function fetchPage(startUrl: string, signal: AbortSignal) {
  let current = new URL(startUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current)

    const response = await fetch(current, { headers: REQUEST_HEADERS, redirect: 'manual', signal })
    const location = response.headers.get('location')

    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel()
      current = new URL(location, current)
      continue
    }
    return response
  }
  throw new Error('Too many redirects')
}

async function readHtml(response: Response) {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const chunks: Uint8Array[] = []
  let total = 0
  let latin1Tail = ''

  while (total < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    total += value.length
    latin1Tail = (latin1Tail + Buffer.from(value).toString('latin1')).slice(-16)
    if (/<\/head>/i.test(latin1Tail)) break
  }
  await reader.cancel().catch(() => {})

  const bytes = Buffer.concat(chunks)
  const sniff = bytes.subarray(0, 2048).toString('latin1')
  const charset =
    response.headers.get('content-type')?.match(/charset=["']?([\w-]+)/i)?.[1] ??
    sniff.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ??
    'utf-8'

  try {
    return new TextDecoder(charset).decode(bytes)
  } catch {
    return bytes.toString('utf-8')
  }
}

/* ---------- Route ---------- */

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url') ?? ''
  const parsed = requestSchema.safeParse({ url })

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Enter a valid website URL.' } },
      { status: 400 },
    )
  }

  try {
    await assertPublicUrl(new URL(parsed.data.url))
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_url', message: 'That website address cannot be previewed.' } },
      { status: 400 },
    )
  }

  try {
    const response = await fetchPage(parsed.data.url, AbortSignal.timeout(TIMEOUT_MS))
    if (!response.ok) throw new Error(`Metadata request returned ${response.status}`)

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType && !/html|xml/i.test(contentType)) {
      await response.body?.cancel()
      return NextResponse.json({ data: { title: '', description: '' } })
    }

    const html = await readHtml(response)
    const meta = collectMeta(html)

    const title = pickMeta(meta, ['og:title', 'twitter:title']) || titleFromHtml(html)
    const description = pickMeta(meta, ['og:description', 'description', 'twitter:description'])

    return NextResponse.json({
      data: { title: title.slice(0, 150), description: description.slice(0, 280) },
    })
  } catch (error) {
    console.warn('[link-preview] failed', parsed.data.url, error instanceof Error ? error.message : error)
    return NextResponse.json({ data: { title: '', description: '' } })
  }
}