import { clsx } from 'clsx'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function TableRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border-[0.5px] border-[var(--border)]">
      <table className={clsx('w-full text-[13px]', className)}>{children}</table>
    </div>
  )
}

function Header({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={clsx('bg-[var(--sunken)] border-b border-[var(--border)]', className)}>{children}</thead>
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={clsx('divide-y divide-[var(--border-s)]', className)}>{children}</tbody>
}

interface RowProps { children: React.ReactNode; className?: string; onClick?: () => void }

function Row({ children, className, onClick }: RowProps) {
  return (
    <tr className={clsx('transition-colors', onClick && 'cursor-pointer hover:bg-[var(--raised)]', className)}
        onClick={onClick}>{children}</tr>
  )
}

interface HeaderCellProps {
  children: React.ReactNode; className?: string
  sortable?: boolean; sortDirection?: 'asc' | 'desc' | null; onSort?: () => void
}

function HeaderCell({ children, className, sortable, sortDirection, onSort }: HeaderCellProps) {
  return (
    <th className={clsx(
      'px-4 py-3 text-left text-[10px] font-[500] uppercase tracking-[0.07em] text-[var(--hint)]',
      sortable && 'cursor-pointer select-none hover:text-[var(--muted)]', className
    )} onClick={sortable ? onSort : undefined}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          sortDirection === 'asc' ? <ChevronUp size={14} /> :
          sortDirection === 'desc' ? <ChevronDown size={14} /> :
          <ChevronsUpDown size={14} className="text-[var(--hint)]" />
        )}
      </span>
    </th>
  )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3 text-[var(--text)]', className)}>{children}</td>
}

export const Table = Object.assign(TableRoot, { Header, Body, Row, HeaderCell, Cell })
