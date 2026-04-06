// [ZAK] LegalBadge — prikazuje zakonski okvir uz svaki alarm/evidenciju
// Ovo je naš ključni differentiator: korisnik uvijek vidi zakon iza akcije
// NIKAD ne prikazuj alarm bez zakonske osnove

import { clsx } from 'clsx'
import type { LegalReference } from '@/types/legal.types'

interface LegalBadgeProps {
  legalRef?: LegalReference | null
  // Ili direktni props (ako nemaš LegalReference objekt)
  article?: string
  deadline?: string
  penalty?: string
  size?: 'xs' | 'sm'
  className?: string
}

export function LegalBadge({
  legalRef,
  article,
  deadline,
  penalty,
  size = 'xs',
  className,
}: LegalBadgeProps) {
  const displayArticle = legalRef?.article ?? article
  const displayDeadline = legalRef?.deadline_description ?? deadline

  if (!displayArticle && !displayDeadline) return null

  return (
    <div className={clsx(
      'inline-flex flex-wrap items-center gap-1.5',
      className
    )}>
      {displayArticle && (
        <span className={clsx(
          'legal-badge',
          size === 'xs' ? 'text-xs' : 'text-sm'
        )}>
          ⚖️ {displayArticle}
        </span>
      )}
      {displayDeadline && (
        <span className={clsx(
          'inline-flex items-center text-slate-500 font-mono',
          size === 'xs' ? 'text-xs' : 'text-sm'
        )}>
          {displayDeadline}
        </span>
      )}
      {penalty && (
        <span className={clsx(
          'inline-flex items-center text-red-600 font-medium',
          size === 'xs' ? 'text-xs' : 'text-sm'
        )}>
          {penalty}
        </span>
      )}
    </div>
  )
}

// Tooltip verzija — hover prikazuje detalje zakona
interface LegalTooltipProps {
  legalRef: LegalReference
  children: React.ReactNode
}

export function LegalTooltip({ legalRef, children }: LegalTooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className={clsx(
        'absolute bottom-full left-0 mb-2 z-50',
        'w-72 p-3 rounded-lg shadow-lg border',
        'bg-slate-900 text-white text-xs',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
        'pointer-events-none'
      )}>
        <p className="font-semibold mb-1">{legalRef.title}</p>
        {legalRef.article && (
          <p className="text-slate-300">{legalRef.article}</p>
        )}
        {legalRef.nn_number && (
          <p className="text-slate-400 mt-0.5">{legalRef.nn_number}</p>
        )}
        {legalRef.deadline_description && (
          <p className="text-amber-300 mt-1.5 font-medium">
            ⏱ {legalRef.deadline_description}
          </p>
        )}
        {legalRef.source_url && (
          <a
            href={legalRef.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 mt-1.5 block hover:underline pointer-events-auto"
          >
            Pročitaj zakon →
          </a>
        )}
      </div>
    </div>
  )
}
