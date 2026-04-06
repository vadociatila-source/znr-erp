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
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
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
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full rounded-lg border text-sm transition-colors appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-400',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-slate-300 bg-white',
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
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
})
Select.displayName = 'Select'
