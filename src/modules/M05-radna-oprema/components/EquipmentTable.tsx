// [ZAK: PR-04 NN 16/16] Tablica radne opreme

import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { EquipmentRow } from '../types'
import { EQUIPMENT_TYPES, computeInspectionStatus } from '../types'

const INSPECTION_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ok:             { variant: 'success', label: 'Uredan' },
  expiring_soon:  { variant: 'warning', label: 'Uskoro' },
  expired:        { variant: 'danger',  label: 'Istekao' },
}

const STATUS_BADGE: Record<string, { variant: 'success' | 'default' | 'danger'; label: string }> = {
  active:         { variant: 'success', label: 'Aktivna' },
  out_of_service: { variant: 'default', label: 'Izvan uporabe' },
  disposed:       { variant: 'danger',  label: 'Rashodovana' },
}

interface Props {
  items: EquipmentRow[]
  isLoading: boolean
}

export function EquipmentTable({ items, isLoading }: Props) {
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-lg font-medium">Nema opreme</p>
        <p className="text-sm mt-1">Dodajte radnu opremu ili vatrogasne aparate.</p>
      </div>
    )
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Naziv</Table.HeaderCell>
          <Table.HeaderCell>Vrsta</Table.HeaderCell>
          <Table.HeaderCell>Serijski br.</Table.HeaderCell>
          <Table.HeaderCell>Lokacija</Table.HeaderCell>
          <Table.HeaderCell>Zadnji pregled</Table.HeaderCell>
          <Table.HeaderCell>Sljedeći</Table.HeaderCell>
          <Table.HeaderCell>Rok</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map(eq => {
          const typeLabel = EQUIPMENT_TYPES.find(t => t.value === eq.equipment_type)?.label ?? eq.equipment_type
          const inspStatus = computeInspectionStatus(eq.next_inspection_date)
          const inspBadge = INSPECTION_BADGE[inspStatus]
          const stBadge = STATUS_BADGE[eq.status] ?? STATUS_BADGE.active
          return (
            <Table.Row key={eq.id}>
              <Table.Cell>
                <span className="font-medium text-[var(--text)]">{eq.name}</span>
                {eq.manufacturer && <p className="text-xs text-[var(--hint)]">{eq.manufacturer} {eq.model ?? ''}</p>}
              </Table.Cell>
              <Table.Cell><span className="text-xs">{typeLabel}</span></Table.Cell>
              <Table.Cell>
                {eq.serial_number ? <span className="font-mono text-xs">{eq.serial_number}</span> : <span className="text-[var(--hint)]">—</span>}
              </Table.Cell>
              <Table.Cell>{eq.location ?? <span className="text-[var(--hint)]">—</span>}</Table.Cell>
              <Table.Cell>
                {eq.last_inspection_date ? new Date(eq.last_inspection_date).toLocaleDateString('hr-HR') : <span className="text-[var(--hint)]">—</span>}
              </Table.Cell>
              <Table.Cell>
                {eq.next_inspection_date ? new Date(eq.next_inspection_date).toLocaleDateString('hr-HR') : <span className="text-[var(--hint)]">—</span>}
              </Table.Cell>
              <Table.Cell><Badge variant={inspBadge.variant}>{inspBadge.label}</Badge></Table.Cell>
              <Table.Cell><Badge variant={stBadge.variant}>{stBadge.label}</Badge></Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
