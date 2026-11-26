export const PHI = (1 + Math.sqrt(5)) / 2
export const TAU = Math.PI * 2

/**
 * Shared geometry for the background fractal and the interactive ring, so the
 * canvas and the DOM blooms always sit on the same centre and radius.
 */
export function mandalaLayout(w: number, h: number) {
  const compact = w < 640
  // the ring rotates, so any bloom can sit at the very top or bottom:
  // keep R + orb/satellites above and R + label below inside the viewport.
  const MARGIN = compact ? 44 : 64
  const ABOVE = compact ? 48 : 63
  const BELOW = compact ? 56 : 75
  const usable = h - MARGIN
  const cx = w / 2
  const R = Math.max(100, Math.min(w * (compact ? 0.4 : 0.36), (usable - ABOVE - BELOW) / 2, 300))
  const cy = MARGIN / 2 + (R + ABOVE + (usable - R - BELOW)) / 2
  return { cx, cy, R, compact }
}

/** Point on a circle, angle in degrees with 0° pointing up. */
export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}
