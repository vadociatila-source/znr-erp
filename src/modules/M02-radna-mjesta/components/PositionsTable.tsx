// [ZAK: čl. 18 ZZnR] Tablica radnih mjesta
import { Table } from '@/components/ui/Table'
import { Badge, Spinner } from '@/components/ui/index'
import type { WorkPositionRow } from '../types'
import { RISK_LEVELS, computeRiskAssessmentStatus } from '../types'

const RA_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ok:             { variant: 'success', label: 'Uredan' },
  expiring_soon:  { variant: 'warning', label: 'Uskoro' },
  expired:        { variant: 'danger',  label: 'Istekla' },
}

interface Props { positions: WorkPositionRow[]; isLoading: boolean }

export function PositionsTable({ positions, isLoading }: Props) {
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>
  if (positions.length === 0) {
    return <div className="text-center py-12 text-[var(--muted)]">
      <p className="text-lg font-medium">Nema radnih mjesta</p>
      <p className="text-sm mt-1">Dodajte radno mjesto.</p>
    </div>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Naziv</Table.HeaderCell>
          <Table.HeaderCell>Šifra</Table.HeaderCell>
          <Table.HeaderCell>Posebni uvjeti</Table.HeaderCell>
          <Table.HeaderCell>Razina rizika</Table.HeaderCell>
          <Table.HeaderCell>Procjena rizika</Table.HeaderCell>
          <Table.HeaderCell>Sljedeća revizija</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {positions.map(p => {
          const riskLabel = RISK_LEVELS.find(r => r.value === p.residual_risk_level)?.label ?? '—'
          const raStatus = computeRiskAssessmentStatus(p.risk_assessment_next)
          const raBadge = RA_BADGE[raStatus]
          return (
            <Table.Row key={p.id}>
              <Table.Cell><span className="font-medium text-[var(--text)]">{p.name}</span></Table.Cell>
              <Table.Cell>{p.code ?? <span className="text-[var(--hint)]">—</span>}</Table.Cell>
              <Table.Cell>
                {p.is_special_conditions
                  ? <Badge variant="warning">Da</Badge>
                  : <span className="text-[var(--hint)]">Ne</span>}
              </Table.Cell>
              <Table.Cell>{riskLabel}</Table.Cell>
              <Table.Cell><Badge variant={raBadge.variant}>{raBadge.label}</Badge></Table.Cell>
              <Table.Cell>
                {p.risk_assessment_next
                  ? new Date(p.risk_assessment_next).toLocaleDateString('hr-HR')
                  : <span className="text-[var(--hint)]">—</span>}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={p.status === 'active' ? 'success' : 'default'}>
                  {p.status === 'active' ? 'Aktivno' : 'Neaktivno'}
                </Badge>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
