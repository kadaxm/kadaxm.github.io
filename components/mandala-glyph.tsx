'use client'

import { useId } from 'react'
import { ACCENTS, type ItemAccent } from '@/lib/desktop-data'
import { cn } from '@/lib/utils'

function petal(ri: number, ro: number, w: number) {
  const mid = (ri + ro) / 2
  return `M${ri} 0 Q${mid} ${w} ${ro} 0 Q${mid} ${-w} ${ri} 0Z`
}

/**
 * A layered rosette: an outer petal ring and an inner counter-rotating ring,
 * a bead circle and a glowing core. Rotation lives on HTML wrappers so it
 * always pivots on the true centre.
 */
export function MandalaGlyph({
  accent,
  petals,
  size,
  spin = true,
  className,
}: {
  accent: ItemAccent
  petals: number
  size: number
  spin?: boolean
  className?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const c = ACCENTS[accent]
  const step = 360 / petals

  return (
    <span className={cn('relative block', className)} style={{ width: size, height: size }}>
      <span className={cn('absolute inset-0', spin && 'glyph-spin')}>
        <svg viewBox="-50 -50 100 100" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`o${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={c.deep} stopOpacity="0.9" />
              <stop offset="1" stopColor={c.light} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {Array.from({ length: petals }, (_, i) => (
            <path
              key={i}
              d={petal(13, 49, 10)}
              transform={`rotate(${i * step})`}
              fill={`url(#o${uid})`}
              stroke={c.light}
              strokeOpacity="0.55"
              strokeWidth="0.6"
            />
          ))}
          {Array.from({ length: petals * 2 }, (_, i) => {
            const a = ((i * 180) / petals) * (Math.PI / 180)
            return <circle key={i} cx={Math.cos(a) * 43} cy={Math.sin(a) * 43} r="0.9" fill={c.light} opacity="0.8" />
          })}
        </svg>
      </span>
      <span className={cn('absolute inset-[14%]', spin && 'glyph-spin-rev')}>
        <svg viewBox="-50 -50 100 100" className="h-full w-full overflow-visible">
          {Array.from({ length: petals }, (_, i) => (
            <path
              key={i}
              d={petal(10, 46, 13)}
              transform={`rotate(${i * step + step / 2})`}
              fill={c.base}
              fillOpacity="0.55"
              stroke={c.light}
              strokeOpacity="0.8"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </span>
      <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`c${uid}`}>
            <stop offset="0" stopColor="white" />
            <stop offset="0.45" stopColor={c.light} />
            <stop offset="1" stopColor={c.deep} />
          </radialGradient>
        </defs>
        <circle r="11" fill={`url(#c${uid})`} />
        <circle r="15" fill="none" stroke={c.light} strokeOpacity="0.6" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
      </svg>
    </span>
  )
}
