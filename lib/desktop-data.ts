export type ItemKind = 'folder' | 'file'
export type ItemAccent = 'turmeric' | 'malachite' | 'vermilion' | 'ochre' | 'indigo' | 'gold'

/**
 * Mineral-pigment palette — muted, earthy chroma so the geometry carries the
 * page, not glow.
 */
export const ACCENTS: Record<ItemAccent, { base: string; light: string; deep: string }> = {
  turmeric: { base: 'oklch(0.8 0.13 82)', light: 'oklch(0.9 0.07 88)', deep: 'oklch(0.6 0.12 70)' },
  malachite: { base: 'oklch(0.68 0.09 168)', light: 'oklch(0.85 0.05 165)', deep: 'oklch(0.48 0.08 172)' },
  vermilion: { base: 'oklch(0.63 0.17 34)', light: 'oklch(0.82 0.08 40)', deep: 'oklch(0.48 0.15 30)' },
  ochre: { base: 'oklch(0.72 0.1 58)', light: 'oklch(0.86 0.05 65)', deep: 'oklch(0.54 0.09 50)' },
  indigo: { base: 'oklch(0.62 0.1 262)', light: 'oklch(0.82 0.05 260)', deep: 'oklch(0.44 0.1 265)' },
  gold: { base: 'oklch(0.83 0.08 86)', light: 'oklch(0.93 0.03 88)', deep: 'oklch(0.64 0.08 78)' },
}

/** Gold-leaf hairline used for all shared linework. */
export const LINE = 'oklch(0.86 0.06 86)'

export type DesktopItem = {
  id: string
  /** name shown beneath the bloom */
  label: string
  /** one-line hint shown beneath the label */
  hint: string
  kind: ItemKind
  accent: ItemAccent
  /** petal count of the item's glyph */
  petals: number
  /** heading of the panel it opens */
  title: string
}

/** The seed at the centre of the mandala. */
export const CENTER_ITEM: DesktopItem = {
  id: 'readme',
  label: 'Welcome',
  hint: 'begin here',
  kind: 'file',
  accent: 'gold',
  petals: 10,
  title: 'Welcome',
}

/** The five blooms on the periphery — 5-fold symmetry, golden-ratio spacing. */
export const RING_ITEMS: DesktopItem[] = [
  { id: 'about', label: 'About', hint: 'who i am', kind: 'folder', accent: 'turmeric', petals: 8, title: 'About' },
  { id: 'work', label: 'Projects', hint: 'selected work', kind: 'folder', accent: 'malachite', petals: 12, title: 'Projects' },
  { id: 'krutitva', label: 'Krutitva', hint: 'ai art, framed', kind: 'folder', accent: 'vermilion', petals: 16, title: 'Krutitva' },
  { id: 'resume', label: 'Résumé', hint: 'cv · pdf', kind: 'file', accent: 'ochre', petals: 6, title: 'Résumé' },
  { id: 'contact', label: 'Contact', hint: 'say hello', kind: 'file', accent: 'indigo', petals: 10, title: 'Contact' },
]

export const DESKTOP_ITEMS: DesktopItem[] = [CENTER_ITEM, ...RING_ITEMS]

export type Project = {
  name: string
  year: string
  role: string
  blurb: string
  tags: string[]
  href?: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Krutitva — AI frames',
    year: '2024',
    role: 'Founder',
    blurb:
      'AI-generated art frames on Etsy — prompted with Midjourney and Stable Diffusion, curated, printed, framed, and shipped. 26 orders, 5.0 across reviews.',
    tags: ['etsy', 'midjourney', 'stable-diffusion'],
    href: 'https://krutitva.etsy.com/',
  },
  {
    name: 'jigo-memory',
    year: '2026',
    role: 'Builder',
    blurb:
      'A memory layer for voice AI — it decides what to keep, what to fade, and how to resolve contradictions. Hybrid retrieval at 76ms P50 locally, with streaming TTS.',
    tags: ['voice-ai', 'retrieval', 'tts'],
    href: 'https://github.com/kadaxm/jigo-memory',
  },
  {
    name: 'Form → AI Voice Call',
    year: '2025',
    role: 'Automation — n8n',
    blurb:
      'An n8n workflow with a live demo: submit a Tally form, the response lands in Airtable, and a Vapi assistant calls you over Twilio within seconds.',
    tags: ['n8n', 'vapi', 'twilio', 'airtable'],
    href: 'https://github.com/kadaxm/assignment/tree/N8N',
  },
  {
    name: 'Comic strips of cat characters',
    year: '2026',
    role: 'Gen AI experiment',
    blurb:
      'Comic strips starring cat characters, generated end to end with image models — from script to panels.',
    tags: ['comics', 'image-models'],
    href: 'https://github.com/kadaxm/Comic-strip-of-cat-characters',
  },
]
