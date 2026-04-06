// DonutChart — čisti SVG, spring counter, tanki prsten
// Paco Coursey stil: svaki piksel namjeran
import { useEffect, useRef, useState } from 'react'

interface DonutChartProps {
  active: number
  former: number
}

export function DonutChart({ active, former }: DonutChartProps) {
  const total = active + former
  const pct = total > 0 ? active / total : 0

  const SIZE = 120
  const STROKE = 3
  const R = (SIZE / 2) - (STROKE / 2) - 2
  const CIRC = 2 * Math.PI * R
  const CENTER = SIZE / 2

  const [displayVal, setDisplayVal] = useState(0)
  const [drawn, setDrawn] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const DURATION = 900

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setDrawn(eased * pct)
      setDisplayVal(Math.round(eased * active))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => {
      raf.current = requestAnimationFrame(tick)
    }, 200)

    return () => {
      clearTimeout(timeout)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [active, pct])

  const activeDash = drawn * CIRC

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
             style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={CENTER} cy={CENTER} r={R} fill="none"
                  stroke="var(--raised)" strokeWidth={STROKE} />
          {former > 0 && (
            <circle cx={CENTER} cy={CENTER} r={R} fill="none"
                    stroke="var(--raised)" strokeWidth={STROKE + 1}
                    strokeDasharray={`${(former / total) * CIRC - 2} ${CIRC}`}
                    strokeDashoffset={-(drawn * CIRC + 2)}
                    strokeLinecap="round" />
          )}
          <circle cx={CENTER} cy={CENTER} r={R} fill="none"
                  stroke="var(--mg-500)" strokeWidth={STROKE}
                  strokeDasharray={`${activeDash} ${CIRC}`}
                  strokeDashoffset={0} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[20px] font-[500] text-[var(--text)] tabular-nums leading-none">
            {displayVal}
          </span>
          <span className="text-[9px] text-[var(--hint)] uppercase tracking-[.07em] mt-[2px]">aktivnih</span>
        </div>
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--mg-500)]" />
          <span className="text-[12px] text-[var(--muted)]">{active} aktivnih</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--raised)] border border-[var(--border-m)]" />
          <span className="text-[12px] text-[var(--hint)]">{former} bivših</span>
        </div>
      </div>
    </div>
  )
}
