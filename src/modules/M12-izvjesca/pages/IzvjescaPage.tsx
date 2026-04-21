// M12 — Izvješća + Inspekcijska mapa
// Jedan klik → Excel s više listova, razriješena imena umjesto UUID-ova

import { FileArchive, Download } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { useInspekcijskaMapa } from '../hooks/useInspekcijskaMapa'

export default function IzvjescaPage() {
  const { exportZip, isExporting } = useInspekcijskaMapa()

  return (
    <AppLayout
      title="Izvješća"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Izvješća' }]}
    >
      <div className="max-w-2xl space-y-6">
        {/* Inspekcijska mapa — killer feature */}
        <Card padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[var(--mg-50)] rounded-xl flex items-center justify-center shrink-0">
              <FileArchive size={24} className="text-[var(--mg-500)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text)]">Inspekcijska mapa</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Jedan klik — svi zakonski obvezni dokumenti za inspektora rada.
                Generirano automatski iz vaših podataka u sustavu.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <LegalBadge article="čl. 61 ZZnR" deadline="evidencija trajno" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
                <span>Djelatnici (M01)</span>
                <span>Osposobljavanja (M03)</span>
                <span>Zdravstveni pregledi (M04)</span>
                <span>Radna oprema (M05)</span>
                <span>Radna mjesta (M02)</span>
                <span>Ozljede na radu (M08)</span>
              </div>

              <Button
                className="mt-4"
                leftIcon={<Download size={16} />}
                onClick={exportZip}
                isLoading={isExporting}
              >
                Preuzmi inspekcijsku mapu (.xlsx)
              </Button>
              <p className="text-xs text-[var(--hint)] mt-2">
                Jedna Excel datoteka s 7 listova — sažetak + 6 evidencija s punim nazivima (bez UUID-ova).
              </p>
            </div>
          </div>
        </Card>

        {/* Godišnje izvješće — placeholder */}
        <Card padding="lg" className="opacity-60">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Godišnje izvješće ZNR</h3>
          <p className="text-xs text-[var(--muted)]">
            Statistika: koliko djelatnika, koliko urednih osposobljavanja, koliko pregleda...
            Dolazi u budućoj verziji.
          </p>
        </Card>
      </div>
    </AppLayout>
  )
}
