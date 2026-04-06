// StatCard — RAL 7024 Graphite × Magenta
type StatVariant = 'default' | 'accent' | 'critical' | 'warning'

const SV: Record<StatVariant, { wrap: string; val: string }> = {
  default:  { wrap: 'bg-[var(--surf)] border-[var(--border)]', val: 'text-[var(--text)]' },
  accent:   { wrap: 'bg-[var(--mg-50)] border-[rgba(236,75,172,.25)]', val: 'text-[var(--mg-600)]' },
  critical: { wrap: 'bg-[var(--surf)] border-[var(--border)]', val: 'text-[var(--crit-t)]' },
  warning:  { wrap: 'bg-[var(--surf)] border-[var(--border)]', val: 'text-[var(--warn-t)]' },
}

interface StatCardProps {
  value: number | string
  label: string
  variant?: StatVariant
  index?: number
  onClick?: () => void
}

export function StatCard({ value, label, variant = 'default', index = 0, onClick }: StatCardProps) {
  const v = SV[variant]
  return (
    <div
      style={{ '--i': index } as React.CSSProperties}
      onClick={onClick}
      className={`animate-stagger rounded-[10px] p-[13px_14px] border-[0.5px]
                  transition-[transform,border-color] duration-200
                  hover:-translate-y-[1.5px] hover:border-[var(--border-m)]
                  ${onClick ? 'cursor-pointer' : 'cursor-default'} select-none ${v.wrap}`}
    >
      <p className={`text-[22px] font-[500] leading-none tabular-nums ${v.val}`}>{value}</p>
      <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-[var(--hint)] mt-[6px]">{label}</p>
    </div>
  )
}
