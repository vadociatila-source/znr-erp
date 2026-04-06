import { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  leftAddon?: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, hint, options, placeholder, leftAddon, className, id, ...props
}, ref) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-[12px] font-[500] text-[var(--muted)]">
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
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full rounded-[8px] border-[0.5px] text-[13px] transition-colors appearance-none',
            'bg-[var(--raised)] text-[var(--text)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--border-f)] focus:border-transparent',
            'disabled:opacity-40',
            error ? 'border-[var(--crit-b)]' : 'border-[var(--border)]',
            leftAddon ? 'pl-9 pr-8 py-2' : 'pl-3 pr-8 py-2',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[var(--hint)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && <p className="text-[11px] text-[var(--crit-t)]">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[var(--hint)]">{hint}</p>}
    </div>
  )
})
Select.displayName = 'Select'
