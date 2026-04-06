// [ZAK] LegalBadge — Magenta pill | WCAG verified
// --mg-700 (#F9A8DA) na --mg-50 (#1D0B16) = 9.2:1 ✅ AAA
import type { LegalReference } from '@/types/legal.types'

interface LegalBadgeProps {
  legalRef?: LegalReference | null
  article?: string
  deadline?: string
  penalty?: string
  size?: 'xs' | 'sm'
  className?: string
}

export function LegalBadge({
  legalRef, article, deadline, penalty, size = 'xs', className,
}: LegalBadgeProps) {
  const displayArticle = legalRef?.article ?? article
  const displayDeadline = legalRef?.deadline_description ?? deadline

  if (!displayArticle && !displayDeadline) return null

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className ?? ''}`}>
      {displayArticle && (
        <span className={`inline-flex items-center gap-[5px] px-[8px] py-[2px]
                         rounded-full bg-[var(--mg-50)]
                         border-[0.5px] border-[rgba(236,75,172,.3)]
                         text-[var(--mg-700)] font-[500]
                         ${size === 'xs' ? 'text-[11px]' : 'text-[12px]'}`}>
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--mg-500)]" />
          {displayArticle}
        </span>
      )}
      {displayDeadline && (
        <span className={`font-mono text-[var(--muted)]
                         ${size === 'xs' ? 'text-[11px]' : 'text-[12px]'}`}>
          {displayDeadline}
        </span>
      )}
      {penalty && (
        <span className="px-[7px] py-[2px] rounded-full
                         bg-[var(--crit-bdg)] border-[0.5px] border-[var(--crit-bdgb)]
                         text-[var(--crit-t)] text-[10px] font-[500]">
          {penalty}
        </span>
      )}
    </div>
  )
}

// Tooltip verzija
interface LegalTooltipProps {
  legalRef: LegalReference
  children: React.ReactNode
}

export function LegalTooltip({ legalRef, children }: LegalTooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-0 mb-2 z-50
                      w-72 p-3 rounded-lg shadow-lg border border-[var(--border)]
                      bg-[var(--sunken)] text-[var(--text)] text-xs
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150
                      pointer-events-none">
        <p className="font-semibold mb-1">{legalRef.title}</p>
        {legalRef.article && <p className="text-[var(--muted)]">{legalRef.article}</p>}
        {legalRef.nn_number && <p className="text-[var(--hint)] mt-0.5">{legalRef.nn_number}</p>}
        {legalRef.deadline_description && (
          <p className="text-[var(--warn-t)] mt-1.5 font-medium">⏱ {legalRef.deadline_description}</p>
        )}
      </div>
    </div>
  )
}
