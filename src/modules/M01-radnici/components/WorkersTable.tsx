// Lista radnika — tabela s klikabilnim redovima
// [ZAK: čl. 61 ZZnR] Bivši radnici se prikazuju, nikad ne brišu

import { useLocation } from 'wouter'
import { AlertTriangle, Shield } from 'lucide-react'
import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { WorkerWithPosition } from '../types'

interface WorkersTableProps {
  workers: WorkerWithPosition[]
  isLoading: boolean
}

export function WorkersTable({ workers, isLoading }: WorkersTableProps) {
  const [, navigate] = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-[var(--mg-500)]" />
      </div>
    )
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-lg font-medium">Nema djelatnika</p>
        <p className="text-sm mt-1">Promijenite filter ili dodajte novog djelatnika.</p>
      </div>
    )
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Ime i prezime</Table.HeaderCell>
          <Table.HeaderCell>OIB</Table.HeaderCell>
          <Table.HeaderCell>Radno mjesto</Table.HeaderCell>
          <Table.HeaderCell>Odjel</Table.HeaderCell>
          <Table.HeaderCell>Datum zaposlenja</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell className="w-10">{''}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {workers.map(w => {
          const missingData = !w.oib || !w.employment_date
          return (
            <Table.Row key={w.id} onClick={() => navigate(`/radnici/${w.id}`)}>
              <Table.Cell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text)]">
                    {w.first_name} {w.last_name}
                  </span>
                  {w.is_special_conditions && (
                    <span title="Posebni uvjeti rada"><Shield size={14} className="text-[var(--warn-acc)]" /></span>
                  )}
                </div>
                {w.email && (
                  <p className="text-xs text-[var(--hint)] mt-0.5">{w.email}</p>
                )}
              </Table.Cell>
              <Table.Cell>
                {w.oib ? (
                  <span className="font-mono text-xs">{w.oib}</span>
                ) : (
                  <span className="text-[var(--hint)] text-xs">—</span>
                )}
              </Table.Cell>
              <Table.Cell>{w.work_position?.name ?? <span className="text-[var(--hint)]">—</span>}</Table.Cell>
              <Table.Cell>{w.department ?? <span className="text-[var(--hint)]">—</span>}</Table.Cell>
              <Table.Cell>
                {w.employment_date ? (
                  new Date(w.employment_date).toLocaleDateString('hr-HR')
                ) : (
                  <span className="text-[var(--hint)]">—</span>
                )}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={w.status === 'active' ? 'success' : 'default'}>
                  {w.status === 'active' ? 'Aktivan' : 'Bivši'}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {missingData && (
                  <span title="Nepotpuni podaci"><AlertTriangle size={14} className="text-[var(--warn-acc)]" /></span>
                )}
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
