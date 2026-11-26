'use client'

import { useEffect, useRef } from 'react'
import { PHI, TAU, mandalaLayout } from '@/lib/mandala'

// turmeric, vermilion, malachite, indigo, ochre — mineral pigments, kept low-chroma
const HUES = [42, 14, 162, 226, 30]

type Layer = {
  img: HTMLCanvasElement
  extent: number
  speed: number
  breathe: number
  parallax: number
  alpha: number
  phase: number
}

function offscreen(extent: number, dpr: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const px = Math.min(2600, Math.ceil(extent * 2 * dpr))
  const c = document.createElement('canvas')
  c.width = c.height = px
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const k = px / (extent * 2)
  ctx.setTransform(k, 0, 0, k, px / 2, px / 2)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  draw(ctx)
  return c
}

/** Circles nested inside circles: 5 around + 1 centre child, radii shrinking by φ². */
function circleFlake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  depth: number,
  hueIndex: number,
) {
  const hue = HUES[hueIndex % HUES.length]
  ctx.strokeStyle = `hsla(${hue}, 48%, 72%, ${0.07 + 0.05 * depth})`
  ctx.lineWidth = 0.5 + depth * 0.35
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.stroke()
  if (depth === 0) return
  const cr = r / (PHI * PHI)
  const d = r - cr
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 5
    circleFlake(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, cr, depth - 1, hueIndex + i + 1)
  }
  circleFlake(ctx, x, y, cr, depth - 1, hueIndex + 2)
}

function petalPath(ctx: CanvasRenderingContext2D, ri: number, ro: number, w: number) {
  const mid = (ri + ro) / 2
  ctx.moveTo(ri, 0)
  ctx.quadraticCurveTo(mid, w, ro, 0)
  ctx.quadraticCurveTo(mid, -w, ri, 0)
}

function buildLayers(R: number, reach: number, dpr: number): Layer[] {
  const petals = offscreen(reach, dpr, (ctx) => {
    // [inner, outer, count, width] in units of R — counts are multiples of 5
    const rings: [number, number, number, number][] = [
      [0.12, 0.4, 10, 0.1],
      [0.3, 0.62, 10, 0.15],
      [0.66, 0.98, 20, 0.08],
      [1.06, 1.5, 30, 0.08],
      [1.55, 2.15, 40, 0.07],
      [2.2, 3.0, 60, 0.06],
    ]
    rings.forEach(([ri, ro, n, w], j) => {
      const hue = HUES[j % HUES.length]
      ctx.strokeStyle = `hsla(${hue}, 45%, 74%, 0.24)`
      ctx.fillStyle = `hsla(${hue}, 45%, 60%, 0.028)`
      ctx.lineWidth = 0.9
      for (let k = 0; k < n; k++) {
        ctx.save()
        ctx.rotate((k * TAU) / n + (j % 2 ? TAU / (2 * n) : 0))
        ctx.beginPath()
        petalPath(ctx, ri * R, ro * R, w * R)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }
    })
  })

  const flake = offscreen(reach, dpr, (ctx) => {
    circleFlake(ctx, 0, 0, R * PHI, 4, 0)
  })

  const stars = offscreen(reach, dpr, (ctx) => {
    // star polygons {n/m}
    const sets: [number, number, number][] = [
      [10, 3, 1.0],
      [20, 7, PHI],
      [30, 11, PHI * PHI],
      [40, 13, PHI * PHI * 1.3],
    ]
    sets.forEach(([n, m, rad], j) => {
      ctx.strokeStyle = `hsla(44, 42%, 76%, 0.1)`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * TAU) / n
        const b = -Math.PI / 2 + (((i + m) % n) * TAU) / n
        ctx.moveTo(Math.cos(a) * rad * R, Math.sin(a) * rad * R)
        ctx.lineTo(Math.cos(b) * rad * R, Math.sin(b) * rad * R)
      }
      ctx.stroke()
    })
  })

  const seeds = offscreen(reach, dpr, (ctx) => {
    // phyllotaxis — every seed turns by the golden angle
    const N = 1300
    const maxR = reach * 0.98
    const c = maxR / Math.sqrt(N)
    const golden = TAU / (PHI * PHI)
    for (let i = 1; i < N; i++) {
      const r = c * Math.sqrt(i)
      const a = i * golden
      const t = r / maxR
      const hue = 46 - t * 20 // bone-gold at the centre, warming to ochre at the rim
      const size = 0.5 + t * 1.6
      ctx.fillStyle = `hsla(${hue}, ${30 + t * 20}%, ${82 - t * 14}%, ${0.55 - t * 0.3})`
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, size, 0, TAU)
      ctx.fill()
    }
  })

  return [
    { img: seeds, extent: reach, speed: 0.011, breathe: 0.018, parallax: 22, alpha: 0.85, phase: 0 },
    { img: stars, extent: reach, speed: -0.006, breathe: 0.01, parallax: 30, alpha: 1, phase: 1.3 },
    { img: flake, extent: reach, speed: 0.008, breathe: 0.022, parallax: 6, alpha: 0.9, phase: 2.1 },
    { img: petals, extent: reach, speed: -0.017, breathe: 0.03, parallax: 12, alpha: 1, phase: 3.4 },
  ]
}

export function FractalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let layers: Layer[] = []
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const start = performance.now()

    function resize() {
      const rect = parent!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      const { R, cx, cy } = mandalaLayout(w, h)
      const reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 60
      layers = buildLayers(R, Math.max(reach, R * 3.05), dpr)
      if (reduced) frame(start)
    }

    function frame(now: number) {
      const t = (now - start) / 1000
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      const { cx, cy } = mandalaLayout(w, h)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)
      ctx!.globalCompositeOperation = 'lighter'
      // fade the whole field in on first load
      const intro = reduced ? 1 : Math.min(1, t / 2.4)
      for (const L of layers) {
        const s = (1 + Math.sin(t * 0.35 + L.phase) * L.breathe) * (0.85 + 0.15 * intro)
        ctx!.save()
        ctx!.globalAlpha = L.alpha * intro
        ctx!.translate(cx + pointer.x * L.parallax, cy + pointer.y * L.parallax)
        ctx!.rotate(t * L.speed)
        ctx!.scale(s, s)
        ctx!.drawImage(L.img, -L.extent, -L.extent, L.extent * 2, L.extent * 2)
        ctx!.restore()
      }
      if (!reduced) raf = requestAnimationFrame(frame)
    }

    function onPointer(e: PointerEvent) {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, layers.length ? 150 : 0)
    })
    ro.observe(parent)
    resize()
    if (!reduced) raf = requestAnimationFrame(frame)
    window.addEventListener('pointermove', onPointer)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
