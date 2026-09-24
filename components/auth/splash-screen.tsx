'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import SignInDialog from '@/components/auth/sign-in-dialog'

const GUEST_ENTRY_KEY = 'ezyfind-guest-entry'

export default function SplashScreen({ children }: { children: ReactNode }) {
  const [hasEntered, setHasEntered] = useState<boolean | null>(null)

  useEffect(() => {
    setHasEntered(window.localStorage.getItem(GUEST_ENTRY_KEY) === 'true')
  }, [])

  async function continueAsGuest() {
    window.localStorage.setItem(GUEST_ENTRY_KEY, 'true')
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    } catch {
      // Fullscreen can be denied by browser permissions or device settings.
    }
    setHasEntered(true)
  }

  if (hasEntered === null) return null
  if (hasEntered) return children

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-white px-6 py-10 text-slate-950">
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes sphere-rotate {
          from {
            background-position: 0% 50%;
          }
          to {
            background-position: 200% 50%;
          }
        }
        .animate-orbit-outer {
          animation: spin-slow 18s linear infinite;
        }
        .animate-orbit-inner {
          animation: spin-reverse 12s linear infinite;
        }
        .animate-sphere {
          background-size: 200% 200%;
          animation: sphere-rotate 6s linear infinite;
        }
      `}</style>

      {/* Orbit illustration */}
      <div className="relative mt-10 flex h-72 w-72 items-center justify-center">
        {/* outer orbit ring + its planets, rotating together */}
        <div className="animate-orbit-outer absolute h-72 w-72 rounded-full border border-slate-200">
          <div className="absolute right-[6%] top-[28%] h-11 w-11 rounded-full bg-gradient-to-br from-[#dce6a2] to-[#9b65ff] shadow-[0_0_18px_rgba(155,101,255,0.25)]" />
          <div className="absolute left-[6%] top-[45%] h-9 w-9 rounded-full bg-gradient-to-br from-[#dce6a2] to-[#80915a] shadow-[0_0_16px_rgba(128,145,90,0.25)]" />
          <div className="absolute bottom-[10%] left-[38%] h-5 w-5 rounded-full bg-[#9b65ff]" />
        </div>

        {/* inner orbit ring + its planets, rotating opposite direction */}
        <div className="animate-orbit-inner absolute h-52 w-52 rounded-full border border-slate-200">
          <div className="absolute right-[16%] top-[6%] h-8 w-8 rounded-full bg-gradient-to-br from-[#9b65ff] to-[#6040b5] shadow-[0_0_14px_rgba(155,101,255,0.25)]" />
          <div className="absolute left-[20%] top-[10%] h-4 w-4 rounded-full bg-[#dce6a2]" />
          <div className="absolute right-[22%] bottom-[14%] h-3 w-3 rounded-full bg-[#80915a]" />
          <div className="absolute bottom-[20%] left-[32%] h-3 w-3 rounded-full bg-[#9b65ff]" />
        </div>

        {/* center sphere, subtly rotating gradient */}
        <div className="animate-sphere absolute h-28 w-28 rounded-full bg-gradient-to-br from-[#dce6a2] via-[#b7a5f5] to-[#9b65ff] shadow-[0_0_40px_rgba(155,101,255,0.22)]" />
      </div>

      {/* Progress dots */}
      <div className="mt-2 flex items-center gap-2">
        <span className="h-1.5 w-6 rounded-full bg-slate-950" />
        <span className="h-1.5 w-6 rounded-full bg-slate-200" />
        <span className="h-1.5 w-6 rounded-full bg-slate-200" />
      </div>

      {/* Title + subtitle */}
      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-4xl font-black tracking-[-0.04em]">Welcome to EzyFind!</h1>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
          Finding Resources Made Easy — one app for everything you need.
        </p>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <SignInDialog
          next="/"
          label="Continue with Google"
          className="w-full rounded-full bg-slate-950 py-3.5 text-base font-semibold text-white hover:bg-slate-800"
        />
        <Button
          type="button"
          size="lg"
          onClick={continueAsGuest}
          className="w-full rounded-full bg-base py-6 text-black font-semibold text-slate-950 hover:bg-slate-800"
        >
          Continue as a guest
        </Button>
      </div>
    </main>
  )
}