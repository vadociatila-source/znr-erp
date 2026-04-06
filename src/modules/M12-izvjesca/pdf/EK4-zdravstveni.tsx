// EK-4 — Evidencija o zdravstvenim pregledima
// [ZAK: čl. 34 ZZnR]
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles as s, formatDate } from './styles'
import type { HealthCheckRow } from '@/modules/M04-zdravstveni-pregledi/types'
import { CHECK_TYPES, RESULT_OPTIONS } from '@/modules/M04-zdravstveni-pregledi/types'

interface Props {
  workerName: string
  checks: HealthCheckRow[]
  tenantName: string
}

export function EK4Dokument({ workerName, checks, tenantName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>EK-4 — Evidencija o zdravstvenim pregledima</Text>
          <Text style={s.subtitle}>{tenantName} — {workerName}</Text>
          <Text style={s.legalRef}>čl. 34 ZZnR (NN 71/14)</Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCell, { width: '15%' }]}>Vrsta</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Datum</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Sljedeći</Text>
            <Text style={[s.tableCell, { width: '18%' }]}>Rezultat</Text>
            <Text style={[s.tableCell, { width: '20%' }]}>Ustanova</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>Liječnik</Text>
            <Text style={[s.tableCell, { width: '8%' }]}>Ogr.</Text>
          </View>
          {checks.map(c => {
            const typeLabel = CHECK_TYPES.find(t => t.value === c.check_type)?.label ?? c.check_type
            const resultLabel = RESULT_OPTIONS.find(r => r.value === c.result)?.label ?? c.result
            return (
              <View key={c.id} style={s.tableRow}>
                <Text style={[s.tableCell, { width: '15%' }]}>{typeLabel}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(c.check_date)}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(c.next_check_date)}</Text>
                <Text style={[s.tableCell, { width: '18%' }]}>{resultLabel}</Text>
                <Text style={[s.tableCell, { width: '20%' }]}>{c.institution ?? '—'}</Text>
                <Text style={[s.tableCell, { width: '15%' }]}>{c.doctor_name ?? '—'}</Text>
                <Text style={[s.tableCell, { width: '8%' }]}>{c.restrictions ? 'Da' : '—'}</Text>
              </View>
            )
          })}
          {checks.length === 0 && (
            <View style={s.tableRow}><Text style={s.tableCell}>Nema unesenih pregleda</Text></View>
          )}
        </View>

        <View style={s.footer}>
          <Text>ZNR ERP — {tenantName}</Text>
          <Text>Generirano: {new Date().toLocaleDateString('hr-HR')}</Text>
        </View>
      </Page>
    </Document>
  )
}
