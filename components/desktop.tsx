'use client'

import { ACCENTS, DESKTOP_ITEMS } from '@/lib/desktop-data'
import { useCallback, useEffect, useState } from 'react'
import { FractalField } from '@/components/fractal-field'
import { Mandala, type Origin } from '@/components/mandala'
import { WindowFrame } from '@/components/window-frame'

export function Desktop() {
  const [stack, setStack] = useState<string[]>([])
  const [origins, setOrigins] = useState<Record<string, Origin>>({})
  const [hovered, setHovered] = useState<string | null>(null)

  const bringToFront = useCallback((id: string) => {
    setStack((prev) => (prev[prev.length - 1] === id ? prev : [...prev.filter((w) => w !== id), id]))
  }, [])

  const openWindow = useCallback((id: string, origin?: Origin) => {
    if (origin) setOrigins((prev) => ({ ...prev, [id]: origin }))
    setStack((prev) => [...prev.filter((w) => w !== id), id])
  }, [])

  const closeWindow = useCallback((id: string) => {
    setStack((prev) => prev.filter((w) => w !== id))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setStack((prev) => prev.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hoveredAccent = DESKTOP_ITEMS.find((i) => i.id === hovered)?.accent

  return (
    <main className="ground relative h-[100dvh] w-full overflow-hidden">
      <FractalField />
      {/* the field warms faintly toward whatever you hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: hoveredAccent ? 0.35 : 0,
          background: hoveredAccent
            ? `radial-gradient(circle at 50% 48%, color-mix(in oklch, ${ACCENTS[hoveredAccent].base} 30%, transparent), transparent 55%)`
            : undefined,
        }}
      />
      <div aria-hidden="true" className="vignette pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      <h1 className="sr-only">Kadam Vyas — generative AI, prompt craft, and Krutitva</h1>
      <Mandala onOpen={openWindow} onHover={setHovered} hovered={hovered} openIds={stack} />

      <p
        aria-hidden="true"
        className="hint-fade pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.3em] text-foreground/40"
      >
        hover to still · click to open
      </p>

      {stack.map((id, index) => {
        const item = DESKTOP_ITEMS.find((i) => i.id === id)
        if (!item) return null
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
        const vh = typeof window !== 'undefined' ? window.innerHeight : 800
        const winW = Math.min(vw * 0.92, 540)
        const offset = (index % 5) * 24
        return (
          <WindowFrame
            key={id}
            item={item}
            initialX={Math.max(8, Math.min((vw - winW) / 2 - 48 + offset, vw - winW - 8))}
            initialY={Math.max(16, Math.min(vh * 0.1 + offset, vh - 300))}
            origin={origins[id] ?? { x: vw / 2, y: vh / 2 }}
            z={20 + index}
            onFocus={() => bringToFront(id)}
            onClose={() => closeWindow(id)}
          />
        )
      })}
    </main>
  )
}
