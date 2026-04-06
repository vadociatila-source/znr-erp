// CriticalArc — 220° arc, animirani counter, boja po severity
import { useEffect, useRef, useState } from 'react'

interface CriticalArcProps {
  critical: number
  total: number
}

export function CriticalArc({ critical, total }: CriticalArcProps) {
  const SIZE = 100
  const STROKE = 3
  const R = SIZE / 2 - STROKE - 4
  const CENTER = SIZE / 2
  const CIRC = 2 * Math.PI * R
  const ARC_PCT = 220 / 360
  const pct = total > 0 ? critical / total : 0

  const [drawn, setDrawn] = useState(0)
  const [displayVal, setDisplayVal] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const DURATION = 800
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setDrawn(eased * pct)
      setDisplayVal(Math.round(eased * critical))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    const timeout = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 400)
    return () => { clearTimeout(timeout); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [critical, pct])

  const color = pct === 0 ? 'var(--ok-dot)' : pct < 0.1 ? 'var(--warn-dot)' : 'var(--crit-dot)'
  const dashFill = drawn * ARC_PCT * CIRC
  const dashTotal = ARC_PCT * CIRC

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
             style={{ transform: 'rotate(125deg)' }}>
          <circle cx={CENTER} cy={CENTER} r={R} fill="none"
                  stroke="var(--raised)" strokeWidth={STROKE}
                  strokeDasharray={`${dashTotal} ${CIRC}`}
                  strokeDashoffset={0} strokeLinecap="round" />
          <circle cx={CENTER} cy={CENTER} r={R} fill="none"
                  stroke={color} strokeWidth={STROKE}
                  strokeDasharray={`${dashFill} ${CIRC}`}
                  strokeDashoffset={0} strokeLinecap="round"
                  style={{ transition: 'stroke 400ms ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[22px] font-[500] tabular-nums leading-none" style={{ color }}>
            {displayVal}
          </span>
          <span className="text-[9px] text-[var(--hint)] uppercase tracking-[.07em] mt-1">od {total}</span>
        </div>
      </div>
      <p className="text-[11px] font-[500] mt-[-4px] transition-colors duration-300" style={{ color }}>
        {pct === 0 ? '✓ sve uredno' : `${Math.round(pct * 100)}% kritičnih`}
      </p>
    </div>
  )
}
