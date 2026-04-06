// ComplianceChart — horizontalni segment bars, spring grow
import { useEffect, useState } from 'react'

interface ComplianceItem {
  label: string
  ok: number
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
        const okPct = item.total > 0 ? (item.ok / item.total) * 100 : 0
        const animated = okPct * progress
        const isGood = okPct >= 80

        return (
          <div key={item.label} className="group"
            style={{
              opacity: progress > (i * 0.15) ? 1 : 0,
              transform: `translateX(${(1 - Math.min(progress / (0.3 + i * 0.1), 1)) * -8}px)`,
              transition: 'opacity 200ms ease-out, transform 200ms ease-out',
            }}>
            <div className="flex items-center justify-between mb-[5px]">
              <span className="text-[11px] text-[var(--muted)] font-[500]">{item.label}</span>
              <span className="font-mono text-[11px] text-[var(--hint)] group-hover:text-[var(--muted)] transition-colors duration-150">
                {item.ok}/{item.total}
              </span>
            </div>
            <div className="relative h-[3px] w-full bg-[var(--raised)] rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${animated}%`,
                  background: isGood ? 'var(--mg-500)' : okPct >= 50 ? 'var(--warn-dot)' : 'var(--crit-dot)',
                  transition: 'background 300ms ease',
                }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
