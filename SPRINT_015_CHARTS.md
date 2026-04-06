# SPRINT 015 — Dashboard grafovi: Paco Coursey stil
## Uputa za Claude Code

> Datum: Travanj 2026. | Trajanje: 1 dan
> Filozofija: Čisti SVG + CSS — bez Chart.js, bez Recharts
> Razlog: Library grafovi ne mogu doseći ovaj nivo animacijske kontrole

---

## FILOZOFIJA — Zašto ovako

Paco Coursey ne koristi chart biblioteke za premium UI.
Crta direktno u SVG jer:
- Svaki piksel je namjeran
- Spring animacije su precizne na frame level
- Hover stanja se ponašaju fizikalno
- Nema vendor bloata

**Pravilo za sve grafove u Simpli ZNR:**
- Nema grid linija
- Nema legendi ako su boje jasne
- Nema osi ako kontekst to ne zahtijeva
- Broj je uvijek veći od grafa
- Animacija komunicira podatak, ne dekorira

---

## 1. DONUT CHART — Djelatnici (zamjena)

**Problem:** Predebeo prsten, nema brojčane animacije, nema spring na ulazu.
**Rješenje:** Tanki prsten (strokeWidth 3), animirani dashoffset, counter koji broji gore.

```tsx
// src/components/charts/DonutChart.tsx
// ČISTI SVG — bez biblioteke

import { useEffect, useRef, useState } from 'react'

interface DonutChartProps {
  active: number
  former: number
}

export function DonutChart({ active, former }: DonutChartProps) {
  const total = active + former
  const pct = total > 0 ? active / total : 0

  const SIZE   = 120          // viewBox
  const STROKE = 3            // tanki prsten — Paco standard
  const R      = (SIZE / 2) - (STROKE / 2) - 2
  const CIRC   = 2 * Math.PI * R
  const CENTER = SIZE / 2

  // Animirani counter
  const [displayVal, setDisplayVal] = useState(0)
  const [drawn, setDrawn] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const DURATION = 900  // ms

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      // Spring easing: cubic-bezier(0.34, 1.56, 0.64, 1) aprox
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      setDrawn(eased * pct)
      setDisplayVal(Math.round(eased * active))

      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    // Delay za stagger efekt
    const timeout = setTimeout(() => {
      raf.current = requestAnimationFrame(tick)
    }, 200)

    return () => {
      clearTimeout(timeout)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [active, pct])

  // dashoffset: CIRC = prazno, 0 = puno
  const activeDash  = drawn * CIRC
  const formerStart = drawn * CIRC + 4  // 4px gap između segmenata

  return (
    <div className="flex items-center gap-5">
      {/* SVG donut */}
      <div className="relative flex-shrink-0">
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}  // start od vrha
        >
          {/* Track — graphite pozadina */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="var(--raised)"
            strokeWidth={STROKE}
          />

          {/* Former segment — muted graphite */}
          {former > 0 && (
            <circle
              cx={CENTER} cy={CENTER} r={R}
              fill="none"
              stroke="var(--raised)"
              strokeWidth={STROKE + 1}
              strokeDasharray={`${(former / total) * CIRC - 2} ${CIRC}`}
              strokeDashoffset={-(drawn * CIRC + 2)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 50ms linear' }}
            />
          )}

          {/* Active segment — magenta */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="var(--mg-500)"
            strokeWidth={STROKE}
            strokeDasharray={`${activeDash} ${CIRC}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        </svg>

        {/* Centralni broj */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'none' }}  // counteract rotate
        >
          <span className="
            font-mono text-[20px] font-[500]
            text-[var(--text)]
            tabular-nums leading-none
          ">
            {displayVal}
          </span>
          <span className="text-[9px] text-[var(--hint)] uppercase tracking-[.07em] mt-[2px]">
            aktivnih
          </span>
        </div>
      </div>

      {/* Legenda — minimalna */}
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--mg-500)]" />
          <span className="text-[12px] text-[var(--muted)]">
            {active} aktivnih
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--raised)]
                           border border-[var(--border-m)]" />
          <span className="text-[12px] text-[var(--hint)]">
            {former} bivših
          </span>
        </div>
      </div>
    </div>
  )
}
```

---

## 2. USKLAĐENOST CHART — Horizontalni segment bars (zamjena)

**Problem:** Vertikalni bar chart s debelim zelenim/crvenim stupcima — generičko, nema duše.
**Rješenje:** Horizontalni segment bars — tanke linije po modulu, spring grow iz lijeva, magenta za uredno.

```tsx
// src/components/charts/ComplianceChart.tsx

import { useEffect, useState } from 'react'

interface ComplianceItem {
  label: string       // "Ospos."
  ok: number          // 0-100 postotak urednih
  total: number
}

interface ComplianceChartProps {
  items: ComplianceItem[]
}

