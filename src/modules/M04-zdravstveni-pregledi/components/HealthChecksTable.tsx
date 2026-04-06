// [ZAK: čl. 34 ZZnR] Tablica zdravstvenih pregleda

import { useLocation } from 'wouter'
import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { HealthCheckWithWorker } from '../types'
import { CHECK_TYPES, RESULT_BADGE, computeCheckStatus } from '../types'

interface Props {
  checks: HealthCheckWithWorker[]
  isLoading: boolean
  showWorkerName?: boolean
}

const NEXT_CHECK_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ok:             { variant: 'success', label: 'Uredan' },
  expiring_soon:  { variant: 'warning', label: 'Uskoro' },
  expired:        { variant: 'danger',  label: 'Istekao' },
}

export function HealthChecksTable({ checks, isLoading, showWorkerName = true }: Props) {
  const [, navigate] = useLocation()

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>

  if (checks.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-lg font-medium">Nema zdravstvenih pregleda</p>
        <p className="text-sm mt-1">Dodajte pregled za djelatnika s posebnim uvjetima rada.</p>
      </div>
    )
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {showWorkerName && <Table.HeaderCell>Djelatnik</Table.HeaderCell>}
          <Table.HeaderCell>Vrsta</Table.HeaderCell>
          <Table.HeaderCell>Datum</Table.HeaderCell>
          <Table.HeaderCell>Sljedeći</Table.HeaderCell>
          <Table.HeaderCell>Rezultat</Table.HeaderCell>
          <Table.HeaderCell>Rok</Table.HeaderCell>
          <Table.HeaderCell>Ustanova</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {checks.map(c => {
          const resultBadge = RESULT_BADGE[c.result] ?? RESULT_BADGE.fit
          const typeLabel = CHECK_TYPES.find(t => t.value === c.check_type)?.label ?? c.check_type
          const nextStatus = computeCheckStatus(c.next_check_date)
          const nextBadge = NEXT_CHECK_BADGE[nextStatus]
          return (
            <Table.Row key={c.id} onClick={() => navigate(`/radnici/${c.worker_id}`)}>
              {showWorkerName && (
                <Table.Cell>
                  <span className="font-medium text-[var(--text)]">
                    {c.worker ? `${c.worker.first_name} ${c.worker.last_name}` : '—'}
                  </span>
                </Table.Cell>
              )}
              <Table.Cell><span className="text-xs">{typeLabel}</span></Table.Cell>
              <Table.Cell>{new Date(c.check_date).toLocaleDateString('hr-HR')}</Table.Cell>
              <Table.Cell>
                {c.next_check_date
                  ? new Date(c.next_check_date).toLocaleDateString('hr-HR')
                  : <span className="text-[var(--hint)]">—</span>}
              </Table.Cell>
              <Table.Cell><Badge variant={resultBadge.variant}>{resultBadge.label}</Badge></Table.Cell>
              <Table.Cell><Badge variant={nextBadge.variant}>{nextBadge.label}</Badge></Table.Cell>
              <Table.Cell>{c.institution ?? <span className="text-[var(--hint)]">—</span>}</Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
