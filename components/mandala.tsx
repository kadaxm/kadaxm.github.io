'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ACCENTS, CENTER_ITEM, LINE, RING_ITEMS, type DesktopItem } from '@/lib/desktop-data'
import { PHI, TAU, mandalaLayout, polar } from '@/lib/mandala'
import { cn } from '@/lib/utils'
import { MandalaGlyph } from '@/components/mandala-glyph'

export type Origin = { x: number; y: number }

function centerOf(el: Element | null): Origin {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** Five around one, recursively — the ring's own pattern echoed at smaller scale. */
function Satellites({ radius, depth, reverse = false }: { radius: number; depth: number; reverse?: boolean }) {
  const dot = depth > 1 ? 3.5 : 1.8
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute left-1/2 top-1/2', reverse ? 'sat-spin-rev' : 'sat-spin')}
      style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * TAU - Math.PI / 2
        return (
          <span key={i} className="absolute" style={{ left: radius + Math.cos(a) * radius, top: radius + Math.sin(a) * radius }}>
            <span
              className="absolute rounded-full"
              style={{ width: dot, height: dot, left: -dot / 2, top: -dot / 2, background: LINE, opacity: depth > 1 ? 0.75 : 0.5 }}
            />
            {depth > 1 && <Satellites radius={radius / (PHI * PHI)} depth={depth - 1} reverse={!reverse} />}
          </span>
        )
      })}
    </span>
  )
}

/** A five-petal rosette — the whole mandala in miniature, set into the border. */
function Rosette({ x, y, r, rot }: { x: number; y: number; r: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          d={`M0 0 Q${r * 0.45} ${-r * 0.42} 0 ${-r} Q${-r * 0.45} ${-r * 0.42} 0 0Z`}
          transform={`rotate(${i * 72})`}
          fill={LINE}
          fillOpacity="0.08"
          stroke={LINE}
          strokeOpacity="0.55"
          strokeWidth="0.7"
        />
      ))}
      <circle r={r * 1.18} fill="none" stroke={LINE} strokeOpacity="0.25" strokeWidth="0.6" />
      <circle r="1.4" fill={LINE} />
    </g>
  )
}

const SEED_TEXT = 'Kadam Vyas · Generative AI · Prompt Craft · Krutitva · '

