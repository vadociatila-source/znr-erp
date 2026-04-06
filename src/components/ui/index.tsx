import { forwardRef } from 'react'
import { clsx } from 'clsx'

// Re-exports
export { Select } from './Select'
export type { SelectOption } from './Select'
export { Modal } from './Modal'
export { Table } from './Table'

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
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-400',
            'placeholder:text-slate-400',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-slate-300 bg-white',
            leftAddon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'

// ── Card ──────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const cardPadding = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={clsx(
      'bg-white rounded-xl border border-slate-200 shadow-sm',
      cardPadding[padding],
      className
    )}>
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
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  purple:  'bg-purple-100 text-purple-700',
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
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
    <svg className={clsx('animate-spin', sizes[size], className)} fill="none" viewBox="0 0 24 24">
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
  info:    'bg-blue-50 border-blue-400 text-blue-800',
  success: 'bg-green-50 border-green-400 text-green-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  danger:  'bg-red-50 border-red-400 text-red-800',
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div className={clsx(
      'rounded-lg border p-4',
      alertStyles[variant],
      className
    )}>
      {title && <p className="font-semibold text-sm mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  )
}
