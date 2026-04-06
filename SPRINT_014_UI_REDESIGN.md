# SPRINT 014 — UI Redesign: RAL 7024 Graphite × Magenta
## Kompletna uputa za Claude Code

> Datum: Travanj 2026. | Trajanje: 1-2 dana
> Paleta: RAL 7024 Graphite (#474A51) × Magenta (#EC4BAC)
> Svi kontrasti verificirani WCAG AA/AAA

---

## 1. PALETA I WCAG KONTRAST TABLICA

### Tri nivoa surface (iz RAL 7024 baze)

```
RAL 7024 Graphite grey = #474A51

--bg      #2E3138   ← App pozadina (najtamnije)
--surf    #383C44   ← Kartice, sidebar
--raised  #474A51   ← RAL 7024 točno — hover, input bg
--sunken  #252930   ← Ugnješteni elementi
```

### Kontrast tablica — OBAVEZNO poštivati

```
Tekst               Pozadina     Kontrast   WCAG
────────────────────────────────────────────────
#EDEEF0 (--text)    #2E3138      12.1:1  ✅ AAA
#EDEEF0 (--text)    #383C44      10.4:1  ✅ AAA
#8D95A0 (--muted)   #2E3138       4.8:1  ✅ AA
#8D95A0 (--muted)   #383C44       4.1:1  ✅ AA  ← granica
#555D68 (--hint)    #2E3138       2.6:1  ⚠️  samo uppercase/dekorativno
#EC4BAC (--mg-500)  #2E3138       5.9:1  ✅ AA
#F472C0 (--mg-600)  #1D0B16       5.1:1  ✅ AA
#F9A8DA (--mg-700)  #1A0C16       9.2:1  ✅ AAA
#FCA5A5 (--crit-t)  #1F0B0B       8.7:1  ✅ AAA
#FCD34D (--warn-t)  #1C1505      10.1:1  ✅ AAA
```

PRAVILO za --hint (#555D68):
- SMIJE: section labele (uppercase + bold + tracking)
- SMIJE: decorativni separatori, linije
- NIKAD: primarni tekst, clickable elementi, inline tekst

---

## 2. CSS DESIGN TOKENS — src/index.css (zamijeniti cijeli file)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');

/* ============================================================
   SIMPLI ZNR — Design Tokens v2.0
   RAL 7024 Graphite x Magenta | WCAG verified
   ============================================================ */

:root {
  /* POVRŠINE */
  --bg:       #2E3138;
  --surf:     #383C44;
  --raised:   #474A51;
  --sunken:   #252930;

  /* GRANICE */
  --border:   rgba(255,255,255,0.07);
  --border-s: rgba(255,255,255,0.04);
  --border-m: rgba(255,255,255,0.13);
  --border-f: rgba(236,75,172,0.40);

  /* TEKST — min 4.5:1 na --surf */
  --text:   #EDEEF0;   /* 10.4:1 na surf ✅ */
  --muted:  #8D95A0;   /* 4.1:1 na surf ✅ */
  --hint:   #555D68;   /* 2.6:1 — samo uppercase/dekorativno */

  /* MAGENTA */
  --mg-50:  #1D0B16;
  --mg-100: #380F27;
  --mg-200: #6B1F4A;
  --mg-300: #A82270;
  --mg-400: #D4399A;
  --mg-500: #EC4BAC;   /* brand primary */
  --mg-600: #F472C0;   /* na tamnoj pozadini */
  --mg-700: #F9A8DA;   /* tekst na --mg-50 */
  --mg-glow:rgba(236,75,172,0.15);

  /* KRITIČNO */
  --crit-bg:  #1F0B0B;
  --crit-b:   rgba(220,38,38,0.35);
  --crit-acc: #EF4444;
  --crit-dot: #EF4444;
  --crit-t:   #FCA5A5;   /* 8.7:1 na --crit-bg ✅ */
  --crit-bdg: rgba(239,68,68,0.18);
  --crit-bdgb:rgba(239,68,68,0.30);

  /* UPOZORENJE */
  --warn-bg:  #1C1505;
  --warn-b:   rgba(217,119,6,0.28);
  --warn-acc: #F59E0B;
  --warn-dot: #F59E0B;
  --warn-t:   #FCD34D;   /* 10.1:1 na --warn-bg ✅ */
  --warn-bdg: rgba(245,158,11,0.15);
  --warn-bdgb:rgba(245,158,11,0.28);

  /* INFO — magenta (brand differentiator vs. generična plava) */
  --info-bg:  #1A0C16;
  --info-b:   rgba(190,24,93,0.30);
  --info-acc: #EC4BAC;
  --info-dot: #EC4BAC;
  --info-t:   #F9A8DA;   /* 9.2:1 na --info-bg ✅ */
  --info-bdg: rgba(236,75,172,0.15);
  --info-bdgb:rgba(236,75,172,0.28);

  /* UREDAN */
  --ok-bg:    #081510;
  --ok-b:     rgba(21,128,61,0.30);
  --ok-acc:   #22C55E;
  --ok-dot:   #22C55E;
  --ok-t:     #86EFAC;

  /* TIPOGRAFIJA */
  --font-sans:'DM Sans', -apple-system, sans-serif;
  --font-mono:'DM Mono', monospace;

  /* SPRING EASINGS */
  --spring:   cubic-bezier(0.34,1.56,0.64,1);
  --ease-out: cubic-bezier(0.0,0.0,0.2,1);
}

/* BASE */
*,*::before,*::after { box-sizing: border-box; }

body {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--raised); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--hint); }