export function Mandala({
  onOpen,
  onHover,
  hovered,
  openIds,
}: {
  onOpen: (id: string, origin: Origin) => void
  onHover: (id: string | null) => void
  hovered: string | null
  openIds: string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!size) return <div ref={ref} className="absolute inset-0" />

  const { w, h } = size
  const { cx, cy, R, compact } = mandalaLayout(w, h)
  const orb = compact ? 60 : 80
  const satR = compact ? 40 : 54
  const seed = compact ? 96 : Math.round(Math.min(164, R * 0.6))
  const nodes = RING_ITEMS.map((item, i) => {
    const deg = i * 72
    return { item, i, deg, p: polar(cx, cy, R, deg) }
  })
  const inner = [R / (PHI * PHI * PHI), R / (PHI * PHI), R / PHI]
  // the border band the five sections sit on
  const band = compact ? 5 : 8
  const beads = compact ? 60 : 90

  const hoverProps = (item: DesktopItem) => ({
    onPointerEnter: () => onHover(item.id),
    onPointerLeave: () => onHover(null),
    onFocus: () => onHover(item.id),
    onBlur: () => onHover(null),
  })

  return (
    <div ref={ref} className={cn('absolute inset-0', hovered && 'mandala-paused')}>
      <div className="mandala-orbit absolute inset-0" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <svg
          aria-hidden="true"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          <defs>
            {nodes.map(({ item, p }) => (
              <linearGradient key={item.id} id={`arm-${item.id}`} gradientUnits="userSpaceOnUse" x1={cx} y1={cy} x2={p.x} y2={p.y}>
                <stop offset="0" stopColor={LINE} stopOpacity="0.1" />
                <stop offset="1" stopColor={ACCENTS[item.accent].base} stopOpacity="0.9" />
              </linearGradient>
            ))}
          </defs>

          {/* inner rings, shrinking by φ */}
          {inner.map((r, i) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={r}
              pathLength={1}
              fill="none"
              stroke={LINE}
              strokeOpacity="0.14"
              strokeWidth="0.7"
              className="draw-in"
              style={{ '--delay': `${0.15 + i * 0.15}s` } as CSSProperties}
            />
          ))}

          {/* pentagram — every section joined to the one two steps away */}
          <path
            d={[0, 2, 4, 1, 3].map((k, j) => `${j ? 'L' : 'M'}${nodes[k].p.x} ${nodes[k].p.y}`).join(' ') + 'Z'}
            pathLength={1}
            fill="none"
            stroke={LINE}
            strokeOpacity="0.1"
            strokeWidth="0.8"
            className="draw-in"
            style={{ '--delay': '0.9s' } as CSSProperties}
          />

          {/* inner vesica petals between neighbours */}
          {nodes.map(({ item, deg, p }, i) => {
            const next = nodes[(i + 1) % nodes.length].p
            const inside = polar(cx, cy, R * 0.66, deg + 36)
            return (
              <path
                key={item.id}
                d={`M${p.x} ${p.y} Q${inside.x} ${inside.y} ${next.x} ${next.y}`}
                pathLength={1}
                fill="none"
                stroke={LINE}
                strokeOpacity="0.16"
                strokeWidth="0.8"
                className="draw-in"
                style={{ '--delay': `${0.7 + i * 0.08}s` } as CSSProperties}
              />
            )
          })}

          {/* ── periphery: the border band the sections are set into ── */}
          {[R - band, R + band].map((r, i) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={r}
              pathLength={1}
              fill="none"
              stroke={LINE}
              strokeOpacity="0.55"
              strokeWidth="1"
              className="draw-in"
              style={{ '--delay': `${0.45 + i * 0.1}s` } as CSSProperties}
            />
          ))}
          <g className="fade-in-late">
            {Array.from({ length: beads }, (_, k) => {
              const deg = (k * 360) / beads
              // leave the band clear where a section sits
              const gap = Math.min(...nodes.map((n) => Math.abs(((deg - n.deg + 540) % 360) - 180)))
              if (gap < (compact ? 16 : 11)) return null
              const b = polar(cx, cy, R, deg)
              return <circle key={k} cx={b.x} cy={b.y} r={k % 3 === 0 ? 1.9 : 1.1} fill={LINE} opacity={k % 3 === 0 ? 0.85 : 0.5} />
            })}
          </g>

          {/* outer lotus scallops linking each section to the next, with a rosette in every gap */}
          {nodes.map(({ item, deg, p }, i) => {
            const next = nodes[(i + 1) % nodes.length].p
            const crest = polar(cx, cy, R * 1.2, deg + 36)
            const mid = polar(cx, cy, R + band, deg + 36)
            const tip = polar(cx, cy, R * 1.12, deg + 36)
            return (
              <g key={item.id}>
                <path
                  d={`M${p.x} ${p.y} Q${crest.x} ${crest.y} ${next.x} ${next.y}`}
                  pathLength={1}
                  fill="none"
                  stroke={LINE}
                  strokeOpacity="0.4"
                  strokeWidth="0.9"
                  className="draw-in"
                  style={{ '--delay': `${0.95 + i * 0.08}s` } as CSSProperties}
                />
                <line
                  x1={mid.x}
                  y1={mid.y}
                  x2={tip.x}
                  y2={tip.y}
                  stroke={LINE}
                  strokeOpacity="0.3"
                  strokeWidth="0.7"
                  className="fade-in-late"
                />
                <g className="fade-in-late">
                  <Rosette x={tip.x} y={tip.y} r={compact ? 7 : 11} rot={deg + 36} />
                </g>
              </g>
            )
          })}

          {/* arms from the seed, a slow pulse running outward */}
          {nodes.map(({ item, deg, p }) => {
            const ctrl = polar(cx, cy, R * 0.58, deg + 42)
            const d = `M${cx} ${cy} Q${ctrl.x} ${ctrl.y} ${p.x} ${p.y}`
            const active = hovered === item.id
            return (
              <g key={item.id} className="transition-opacity duration-500" opacity={hovered && !active ? 0.35 : 1}>
                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke={`url(#arm-${item.id})`}
                  strokeWidth={active ? 1.8 : 1}
                  className="draw-in transition-[stroke-width] duration-300"
                  style={{ '--delay': '0.35s' } as CSSProperties}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={ACCENTS[item.accent].light}
                  strokeOpacity={active ? 0.9 : 0.5}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray="0.5 14"
                  className="arm-flow"
                />
              </g>
            )
          })}
        </svg>

        {nodes.map(({ item, i, p }) => {
          const c = ACCENTS[item.accent]
          const isOpen = openIds.includes(item.id)
          const active = hovered === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Open ${item.title}`}
              onClick={(e) => onOpen(item.id, centerOf(e.currentTarget))}
              {...hoverProps(item)}
              className="group absolute rounded-full outline-none"
              style={{ left: p.x - orb / 2, top: p.y - orb / 2, width: orb, height: orb }}
            >
              <span className="mandala-counter absolute inset-0">
                <span
                  className="bloom-in absolute inset-0"
                  style={{ '--fx': `${cx - p.x}px`, '--fy': `${cy - p.y}px`, '--delay': `${0.55 + i * 0.13}s` } as CSSProperties}
                >
                  <span className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-[1.12] group-focus-visible:scale-[1.12]">
                    {/* ink disc so the bloom sits cleanly on the border band */}
                    <span aria-hidden="true" className="absolute -inset-2 rounded-full bg-[var(--ink)]" />
                    <span
                      aria-hidden="true"
                      className="absolute -inset-2 rounded-full border transition-[inset,border-color] duration-500 group-hover:-inset-3.5"
                      style={{ borderColor: active ? c.base : 'oklch(0.86 0.06 86 / 0.35)' }}
                    />
                    <Satellites radius={satR} depth={2} />
                    <MandalaGlyph accent={item.accent} petals={item.petals} size={orb} className="relative" />
                    {isOpen && (
                      <span aria-hidden="true" className="pulse-ring absolute -inset-2 rounded-full border" style={{ borderColor: c.light }} />
                    )}
                  </span>
                  <span className="label-ink pointer-events-none absolute left-1/2 top-full mt-4 flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap">
                    <span
                      className="font-[family-name:var(--font-display)] text-[15px] italic leading-none transition-colors duration-300 sm:text-[17px]"
                      style={{ color: active ? c.light : 'var(--foreground)' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-medium uppercase tracking-[0.24em] text-foreground/45 transition-colors duration-300',
                        compact && 'hidden',
                        active && 'text-foreground/80',
                      )}
                    >
                      {item.hint}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* the seed */}
      <button
        type="button"
        aria-label={`Open ${CENTER_ITEM.title}`}
        onClick={(e) => onOpen(CENTER_ITEM.id, centerOf(e.currentTarget))}
        {...hoverProps(CENTER_ITEM)}
        className="group absolute rounded-full outline-none"
        style={{ left: cx - seed / 2, top: cy - seed / 2, width: seed, height: seed }}
      >
        <span className="bloom-in absolute inset-0" style={{ '--fx': '0px', '--fy': '0px', '--delay': '0.1s' } as CSSProperties}>
          <span className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]">
            <span aria-hidden="true" className="seed-ground absolute -inset-4 rounded-full" />
            <span aria-hidden="true" className="pulse-ring absolute inset-[14%] rounded-full border border-[oklch(0.86_0.06_86/0.35)]" />
            <span aria-hidden="true" className="glyph-spin-slow absolute inset-0">
              <svg viewBox="-50 -50 100 100" className="h-full w-full overflow-visible">
                <defs>
                  <path id="seed-text-path" d="M0,-45 a45,45 0 1,1 0,90 a45,45 0 1,1 0,-90" />
                </defs>
                <circle r="49.5" fill="none" stroke={LINE} strokeOpacity="0.35" strokeWidth="0.4" />
                <circle r="39.5" fill="none" stroke={LINE} strokeOpacity="0.2" strokeWidth="0.4" />
                <text fill={LINE} fillOpacity="0.85" fontSize="5.6" fontWeight="500" letterSpacing="1.2">
                  <textPath href="#seed-text-path" textLength="280" lengthAdjust="spacing">
                    {SEED_TEXT.toUpperCase()}
                  </textPath>
                </text>
              </svg>
            </span>
            <MandalaGlyph
              accent={CENTER_ITEM.accent}
              petals={CENTER_ITEM.petals}
              size={Math.round(seed * 0.62)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </span>
          <span className="label-ink pointer-events-none absolute left-1/2 top-full mt-2 flex -translate-x-1/2 flex-col items-center gap-0.5 whitespace-nowrap">
            <span className="font-[family-name:var(--font-display)] text-[17px] italic leading-none text-foreground">
              {CENTER_ITEM.label}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-[oklch(0.83_0.08_86)]">
              {CENTER_ITEM.hint}
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
