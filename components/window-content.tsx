'use client'

import { useState, type CSSProperties } from 'react'
import { ACCENTS, PROJECTS, type ItemAccent } from '@/lib/desktop-data'
import { polar } from '@/lib/mandala'
import { MandalaGlyph } from '@/components/mandala-glyph'
import { ArrowUpRight } from 'lucide-react'

const PROJECT_ACCENTS: ItemAccent[] = ['vermilion', 'malachite', 'turmeric', 'indigo']
const PROJECT_PETALS = [16, 12, 8, 10]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
      {children}
    </p>
  )
}

function About() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative grid h-36 w-36 shrink-0 place-items-center self-center sm:self-start">
          <MandalaGlyph accent="turmeric" petals={8} size={144} className="absolute inset-0 opacity-90" />
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-card/90 font-[family-name:var(--font-display)] text-2xl italic text-primary shadow-[0_0_24px_rgb(0_0_0/0.4)]">
            KV
          </span>
        </div>
        <div className="space-y-3">
          <h2 className="text-pretty font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Hi, I&apos;m Kadam Vyas.
          </h2>
          <p className="leading-relaxed text-foreground/80">idk what to put it here</p>
        </div>
      </div>
    </div>
  )
}

/** Projects as a small constellation: four blooms around a centre, one in focus. */
function Work() {
  const [active, setActive] = useState(0)
  const S = 264
  const C = S / 2
  const r = 90
  const nodes = PROJECTS.map((p, i) => ({ p, i, pt: polar(C, C, r, i * (360 / PROJECTS.length) + 45) }))
  const p = PROJECTS[active]
  const c = ACCENTS[PROJECT_ACCENTS[active % PROJECT_ACCENTS.length]]

  return (
    <div className="space-y-4">
      <SectionLabel>Selected work — {PROJECTS.length} items</SectionLabel>

      <div className="relative mx-auto" style={{ width: S, height: S }}>
        <div className="glyph-spin-slow absolute inset-0">
          <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full" aria-hidden="true">
            {[r / 2.618, r / 1.618, r, r * 1.38].map((rr) => (
              <circle key={rr} cx={C} cy={C} r={rr} fill="none" stroke="white" strokeOpacity="0.1" />
            ))}
            {nodes.map(({ pt, i }) => {
              const next = nodes[(i + 1) % nodes.length].pt
              return (
                <path
                  key={i}
                  d={`M${pt.x} ${pt.y} Q${C} ${C} ${next.x} ${next.y}`}
                  fill="none"
                  stroke={ACCENTS[PROJECT_ACCENTS[i]].light}
                  strokeOpacity="0.3"
                />
              )
            })}
          </svg>
        </div>
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-colors duration-700"
          style={{ background: c.base }}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-display)] text-3xl italic text-foreground">
          {String(active + 1).padStart(2, '0')}
        </span>
        {nodes.map(({ p: proj, i, pt }) => {
          const on = i === active
          return (
            <button
              key={proj.name}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={on}
              aria-label={proj.name}
              className="absolute grid h-16 w-16 place-items-center rounded-full outline-none transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] hover:brightness-125 focus-visible:brightness-125"
              style={{ left: pt.x, top: pt.y, transform: `translate(-50%, -50%) scale(${on ? 1.18 : 0.88})` }}
            >
              <MandalaGlyph
                accent={PROJECT_ACCENTS[i % PROJECT_ACCENTS.length]}
                petals={PROJECT_PETALS[i % PROJECT_PETALS.length]}
                size={64}
                className={on ? '' : 'opacity-60 saturate-50'}
              />
            </button>
          )
        })}
      </div>

      <article
        key={active}
        className="rise-in rounded-2xl border bg-background/40 p-4"
        style={{ borderColor: `color-mix(in oklch, ${c.base} 45%, transparent)` } as CSSProperties}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight">{p.name}</h3>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{p.year}</span>
        </div>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em]" style={{ color: c.light }}>
          {p.role}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">{p.blurb}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {p.tags.map((t) => (
            <span key={t} className="rounded-full border border-white/12 px-2.5 py-0.5 text-[10px] tracking-wide text-foreground/70">
              {t}
            </span>
          ))}
          {p.href && (
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-black/80 transition-transform hover:-translate-y-0.5"
              style={{ background: c.base }}
            >
              visit <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </article>
    </div>
  )
}

function KrutitvaShop() {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>krutitva — on etsy</SectionLabel>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-4xl italic tracking-tight">Krutitva</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
        <p>
          My shop on Etsy. Every frame starts as a written prompt — scenes generated with
          Midjourney and Stable Diffusion — and the strongest prints get framed and listed.
          26 orders shipped so far, 5.0 across reviews.
        </p>
        <p>
          Want a subject, a size, or a set that isn&apos;t listed? Custom requests go through
          Etsy messages.
        </p>
      </div>
      <a
        href="https://krutitva.etsy.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between border-b border-white/10 py-3.5 transition-colors hover:border-primary/60"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          etsy
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          krutitva.etsy.com
          <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
        </span>
      </a>
    </div>
  )
}

function Resume() {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
        Curriculum vitae
      </p>
      <a
        href="/kadam-vyas-resume.pdf"
        download
        className="flex items-center justify-between border-b border-white/10 py-3.5 transition-colors hover:border-primary/60"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          pdf
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          Download the PDF
          <span aria-hidden="true" className="text-primary">↓</span>
        </span>
      </a>
    </div>
  )
}

function Readme() {
  return (
    <div className="space-y-4 text-foreground/80">
      <h2 className="font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-foreground">
        Kadam Vyas
      </h2>
      <p className="leading-relaxed">
        Generative AI, prompt craft, and Krutitva — gathered into one pattern. Five parts of
        my work sit on the edge of this mandala, and each carries a smaller orbit of five:
        the same form, repeating inward.
      </p>
      <ul className="space-y-2 text-sm leading-relaxed text-foreground/70">
        {[
          'Hover any bloom to still the turning.',
          'Click a bloom and it opens here, unfolding from the flower.',
          'Close with the × or press Esc.',
        ].map((line) => (
          <li key={line} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6em] h-1 w-1 shrink-0 rotate-45 bg-primary" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Contact() {
  const links = [
    {
      label: 'email',
      value: 'kadamkumarvyas29@gmail.com',
      href: 'mailto:kadamkumarvyas29@gmail.com',
    },
    {
      label: 'linkedin',
      value: 'in/kadamvyas',
      href: 'https://www.linkedin.com/in/kadamvyas/',
    },
    {
      label: 'github',
      value: 'github.com/kadaxm',
      href: 'https://github.com/kadaxm',
    },
  ]
  return (
    <div className="space-y-2">
      {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 border-b border-white/10 py-3.5 transition-colors hover:border-primary/60"
          >
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {l.label}
            </span>
            <span className="flex items-center gap-1.5 truncate text-sm font-medium">
              <span className="truncate">{l.value}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary" />
            </span>
          </a>
        ))}
    </div>
  )
}

export function WindowContent({ id }: { id: string }) {
  switch (id) {
    case 'about':
      return <About />
    case 'work':
      return <Work />
    case 'krutitva':
      return <KrutitvaShop />
    case 'resume':
      return <Resume />
    case 'readme':
      return <Readme />
    case 'contact':
      return <Contact />
    default:
      return null
  }
}
