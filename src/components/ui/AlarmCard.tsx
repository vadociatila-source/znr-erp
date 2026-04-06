// AlarmCard — RAL 7024 Graphite × Magenta | WCAG verified
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
    title: 'text-[var(--crit-t)]',
    badge: 'bg-[var(--crit-bdg)] border-[var(--crit-bdgb)] text-[var(--crit-t)]',
  },
  warning: {
    card:  'bg-[var(--warn-bg)] border-[var(--warn-b)]',
    acc:   'bg-[var(--warn-acc)]',
    dot:   'bg-[var(--warn-dot)]',
    title: 'text-[var(--warn-t)]',
    badge: 'bg-[var(--warn-bdg)] border-[var(--warn-bdgb)] text-[var(--warn-t)]',
  },
  info: {
    card:  'bg-[var(--info-bg)] border-[var(--info-b)]',
    acc:   'bg-[var(--info-acc)]',
    dot:   'bg-[var(--info-dot)]',
    title: 'text-[var(--info-t)]',
    badge: 'bg-[var(--info-bdg)] border-[var(--info-bdgb)] text-[var(--info-t)]',
  },
  ok: {
    card:  'bg-[var(--ok-bg)] border-[var(--ok-b)]',
    acc:   'bg-[var(--ok-acc)]',
    dot:   'bg-[var(--ok-dot)]',
    title: 'text-[var(--ok-t)]',
    badge: 'bg-transparent border-[var(--ok-b)] text-[var(--ok-t)]',
  },
} satisfies Record<AlarmLevel, Record<string, string>>

export function AlarmCard({ level, title, meta, badge, onClick, index = 0 }: AlarmCardProps) {
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
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.acc}`}
            style={{ borderRadius: 0 }} aria-hidden="true" />
      <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ml-[2px] ${s.dot}`}
            aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-[500] leading-snug truncate ${s.title}`}>{title}</p>
        <p className="text-[11px] text-[var(--muted)] mt-[2px] truncate">{meta}</p>
      </div>
      <span className={`font-mono text-[9px] font-[500] px-[7px] py-[2px]
                        rounded-full flex-shrink-0 border-[0.5px] ${s.badge}`}>
        {badge}
      </span>
    </button>
  )
}
