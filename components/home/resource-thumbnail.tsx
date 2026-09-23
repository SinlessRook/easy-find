'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'

export default function ResourceThumbnail({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  let hostname = ''
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '')
  } catch {}

  const imageUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`
    : null

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-indigo-100 text-indigo-600">
      {imageUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-7 w-7 rounded-md object-contain"
        />
      ) : (
        <Link2 className="h-5 w-5" aria-hidden />
      )}
    </span>
  )
}
