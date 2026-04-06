// ZOS — Zapisnik o ocjeni osposobljenosti
// [ZAK: čl. 27 ZZnR] Zapisnik nakon provedenog osposobljavanja
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles as s, formatDate } from './styles'
import type { TrainingRow } from '@/modules/M03-osposobljavanja/types'

interface Props {
  workerName: string
  training: TrainingRow
  tenantName: string
}

export function ZOSDokument({ workerName, training, tenantName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>ZOS — Zapisnik o ocjeni osposobljenosti</Text>
          <Text style={s.subtitle}>{tenantName}</Text>
          <Text style={s.legalRef}>čl. 27 ZZnR (NN 71/14)</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Podaci o djelatniku</Text>
          <View style={s.row}><Text style={s.label}>Ime i prezime</Text><Text style={s.value}>{workerName}</Text></View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Podaci o osposobljavanju</Text>
          <View style={s.row}><Text style={s.label}>Naziv</Text><Text style={s.value}>{training.training_name}</Text></View>
          <View style={s.row}><Text style={s.label}>Datum provedbe</Text><Text style={s.value}>{formatDate(training.training_date)}</Text></View>
          <View style={s.row}><Text style={s.label}>Vrijedi do</Text><Text style={s.value}>{formatDate(training.valid_until)}</Text></View>
          <View style={s.row}><Text style={s.label}>Izvoditelj</Text><Text style={s.value}>{training.provider ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Lokacija</Text><Text style={s.value}>{training.location ?? '—'}</Text></View>
          <View style={s.row}><Text style={s.label}>Broj certifikata</Text><Text style={s.value}>{training.certificate_number ?? '—'}</Text></View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Ocjena osposobljenosti</Text>
          <Text style={{ fontSize: 11, marginTop: 8 }}>
            Radnik je osposobljen za rad na siguran način sukladno čl. 27 Zakona o zaštiti na radu (NN 71/14, 118/14, 94/18, 96/18).
          </Text>
        </View>

        <View style={{ marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <View style={s.signatureLine}><Text>Potpis radnika</Text></View>
          </View>
          <View>
            <View style={s.signatureLine}><Text>Potpis izvoditelja</Text></View>
          </View>
          <View>
            <View style={s.signatureLine}><Text>Potpis poslodavca</Text></View>
          </View>
        </View>

        <View style={s.footer}>
          <Text>ZNR ERP — {tenantName}</Text>
          <Text>Generirano: {new Date().toLocaleDateString('hr-HR')}</Text>
        </View>
      </Page>
    </Document>
  )
}
