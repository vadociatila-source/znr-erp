// EK-5 — Evidencija o radnoj opremi
// [ZAK: PR-04 NN 16/16]
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles as s, formatDate } from './styles'
import type { EquipmentRow } from '@/modules/M05-radna-oprema/types'
import { EQUIPMENT_TYPES } from '@/modules/M05-radna-oprema/types'

interface Props {
  equipment: EquipmentRow[]
  tenantName: string
}

export function EK5Dokument({ equipment, tenantName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>EK-5 — Evidencija o radnoj opremi</Text>
          <Text style={s.subtitle}>{tenantName}</Text>
          <Text style={s.legalRef}>PR-04 (NN 16/16) — pregled max. svake 3 godine</Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCell, { width: '22%' }]}>Naziv</Text>
            <Text style={[s.tableCell, { width: '14%' }]}>Vrsta</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Ser. br.</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Lokacija</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Zadnji pregled</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>Sljedeći</Text>
            <Text style={[s.tableCell, { width: '8%' }]}>Rizik</Text>
            <Text style={[s.tableCell, { width: '8%' }]}>Status</Text>
          </View>
          {equipment.map(eq => {
            const typeLabel = EQUIPMENT_TYPES.find(t => t.value === eq.equipment_type)?.label ?? eq.equipment_type
            return (
              <View key={eq.id} style={s.tableRow}>
                <Text style={[s.tableCell, { width: '22%' }]}>{eq.name}</Text>
                <Text style={[s.tableCell, { width: '14%' }]}>{typeLabel}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{eq.serial_number ?? '—'}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{eq.location ?? '—'}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(eq.last_inspection_date)}</Text>
                <Text style={[s.tableCell, { width: '12%' }]}>{formatDate(eq.next_inspection_date)}</Text>
                <Text style={[s.tableCell, { width: '8%' }]}>{eq.has_increased_risk ? 'Da' : 'Ne'}</Text>
                <Text style={[s.tableCell, { width: '8%' }]}>{eq.status === 'active' ? 'Akt.' : eq.status}</Text>
              </View>
            )
          })}
          {equipment.length === 0 && (
            <View style={s.tableRow}><Text style={s.tableCell}>Nema unesene opreme</Text></View>
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
