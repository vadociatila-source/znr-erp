// Button — RAL 7024 Graphite × Magenta | WCAG verified
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const BV: Record<ButtonVariant, string> = {
  primary: `bg-[var(--mg-500)] text-white border-transparent
            hover:bg-[var(--mg-600)] active:bg-[var(--mg-400)]
            shadow-[0_2px_8px_var(--mg-glow)]
            hover:shadow-[0_4px_14px_rgba(236,75,172,.25)]`,
  secondary: `bg-[var(--surf)] text-[var(--text)] border-[var(--border)]
              hover:bg-[var(--raised)] hover:border-[var(--border-m)]`,
  ghost: `bg-transparent text-[var(--muted)] border-transparent
          hover:bg-[var(--raised)] hover:text-[var(--text)]`,
  outline: `bg-transparent text-[var(--text)] border-[var(--border)]
            hover:bg-[var(--surf)] hover:border-[var(--border-m)]`,
  danger: `bg-[var(--crit-bg)] text-[var(--crit-t)] border-[var(--crit-b)]
           hover:bg-[rgba(239,68,68,.12)]`,
}

const BS: Record<ButtonSize, string> = {
  sm: 'px-3 py-[6px] text-[12px] rounded-[8px] gap-1.5',
  md: 'px-4 py-[8px] text-[13px] rounded-[10px] gap-2',
  lg: 'px-5 py-[10px] text-[14px] rounded-[10px] gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', isLoading = false,
  leftIcon, rightIcon, className, disabled, children, ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-[500] border-[0.5px]
                  transition-all duration-150 hover:-translate-y-px
                  active:scale-[0.98] focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[var(--border-f)]
                  disabled:opacity-40 disabled:pointer-events-none
                  ${BV[variant]} ${BS[size]} ${className ?? ''}`}
      {...props}
    >
      {isLoading && (
        <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
      )}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})
Button.displayName = 'Button'
