import { clsx } from 'clsx'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

// ── Table compound component ──────────────────────────────────

function TableRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className={clsx('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

function Header({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={clsx('bg-slate-50 border-b border-slate-200', className)}>
      {children}
    </thead>
  )
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={clsx('divide-y divide-slate-100', className)}>{children}</tbody>
}

interface RowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

function Row({ children, className, onClick }: RowProps) {
  return (
    <tr
      className={clsx(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-slate-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface HeaderCellProps {
  children: React.ReactNode
  className?: string
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

function HeaderCell({ children, className, sortable, sortDirection, onSort }: HeaderCellProps) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider',
        sortable && 'cursor-pointer select-none hover:text-slate-700',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          sortDirection === 'asc' ? <ChevronUp size={14} /> :
          sortDirection === 'desc' ? <ChevronDown size={14} /> :
          <ChevronsUpDown size={14} className="text-slate-300" />
        )}
      </span>
    </th>
  )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3 text-slate-700', className)}>{children}</td>
}

export const Table = Object.assign(TableRoot, {
  Header,
  Body,
  Row,
  HeaderCell,
  Cell,
})
