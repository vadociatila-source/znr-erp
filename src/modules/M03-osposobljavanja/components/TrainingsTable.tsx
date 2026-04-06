// Lista osposobljavanja — tabela
// [ZAK: čl. 27 ZZnR] Status: valid / expiring_soon / expired

import { useLocation } from 'wouter'
import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { TrainingWithWorker } from '../types'
import { TRAINING_TYPES } from '../types'

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  valid:          { variant: 'success', label: 'Važeće' },
  expiring_soon:  { variant: 'warning', label: 'Uskoro ističe' },
  expired:        { variant: 'danger',  label: 'Isteklo' },
}

interface Props {
  trainings: TrainingWithWorker[]
  isLoading: boolean
  showWorkerName?: boolean
}

export function TrainingsTable({ trainings, isLoading, showWorkerName = true }: Props) {
  const [, navigate] = useLocation()

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" className="text-brand-600" /></div>
  }

  if (trainings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg font-medium">Nema osposobljavanja</p>
        <p className="text-sm mt-1">Dodajte novo osposobljavanje za djelatnika.</p>
      </div>
    )
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {showWorkerName && <Table.HeaderCell>Djelatnik</Table.HeaderCell>}
          <Table.HeaderCell>Naziv</Table.HeaderCell>
          <Table.HeaderCell>Vrsta</Table.HeaderCell>
          <Table.HeaderCell>Datum</Table.HeaderCell>
          <Table.HeaderCell>Vrijedi do</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Izvoditelj</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {trainings.map(t => {
          const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.valid
          const typeLabel = TRAINING_TYPES.find(tt => tt.value === t.training_type)?.label ?? t.training_type
          return (
            <Table.Row
              key={t.id}
              onClick={() => navigate(`/radnici/${t.worker_id}`)}
            >
              {showWorkerName && (
                <Table.Cell>
                  <span className="font-medium text-slate-900">
                    {t.worker ? `${t.worker.first_name} ${t.worker.last_name}` : '—'}
                  </span>
                </Table.Cell>
              )}
              <Table.Cell>
                <span className="font-medium text-slate-900">{t.training_name}</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs text-slate-500">{typeLabel}</span>
              </Table.Cell>
              <Table.Cell>
                {new Date(t.training_date).toLocaleDateString('hr-HR')}
              </Table.Cell>
              <Table.Cell>
                {t.valid_until
                  ? new Date(t.valid_until).toLocaleDateString('hr-HR')
                  : <span className="text-slate-300">Trajno</span>}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </Table.Cell>
              <Table.Cell>{t.provider ?? <span className="text-slate-300">—</span>}</Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
