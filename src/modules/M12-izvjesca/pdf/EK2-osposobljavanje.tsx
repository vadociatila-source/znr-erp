// EK-2 — Evidencija o osposobljavanju
// [ZAK: čl. 27 ZZnR] Osposobljavanje za rad na siguran način
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles as s, formatDate } from './styles'
import type { TrainingRow } from '@/modules/M03-osposobljavanja/types'
import { TRAINING_TYPES } from '@/modules/M03-osposobljavanja/types'

interface Props {
  workerName: string
  trainings: TrainingRow[]
  tenantName: string
}

export function EK2Dokument({ workerName, trainings, tenantName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>EK-2 — Evidencija o osposobljavanju</Text>
          <Text style={s.subtitle}>{tenantName} — {workerName}</Text>
          <Text style={s.legalRef}>čl. 27 ZZnR (NN 71/14) + PR-02 (NN 142/21)</Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCell, { width: '25%' }]}>Naziv</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>Vrsta</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Datum</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Vrijedi do</Text>
            <Text style={[s.tableCell, { width: '18%' }]}>Izvoditelj</Text>
            <Text style={[s.tableCell, { width: '10%' }]}>Status</Text>
            <Text style={[s.tableCell, { width: '8%' }]}>Cert. br.</Text>
          </View>
          {trainings.map(t => {
            const typeLabel = TRAINING_TYPES.find(tt => tt.value === t.training_type)?.label ?? t.training_type
            return (
              <View key={t.id} style={s.tableRow}>
                <Text style={[s.tableCell, { width: '25%' }]}>{t.training_name}</Text>
                <Text style={[s.tableCell, { width: '15%' }]}>{typeLabel}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(t.training_date)}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(t.valid_until)}</Text>
                <Text style={[s.tableCell, { width: '18%' }]}>{t.provider ?? '—'}</Text>
                <Text style={[s.tableCell, { width: '10%' }]}>{t.status === 'valid' ? 'Važeće' : t.status === 'expired' ? 'Isteklo' : 'Uskoro'}</Text>
                <Text style={[s.tableCell, { width: '8%' }]}>{t.certificate_number ?? '—'}</Text>
              </View>
            )
          })}
          {trainings.length === 0 && (
            <View style={s.tableRow}><Text style={s.tableCell}>Nema unesenih osposobljavanja</Text></View>
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