export function ComplianceChart({ items }: ComplianceChartProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const DURATION = 700

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      if (t < 1) requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => requestAnimationFrame(tick), 300)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex flex-col gap-[10px] w-full">
      {items.map((item, i) => {
        const okPct    = item.total > 0 ? (item.ok / item.total) * 100 : 0
        const animated = okPct * progress
        const isGood   = okPct >= 80

        return (
          <div
            key={item.label}
            className="group"
            style={{
              // Stagger: svaki bar ulazi malo kasnije
              opacity: progress > (i * 0.15) ? 1 : 0,
              transform: `translateX(${(1 - Math.min(progress / (0.3 + i * 0.1), 1)) * -8}px)`,
              transition: 'opacity 200ms ease-out, transform 200ms ease-out',
            }}
          >
            {/* Label + postotak */}
            <div className="flex items-center justify-between mb-[5px]">
              <span className="text-[11px] text-[var(--muted)] font-[500]">
                {item.label}
              </span>
              <span className="
                font-mono text-[11px]
                text-[var(--hint)]
                group-hover:text-[var(--muted)]
                transition-colors duration-150
              ">
                {item.ok}/{item.total}
              </span>
            </div>

            {/* Track */}
            <div className="
              relative h-[3px] w-full
              bg-[var(--raised)]
              rounded-full overflow-hidden
            ">
              {/* Fill — magenta ako ≥80%, crvena ako <80% */}
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${animated}%`,
                  background: isGood
                    ? 'var(--mg-500)'
                    : okPct >= 50
                      ? 'var(--warn-dot)'
                      : 'var(--crit-dot)',
                  transition: 'background 300ms ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

**Kako pozvati (Dashboard):**

```tsx
<ComplianceChart items={[
  { label: 'Osposobljavanja', ok: complianceData.trainings.ok,  total: complianceData.trainings.total },
  { label: 'Zdravstveni',     ok: complianceData.health.ok,     total: complianceData.health.total },
  { label: 'Radna oprema',    ok: complianceData.equipment.ok,  total: complianceData.equipment.total },
  { label: 'Radna mjesta',    ok: complianceData.positions.ok,  total: complianceData.positions.total },
]} />
```

---

## 3. KRITIČNI ZADACI — Arc progress (zamjena)

**Problem:** Sivi krug s brojem 0 — nema vizualnog feedbacka, mrtav.
**Rješenje:** Animirani arc koji raste od 0 do stvarnog postotka, broj koji broji, boja koja se mijenja ovisno o postotku.

```tsx
// src/components/charts/CriticalArc.tsx

import { useEffect, useRef, useState } from 'react'

interface CriticalArcProps {
  critical: number   // broj kritičnih
  total: number      // ukupno djelatnika
}

export function CriticalArc({ critical, total }: CriticalArcProps) {
  const SIZE   = 100
  const STROKE = 3
  const R      = SIZE / 2 - STROKE - 4
  const CENTER = SIZE / 2
  const CIRC   = 2 * Math.PI * R

  // Arc ide od 220° do -40° (220° luk)
  // = koristimo samo 220/360 = 61% kruga
  const ARC_PCT = 220 / 360
  const pct = total > 0 ? critical / total : 0

  const [drawn, setDrawn] = useState(0)
  const [displayVal, setDisplayVal] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const DURATION = 800

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      setDrawn(eased * pct)
      setDisplayVal(Math.round(eased * critical))

      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => {
      raf.current = requestAnimationFrame(tick)
    }, 400)

    return () => {
      clearTimeout(timeout)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [critical, pct])

  // Boja ovisno o postotku
  const color = pct === 0
    ? 'var(--ok-dot)'       // zelena — sve uredu
    : pct < 0.1
      ? 'var(--warn-dot)'   // amber — malo kritičnih
      : 'var(--crit-dot)'   // crvena — previše kritičnih

  // Offset za 220° arc (rotiran -110° od vrha)
  const dashFill = drawn * ARC_PCT * CIRC
  const dashTotal = ARC_PCT * CIRC

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(125deg)' }}  // 360-220)/2 = 70 + 55 = 125
        >
          {/* Track arc */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="var(--raised)"
            strokeWidth={STROKE}
            strokeDasharray={`${dashTotal} ${CIRC}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Fill arc */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={`${dashFill} ${CIRC}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{ transition: 'stroke 400ms ease' }}
          />
        </svg>

        {/* Broj u sredini */}
        <div className="absolute inset-0 flex flex-col items-center justify-center"
             style={{ transform: 'none' }}>
          <span
            className="font-mono text-[22px] font-[500] tabular-nums leading-none"
            style={{ color }}
          >
            {displayVal}
          </span>
          <span className="text-[9px] text-[var(--hint)] uppercase tracking-[.07em] mt-1">
            od {total}
          </span>
        </div>
      </div>

      {/* Status tekst */}
      <p className="
        text-[11px] font-[500] mt-[-4px]
        transition-colors duration-300
      "
         style={{ color }}>
        {pct === 0
          ? '✓ sve uredno'
          : `${Math.round(pct * 100)}% kritičnih`
        }
      </p>
    </div>
  )
}
```

---

## 4. BONUS — Sparkline za trend (mini linijski graf)

Za buduće kartice gdje treba pokazati trend kroz vrijeme (npr. broj osposobljavanja po tjednima).

```tsx
// src/components/charts/Sparkline.tsx

interface SparklineProps {
  data: number[]       // niz vrijednosti, npr. [3, 7, 4, 9, 6, 12]
  color?: string       // default: --mg-500
  height?: number      // default: 32
}

export function Sparkline({ data, color = 'var(--mg-500)', height = 32 }: SparklineProps) {
  if (data.length < 2) return null

  const WIDTH   = 80
  const HEIGHT  = height
  const PADDING = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = PADDING + (i / (data.length - 1)) * (WIDTH - PADDING * 2)
    const y = PADDING + (1 - (v - min) / range) * (HEIGHT - PADDING * 2)
    return `${x},${y}`
  })

  const polyline = points.join(' ')

  // Area fill
  const firstPt = points[0].split(',')
  const lastPt  = points[points.length - 1].split(',')
  const areaPath = `M ${firstPt[0]},${HEIGHT} L ${polyline} L ${lastPt[0]},${HEIGHT} Z`

  return (
    <svg
      width={WIDTH} height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="overflow-visible"
    >
      {/* Area fill — suptilna */}
      <path
        d={areaPath}
        fill={color}
        fillOpacity={0.08}
      />

      {/* Linija */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Zadnja točka — highlight */}
      <circle
        cx={lastPt[0]} cy={lastPt[1]}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}
```

---

## 5. DASHBOARD — Kako integrirati sve zajedno

```tsx
// src/pages/dashboard/DashboardPage.tsx — relevantni dijelovi

// Kartica DJELATNICI
<DashboardCard title="Djelatnici">
  <DonutChart
    active={stats.activeWorkers}
    former={stats.formerWorkers}
  />
</DashboardCard>

// Kartica USKLAĐENOST
<DashboardCard title="Usklađenost">
  <ComplianceChart items={complianceItems} />
</DashboardCard>

// Kartica KRITIČNI ZADACI
<DashboardCard title="Kritični zadaci">
  <CriticalArc
    critical={stats.criticalTasks}
    total={stats.activeWorkers}
  />
</DashboardCard>
```

```tsx
// DashboardCard wrapper — isti za sve
function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="
      bg-[var(--surf)] border-[0.5px] border-[var(--border)]
      rounded-[12px] p-5
      animate-stagger
    ">
      <p className="
        text-[10px] font-[500] uppercase tracking-[0.08em]
        text-[var(--hint)] mb-4
      ">
        {title}
      </p>
      {children}
    </div>
  )
}
```

---

## 6. ANIMACIJSKA PRAVILA — Ne kršiti

```
✅ RADI
  requestAnimationFrame za sve animacije — ne CSS transition na SVG dashoffset
  Delay po komponentu: Donut 200ms, Compliance 300ms, Arc 400ms
  Counter koji broji gore zajedno s grafom
  Boja koja komunicira stanje (zelena=ok, magenta=brand, crvena=kritično)
  strokeLinecap="round" uvijek — nema oštih rubova
  strokeWidth max 3 — tanje je elegantnije

