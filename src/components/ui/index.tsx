import { forwardRef } from 'react'
import { clsx } from 'clsx'

// Re-exports
export { Select } from './Select'
export type { SelectOption } from './Select'
export { Modal } from './Modal'
export { Table } from './Table'
export { AlarmCard } from './AlarmCard'
export { StatCard } from './StatCard'

// ── Input ──────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftAddon, className, id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-[500] text-[var(--muted)]">
          {label}
          {props.required && <span className="text-[var(--crit-acc)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--hint)]">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-[8px] border-[0.5px] text-[13px] transition-colors',
            'bg-[var(--raised)] text-[var(--text)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--border-f)] focus:border-transparent',
            'disabled:opacity-40',
            'placeholder:text-[var(--hint)]',
            error
              ? 'border-[var(--crit-b)] bg-[var(--crit-bg)]'
              : 'border-[var(--border)]',
            leftAddon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-[var(--crit-t)]">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[var(--hint)]">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'

// ── Card ──────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const cardPadding = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export function Card({ children, className, padding = 'md', onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--surf)] rounded-[10px] border-[0.5px] border-[var(--border)]',
        cardPadding[padding],
        onClick && 'cursor-pointer hover:-translate-y-[1px] hover:border-[var(--border-m)] transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--raised)] text-[var(--muted)] border-[var(--border)]',
  success: 'bg-[var(--ok-bg)] text-[var(--ok-t)] border-[var(--ok-b)]',
  warning: 'bg-[var(--warn-bg)] text-[var(--warn-t)] border-[var(--warn-b)]',
  danger:  'bg-[var(--crit-bg)] text-[var(--crit-t)] border-[var(--crit-b)]',
  info:    'bg-[var(--info-bg)] text-[var(--info-t)] border-[var(--info-b)]',
  purple:  'bg-[var(--mg-50)] text-[var(--mg-700)] border-[rgba(236,75,172,.3)]',
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-[500] rounded-full border-[0.5px]',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }
  return (
    <svg className={clsx('animate-spin text-[var(--mg-500)]', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  children: React.ReactNode
  className?: string
}

const alertStyles: Record<string, string> = {
  info:    'bg-[var(--info-bg)] border-[var(--info-b)] text-[var(--info-t)]',
  success: 'bg-[var(--ok-bg)] border-[var(--ok-b)] text-[var(--ok-t)]',
  warning: 'bg-[var(--warn-bg)] border-[var(--warn-b)] text-[var(--warn-t)]',
  danger:  'bg-[var(--crit-bg)] border-[var(--crit-b)] text-[var(--crit-t)]',
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div className={clsx(
      'rounded-[9px] border-[0.5px] p-4',
      alertStyles[variant],
      className
    )}>
      {title && <p className="font-[500] text-[13px] mb-1">{title}</p>}
      <div className="text-[12px]">{children}</div>
    </div>
  )
}
