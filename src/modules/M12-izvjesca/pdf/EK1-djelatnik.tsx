// EK-1 — Evidencijski karton zaposlenika (ukupni ZNR profil)
// [ZAK: čl. 61 ZZnR] Evidencija radnika — trajno čuvanje
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles as s, formatDate } from './styles'
import type { WorkerWithPosition } from '@/modules/M01-radnici/types'

interface Props {
  worker: WorkerWithPosition
  tenantName: string
}

export function EK1Dokument({ worker, tenantName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>EK-1 — Evidencijski karton zaposlenika</Text>
          <Text style={s.subtitle}>{tenantName}</Text>
          <Text style={s.legalRef}>čl. 61 ZZnR (NN 71/14) — evidencija trajno</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Osobni podaci</Text>
          <View style={s.row}><Text style={s.label}>Ime i prezime</Text><Text style={s.value}>{worker.first_name} {worker.last_name}</Text></View>
          <View style={s.row}><Text style={s.label}>OIB</Text><Text style={s.value}>{worker.oib ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Datum rođenja</Text><Text style={s.value}>{formatDate(worker.date_of_birth)}</Text></View>
          <View style={s.row}><Text style={s.label}>Spol</Text><Text style={s.value}>{worker.gender === 'M' ? 'Muški' : worker.gender === 'F' ? 'Ženski' : '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Email</Text><Text style={s.value}>{worker.email ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Telefon</Text><Text style={s.value}>{worker.phone ?? '—'}</Text></View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Zaposlenje</Text>
          <View style={s.row}><Text style={s.label}>Datum zaposlenja</Text><Text style={s.value}>{formatDate(worker.employment_date)}</Text></View>
          <View style={s.row}><Text style={s.label}>Datum prestanka</Text><Text style={s.value}>{formatDate(worker.termination_date)}</Text></View>
          <View style={s.row}><Text style={s.label}>Vrsta ugovora</Text><Text style={s.value}>{worker.contract_type ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Radno mjesto</Text><Text style={s.value}>{worker.work_position?.name ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Odjel</Text><Text style={s.value}>{worker.department ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Lokacija</Text><Text style={s.value}>{worker.location ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Posebni uvjeti</Text><Text style={s.value}>{worker.is_special_conditions ? 'Da' : 'Ne'}</Text></View>
          <View style={s.row}><Text style={s.label}>Status</Text><Text style={s.value}>{worker.status === 'active' ? 'Aktivan' : 'Bivši'}</Text></View>
        </View>

        <View style={s.footer}>
          <Text>ZNR ERP — {tenantName}</Text>
          <Text>Generirano: {new Date().toLocaleDateString('hr-HR')}</Text>
        </View>
      </Page>
    </Document>
  )
}
