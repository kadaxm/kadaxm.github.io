'use client'

import { ACCENTS, type DesktopItem } from '@/lib/desktop-data'
import { useRef, useState, type CSSProperties } from 'react'
import type { Origin } from '@/components/mandala'
import { WindowContent } from '@/components/window-content'
import { cn } from '@/lib/utils'

const TITLE_H = 52

export function WindowFrame({
  item,
  initialX,
  initialY,
  origin,
  z,
  onFocus,
  onClose,
}: {
  item: DesktopItem
  initialX: number
  initialY: number
  origin: Origin
  z: number
  onFocus: () => void
  onClose: () => void
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [closing, setClosing] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const c = ACCENTS[item.accent]

  function onTitlePointerDown(e: React.PointerEvent) {
    onFocus()
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onTitlePointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    const x = Math.max(4, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx))
    const y = Math.max(40, Math.min(window.innerHeight - 80, e.clientY - drag.current.dy))
    setPos({ x, y })
  }
  function onTitlePointerUp(e: React.PointerEvent) {
    drag.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  function close() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return onClose()
    setClosing(true)
  }

  // the window blooms out of (and wilts back into) the flower that opened it
  const width = frameRef.current?.offsetWidth ?? Math.min(window.innerWidth * 0.92, 540)
  const fromX = origin.x - (pos.x + width / 2)
  const fromY = origin.y - (pos.y + TITLE_H)

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-label={item.title}
      onPointerDown={onFocus}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onClose()
      }}
      style={
        {
          left: pos.x,
          top: pos.y,
          zIndex: z,
          '--from-x': `${fromX}px`,
          '--from-y': `${fromY}px`,
          '--accent': c.base,
        } as CSSProperties
      }
      className={cn(
        'fixed w-[min(92vw,540px)] rounded-[18px] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.85)]',
        closing ? 'window-wilt' : 'window-bloom',
      )}
    >
      <div className="panel relative flex max-h-[min(80vh,660px)] flex-col overflow-hidden rounded-[18px]">
        {/* a single accent hairline across the top edge */}
        <span
          aria-hidden="true"
          className="absolute inset-x-10 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${c.base}, transparent)` }}
        />
        <div
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={onTitlePointerUp}
          className="drag-none relative flex shrink-0 cursor-grab items-center justify-between px-6 active:cursor-grabbing"
          style={{ height: TITLE_H }}
        >
          <p className="pointer-events-none flex items-center gap-2.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45" style={{ background: c.base }} />
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-foreground/55">{item.title}</span>
          </p>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={close}
            aria-label={`Close ${item.title}`}
            className="-mr-2 grid h-8 w-8 place-items-center rounded-full text-foreground/50 outline-none transition-[color,transform] duration-300 hover:rotate-90 hover:text-foreground focus-visible:rotate-90 focus-visible:text-foreground"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-1">
          <WindowContent id={item.id} />
        </div>
      </div>
    </div>
  )
}