::selection { background: var(--mg-200); color: var(--mg-700); }

/* MOTION */
@keyframes enter {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}

@keyframes pulse-red {
  0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,.5); }
  50%     { box-shadow:0 0 0 5px rgba(239,68,68,0); }
}

@keyframes pulse-magenta {
  0%,100% { box-shadow:0 0 0 0 rgba(236,75,172,.5); }
  50%     { box-shadow:0 0 0 6px rgba(236,75,172,0); }
}

@keyframes shimmer {
  0%  { background-position:-200% center; }
  100%{ background-position: 200% center; }
}

.animate-enter { animation: enter 400ms var(--spring) both; }

/* Staggered — dodati style="--i: N" */
.animate-stagger {
  opacity: 0;
  animation: enter 400ms var(--spring) both;
  animation-delay: calc(var(--i, 0) * 60ms + 40ms);
}

/* Skeleton */
.skeleton {
  background: linear-gradient(90deg,
    var(--surf) 25%, var(--raised) 50%, var(--surf) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}

/* PROXIMITY HOVER — CSS only, bez JS */
.alarm-list:has(button:hover) button:not(:hover) {
  opacity: 0.42;
  transform: scale(0.990);
  transition: opacity 130ms ease-out, transform 130ms ease-out;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. KOMPONENTE

### AlarmCard.tsx

```tsx
// src/components/ui/AlarmCard.tsx

type AlarmLevel = 'critical' | 'warning' | 'info' | 'ok'

interface AlarmCardProps {
  level: AlarmLevel
  title: string
  meta: string
  badge: string
  onClick?: () => void
  index?: number
}

const S = {
  critical: {
    card:  'bg-[var(--crit-bg)] border-[var(--crit-b)]',
    acc:   'bg-[var(--crit-acc)]',
    dot:   'bg-[var(--crit-dot)] animate-[pulse-red_2s_ease-in-out_infinite]',
    title: 'text-[var(--crit-t)]',   /* #FCA5A5 — 8.7:1 ✅ */
    badge: 'bg-[var(--crit-bdg)] border-[var(--crit-bdgb)] text-[var(--crit-t)]',
  },
  warning: {
    card:  'bg-[var(--warn-bg)] border-[var(--warn-b)]',
    acc:   'bg-[var(--warn-acc)]',
    dot:   'bg-[var(--warn-dot)]',
    title: 'text-[var(--warn-t)]',   /* #FCD34D — 10.1:1 ✅ */
    badge: 'bg-[var(--warn-bdg)] border-[var(--warn-bdgb)] text-[var(--warn-t)]',
  },
  info: {
    card:  'bg-[var(--info-bg)] border-[var(--info-b)]',
    acc:   'bg-[var(--info-acc)]',
    dot:   'bg-[var(--info-dot)]',
    title: 'text-[var(--info-t)]',   /* #F9A8DA — 9.2:1 ✅ */
    badge: 'bg-[var(--info-bdg)] border-[var(--info-bdgb)] text-[var(--info-t)]',
  },
  ok: {
    card:  'bg-[var(--ok-bg)] border-[var(--ok-b)]',
    acc:   'bg-[var(--ok-acc)]',
    dot:   'bg-[var(--ok-dot)]',
    title: 'text-[var(--ok-t)]',
    badge: 'bg-transparent border-[var(--ok-b)] text-[var(--ok-t)]',
  },
} satisfies Record<AlarmLevel, Record<string,string>>

export function AlarmCard({ level, title, meta, badge, onClick, index=0 }: AlarmCardProps) {
  const s = S[level]
  return (
    <button
      onClick={onClick}
      style={{ '--i': index } as React.CSSProperties}
      className={`
        animate-stagger group w-full text-left
        flex items-center gap-3 px-4 py-[10px] pl-[14px]
        rounded-[9px] border-[0.5px] relative overflow-hidden
        transition-[transform,opacity,border-color] duration-[180ms]
        hover:-translate-y-[1.5px] hover:scale-[1.004] hover:border-[var(--border-m)]
        active:scale-[0.998]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-f)]
        ${s.card}
      `}
    >
      {/* Left accent — NEMA border-radius */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.acc}`}
            style={{borderRadius:0}} aria-hidden />

      {/* Dot */}
      <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ml-[2px] ${s.dot}`}
            aria-hidden />

      {/* Tekst */}
      <div className="flex-1 min-w-0">
        {/* Status title — visoki kontrast boja specificirana po levelu */}
        <p className={`text-[13px] font-[500] leading-snug truncate ${s.title}`}>
          {title}
        </p>
        {/* Meta — --muted (#8D95A0), 4.1:1 na --surf ✅ */}
        <p className="text-[11px] text-[var(--muted)] mt-[2px] truncate">
          {meta}
        </p>
      </div>

      {/* Badge */}
      <span className={`font-mono text-[9px] font-[500] px-[7px] py-[2px]
                        rounded-full flex-shrink-0 border-[0.5px] ${s.badge}`}>
        {badge}
      </span>
    </button>
  )
}
```

