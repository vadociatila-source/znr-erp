// [ZAK: čl. 62 ZZnR] Tablica ozljeda na radu
import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { IncidentWithWorker } from '../types'
import { INCIDENT_STATUSES, compute48hStatus } from '../types'

const HZZO_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ok:       { variant: 'success', label: 'Prijavljeno' },
  urgent:   { variant: 'warning', label: '< 24h' },
  critical: { variant: 'danger',  label: 'KASNI!' },
}

interface Props { incidents: IncidentWithWorker[]; isLoading: boolean }

export function IncidentsTable({ incidents, isLoading }: Props) {
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>
  if (incidents.length === 0) {
    return <div className="text-center py-12 text-[var(--muted)]">
      <p className="text-lg font-medium">Nema prijavljenih ozljeda</p>
    </div>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Djelatnik</Table.HeaderCell>
          <Table.HeaderCell>Datum</Table.HeaderCell>
          <Table.HeaderCell>Opis</Table.HeaderCell>
          <Table.HeaderCell>HZZO prijava</Table.HeaderCell>
          <Table.HeaderCell>Rok (48h)</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {incidents.map(inc => {
          const hzzoStatus = compute48hStatus(inc.report_deadline, inc.hzzo_reported)
          const hzzoBadge = HZZO_BADGE[hzzoStatus]
          const statusLabel = INCIDENT_STATUSES.find(s => s.value === inc.status)?.label ?? inc.status
          return (
            <Table.Row key={inc.id}>
              <Table.Cell>
                <span className="font-medium text-[var(--text)]">
                  {inc.worker ? `${inc.worker.first_name} ${inc.worker.last_name}` : '—'}
                </span>
              </Table.Cell>
              <Table.Cell>{new Date(inc.incident_date).toLocaleDateString('hr-HR')}</Table.Cell>
              <Table.Cell>
                <span className="text-sm truncate block max-w-[200px]">{inc.description}</span>
              </Table.Cell>
              <Table.Cell>
                {inc.hzzo_reported
                  ? <Badge variant="success">Da</Badge>
                  : <Badge variant={hzzoBadge.variant}>{hzzoBadge.label}</Badge>}
              </Table.Cell>
              <Table.Cell>
                {new Date(inc.report_deadline).toLocaleString('hr-HR', { dateStyle: 'short', timeStyle: 'short' })}
              </Table.Cell>
              <Table.Cell><Badge variant="info">{statusLabel}</Badge></Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