❌ NIKAD
  Chart.js ili Recharts za ove kartice
  Debele linije (strokeWidth > 4)
  Grid linije u pozadini
  Legenda ispod ako boje govore same za sebe
  Animacija koja traje > 1000ms
  Tooltip koji blokira pogled na podatak
  CSS transition na SVG stroke-dashoffset (ne radi glatko u Safariju)
```

---

## 7. REDOSLIJED IMPLEMENTACIJE

```
1. Kreiraj src/components/charts/ folder
2. Implementiraj DonutChart.tsx
3. Implementiraj ComplianceChart.tsx
4. Implementiraj CriticalArc.tsx
5. Implementiraj Sparkline.tsx (bonus)
6. Zamijeni stare grafove u DashboardPage.tsx
7. Provjeri animacije u Chrome DevTools (slow 4x motion)
8. npm run build → 0 errors
9. git commit + push
```

---

## 8. COMMIT

```bash
feat(charts): replace generic charts with hand-crafted SVG animations
feat(charts): DonutChart — thin ring, spring counter, magenta
feat(charts): ComplianceChart — horizontal segments, staggered bars
feat(charts): CriticalArc — 220deg arc, dynamic color by severity
feat(charts): Sparkline — mini trend line with area fill
```

---

*SPRINT_015_CHARTS.md | Simpli ZNR | Travanj 2026.*
*Filozofija: Čisti SVG + rAF — nikad Chart.js za premium animacije*
*Stil: Paco Coursey — motion with purpose, svaki piksel namjeran*