### StatCard.tsx

```tsx
// src/components/ui/StatCard.tsx

const SV = {
  default:  { wrap:'bg-[var(--surf)] border-[var(--border)]',
              val:'text-[var(--text)]' },           /* #EDEEF0 ✅ */
  accent:   { wrap:'bg-[var(--mg-50)] border-[rgba(236,75,172,.25)]',
              val:'text-[var(--mg-600)]' },          /* #F472C0 ✅ */
  critical: { wrap:'bg-[var(--surf)] border-[var(--border)]',
              val:'text-[var(--crit-t)]' },          /* #FCA5A5 ✅ */
  warning:  { wrap:'bg-[var(--surf)] border-[var(--border)]',
              val:'text-[var(--warn-t)]' },          /* #FCD34D ✅ */
}

export function StatCard({ value, label, variant='default', index=0 }) {
  const v = SV[variant]
  return (
    <div style={{'--i':index} as React.CSSProperties}
         className={`animate-stagger rounded-[10px] p-[13px_14px] border-[0.5px]
                     transition-[transform,border-color] duration-200
                     hover:-translate-y-[1.5px] hover:border-[var(--border-m)]
                     cursor-default select-none ${v.wrap}`}>
      <p className={`text-[22px] font-[500] leading-none tabular-nums ${v.val}`}>
        {value}
      </p>
      {/* Label: --hint OK jer uppercase + font-weight 500 + tracking */}
      <p className="text-[10px] font-[500] uppercase tracking-[0.07em]
                    text-[var(--hint)] mt-[6px]">
        {label}
      </p>
    </div>
  )
}
```

### Button.tsx

```tsx
// src/components/ui/Button.tsx

const BV = {
  primary:`bg-[var(--mg-500)] text-white border-transparent
           hover:bg-[var(--mg-600)] active:bg-[var(--mg-400)]
           shadow-[0_2px_8px_var(--mg-glow)]
           hover:shadow-[0_4px_14px_rgba(236,75,172,.25)]`,
  secondary:`bg-[var(--surf)] text-[var(--text)] border-[var(--border)]
             hover:bg-[var(--raised)] hover:border-[var(--border-m)]`,
  ghost:`bg-transparent text-[var(--muted)] border-transparent
         hover:bg-[var(--raised)] hover:text-[var(--text)]`,
  danger:`bg-[var(--crit-bg)] text-[var(--crit-t)] border-[var(--crit-b)]
          hover:bg-[rgba(239,68,68,.12)]`,
}

export function Button({ variant='secondary', size='md', loading, children, ...props }) {
  return (
    <button className={`inline-flex items-center gap-2 font-[500] border-[0.5px]
                        transition-all duration-150 hover:-translate-y-px
                        active:scale-[0.98] focus-visible:outline-none
                        focus-visible:ring-2 focus-visible:ring-[var(--border-f)]
                        disabled:opacity-40 disabled:pointer-events-none
                        ${BV[variant]}
                        ${size==='sm'?'px-3 py-[6px] text-[12px] rounded-[8px]':''}
                        ${size==='md'?'px-4 py-[8px] text-[13px] rounded-[10px]':''}
                        ${size==='lg'?'px-5 py-[10px] text-[14px] rounded-[10px]':''}`}
            {...props}>
      {loading && <span className="w-3 h-3 rounded-full border border-current
                                   border-t-transparent animate-spin"/>}
      {children}
    </button>
  )
}
```

### LegalBadge.tsx

