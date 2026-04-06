import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}

const sizeStyles = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={clsx(
        'relative w-full bg-[var(--surf)] rounded-[12px] border-[0.5px] border-[var(--border)] shadow-2xl',
        'animate-enter',
        sizeStyles[size]
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-s)]">
            <h2 className="text-[15px] font-[500] text-[var(--text)]">{title}</h2>
            <button onClick={onClose}
              className="p-1 rounded-lg text-[var(--hint)] hover:text-[var(--text)] hover:bg-[var(--raised)] transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-s)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