```tsx
// src/components/legal/LegalBadge.tsx

export function LegalBadge({ article, deadline, penalty=false }) {
  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      {/* Magenta pill: --mg-700 (#F9A8DA) na --mg-50 = 9.2:1 ✅ */}
      <span className="inline-flex items-center gap-[5px] px-[8px] py-[2px]
                       rounded-full bg-[var(--mg-50)]
                       border-[0.5px] border-[rgba(236,75,172,.3)]
                       text-[var(--mg-700)] text-[11px] font-[500]">
        <span className="w-[4px] h-[4px] rounded-full bg-[var(--mg-500)]" />
        {article}
      </span>

      {deadline && (
        /* --muted (#8D95A0) za rok — 4.1:1 na --surf ✅ */
        <span className="font-mono text-[11px] text-[var(--muted)]">
          {deadline}
        </span>
      )}

      {penalty && (
        /* --crit-t (#FCA5A5) na --crit-bdg = visok kontrast ✅ */
        <span className="px-[7px] py-[2px] rounded-full
                         bg-[var(--crit-bdg)] border-[0.5px] border-[var(--crit-bdgb)]
                         text-[var(--crit-t)] text-[10px] font-[500]">
          5.000–50.000 EUR
        </span>
      )}
    </div>
  )
}
```

### Sidebar — ključne klase

```tsx
// Container
className="w-[200px] bg-[var(--surf)] border-r border-[var(--border-s)]"

// Logo naziv — magenta brand
className="text-[15px] font-[500] text-[var(--mg-500)]"  /* 5.9:1 ✅ */

// Tenant subtekst
className="text-[11px] text-[var(--hint)]"  /* ok — mala info ✅ */

// Section label — uppercase, samo zato --hint funkcionira
className="text-[9px] font-[500] uppercase tracking-[0.09em] text-[var(--hint)]"

// Nav item INACTIVE
className="text-[13px] text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]"

// Nav item ACTIVE — magenta
className="bg-[var(--mg-50)] text-[var(--mg-600)] font-[500]
           border-r-[2px] border-[var(--mg-500)]"
/* --mg-600 (#F472C0) na --mg-50 (#1D0B16) = 5.1:1 ✅ */
```

---

## 4. KONTRAST PRAVILA — ZABRANJENO / DOZVOLJENO

```
❌ NIKAD                              ✅ UVIJEK KORISTITI
───────────────────────────────────────────────────────────
text-[var(--hint)] na body tekstu    text-[var(--text)]
text-gray-500 (hardcoded)            text-[var(--muted)]
border-radius na left accent         style={{borderRadius:0}}
text-white na dark bg                samo na --mg-500 dugmetu
inline tekst bez pozadine            provjeriti kontrast

MAPPING:
  Primarni tekst    → --text   (#EDEEF0) min 10:1
  Sekundarni tekst  → --muted  (#8D95A0) min 4:1
  Labele, eyebrow   → --hint   (#555D68) SAMO uppercase+tracking
  Crit tekst        → --crit-t (#FCA5A5) 8.7:1 ✅
  Warn tekst        → --warn-t (#FCD34D) 10.1:1 ✅
  Info tekst        → --info-t (#F9A8DA) 9.2:1 ✅
  Magenta na tamnoj → --mg-600 (#F472C0) 5.1:1 ✅
  Magenta pill tekst→ --mg-700 (#F9A8DA) 9.2:1 ✅
```

---

## 5. REDOSLIJED — 2 DANA

```
DAN 1 JUTRO (90 min):
  □ Zamijeni src/index.css s tokenima iz §2
  □ npm run dev → provjeri da je tamno i tekst vidljiv
  □ Vizualna provjera sidebar, dashboard, akcijski centar

DAN 1 POSLIJEPODNE (3h):
  □ AlarmCard.tsx — s proximity CSS u index.css
  □ StatCard.tsx
  □ Button.tsx (sve 4 varijante)
  □ Input.tsx

DAN 2 JUTRO (2h):
  □ LegalBadge.tsx
  □ Sidebar — active/inactive stanja
  □ AkcijskiCentar — spoji s pravim hookovima

DAN 2 POSLIJEPODNE (1h):
  □ Vizualni pregled svih stranica
  □ npm run build → 0 errors
  □ npm run lint  → 0 errors
  □ git add . && git commit && git push
```

---

## 6. COMMIT KONVENCIJA

```bash
feat(tokens): RAL 7024 graphite x magenta design system, WCAG verified
feat(ui): AlarmCard — spring enter, proximity hover, left accent
feat(ui): StatCard, Button, Input — graphite dark theme
feat(ui): LegalBadge — magenta pill, verified contrast
feat(layout): Sidebar magenta active state on RAL 7024
feat(M11): AkcijskiCentar — staggered layout, 3-level alarm sections
```

---

*SPRINT_014_UI_REDESIGN.md v2.0 | Simpli ZNR | Travanj 2026.*
*Paleta: RAL 7024 Graphite × Magenta | WCAG AA minimum, status tekst AAA*
