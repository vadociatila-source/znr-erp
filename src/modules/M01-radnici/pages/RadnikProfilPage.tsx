// M01 — Profil radnika (dosje)
// [ZAK: čl. 61 ZZnR] Evidencija radnika je trajna
// Sekcije za osposobljavanja/preglede/opremu su placeholderi za Sprint 004+

import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'
import { Edit2, UserX, AlertTriangle, BookOpen, Heart, Wrench, Plus, FileText } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, Alert, Spinner } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { DeactivateWorkerModal } from '../components/DeactivateWorkerModal'
import { useWorker, useWorkerMutations } from '../hooks/useWorkers'
import { useTenantStore } from '@/store/tenant.store'
import { useWorkerTrainings } from '@/modules/M03-osposobljavanja/hooks/useTrainings'
import { TrainingsTable } from '@/modules/M03-osposobljavanja/components/TrainingsTable'
import { useWorkerHealthChecks } from '@/modules/M04-zdravstveni-pregledi/hooks/useHealthChecks'
import { HealthChecksTable } from '@/modules/M04-zdravstveni-pregledi/components/HealthChecksTable'
import { createElement } from 'react'
import { EK1Dokument, EK2Dokument, EK4Dokument, downloadPdf } from '@/modules/M12-izvjesca/pdf'
import toast from 'react-hot-toast'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-900">{value || <span className="text-slate-300">—</span>}</dd>
    </div>
  )
}

export default function RadnikProfilPage() {
  const [, navigate] = useLocation()
  const [, params] = useRoute('/radnici/:id')
  const workerId = params?.id
  const { worker, isLoading, error } = useWorker(workerId)
  const { trainings: workerTrainings, isLoading: loadingTrainings } = useWorkerTrainings(workerId)
  const { checks: workerChecks, isLoading: loadingChecks } = useWorkerHealthChecks(workerId)
  const { deactivateWorker, isSubmitting } = useWorkerMutations()
  const [showDeactivate, setShowDeactivate] = useState(false)
  const tenantName = useTenantStore(s => s.activeTenant?.name ?? 'ZNR ERP')

  if (isLoading) {
    return (
      <AppLayout title="Učitavanje...">
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </AppLayout>
    )
  }

  if (error || !worker) {
    return (
      <AppLayout title="Greška">
        <Alert variant="danger" title="Radnik nije pronađen">
          {error ?? 'Ne postoji djelatnik s ovim ID-em.'}
        </Alert>
      </AppLayout>
    )
  }

  const fullName = `${worker.first_name} ${worker.last_name}`
  const missingOIB = !worker.oib
  const missingDate = !worker.employment_date

  return (
    <AppLayout
      title={fullName}
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Djelatnici', href: '/radnici' },
        { label: fullName },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText size={14} />}
            onClick={async () => {
              await downloadPdf(
                createElement(EK1Dokument, { worker, tenantName }),
                `EK1_${worker.last_name}_${worker.first_name}.pdf`
              )
              if (workerTrainings.length > 0) {
                await downloadPdf(
                  createElement(EK2Dokument, { workerName: fullName, trainings: workerTrainings, tenantName }),
                  `EK2_${worker.last_name}_${worker.first_name}.pdf`
                )
              }
              if (workerChecks.length > 0) {
                await downloadPdf(
                  createElement(EK4Dokument, { workerName: fullName, checks: workerChecks, tenantName }),
                  `EK4_${worker.last_name}_${worker.first_name}.pdf`
                )
              }
              toast.success('PDF-ovi generirani')
            }}
          >
            PDF dosje
          </Button>
          <LegalBadge article="čl. 61 ZZnR" deadline="evidencija trajno" />
          {worker.status === 'active' && (
            <>
              <Link href={`/radnici/${worker.id}/uredi`}>
                <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />}>
                  Uredi
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<UserX size={14} />}
                onClick={() => setShowDeactivate(true)}
              >
                Deaktiviraj
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Upozorenja */}
      {(missingOIB || missingDate) && (
        <Alert variant="warning" title="Nepotpuni podaci" className="mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <ul className="text-sm space-y-1">
              {missingOIB && <li>OIB nije unesen — potreban za prijavu ozljede HZZO-u (čl. 62 ZZnR)</li>}
              {missingDate && <li>Datum zaposlenja nije unesen — nemoguće izračunati rok osposobljavanja (čl. 27 ZZnR)</li>}
            </ul>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Glavni podaci */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Osobni podaci</h3>
              <Badge variant={worker.status === 'active' ? 'success' : 'default'}>
                {worker.status === 'active' ? 'Aktivan' : 'Bivši'}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Ime" value={worker.first_name} />
              <InfoRow label="Prezime" value={worker.last_name} />
              <InfoRow label="OIB" value={worker.oib && (
                <span className="font-mono">{worker.oib}</span>
              )} />
              <InfoRow label="Datum rođenja" value={
                worker.date_of_birth && new Date(worker.date_of_birth).toLocaleDateString('hr-HR')
              } />
              <InfoRow label="Spol" value={
                worker.gender === 'M' ? 'Muški' : worker.gender === 'F' ? 'Ženski' : null
              } />
              <InfoRow label="Email" value={worker.email} />
              <InfoRow label="Telefon" value={worker.phone} />
            </dl>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Zaposlenje</h3>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Datum zaposlenja" value={
                worker.employment_date && new Date(worker.employment_date).toLocaleDateString('hr-HR')
              } />
              <InfoRow label="Datum prestanka" value={
                worker.termination_date && new Date(worker.termination_date).toLocaleDateString('hr-HR')
              } />
              <InfoRow label="Vrsta ugovora" value={worker.contract_type} />
              <InfoRow label="Radno mjesto" value={worker.work_position?.name} />
              <InfoRow label="Odjel / Tim" value={worker.department} />
              <InfoRow label="Lokacija" value={worker.location} />
              <InfoRow label="Posebni uvjeti" value={
                worker.is_special_conditions ? (
                  <Badge variant="warning">Da — čl. 34 ZZnR</Badge>
                ) : 'Ne'
              } />
            </dl>
          </Card>

          {worker.notes && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Napomene</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{worker.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar — ZNR moduli */}
        <div className="space-y-4">
          {/* M03 Osposobljavanja — LIVE */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" />
                <h4 className="text-sm font-semibold text-slate-700">Osposobljavanja</h4>
              </div>
              {worker.status === 'active' && (
                <Link href={`/radnici/${worker.id}/osposobljavanja/novo`}>
                  <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
                    Dodaj
                  </Button>
                </Link>
              )}
            </div>
            {loadingTrainings ? (
              <p className="text-xs text-slate-400">Učitavanje...</p>
            ) : workerTrainings.length > 0 ? (
              <TrainingsTable trainings={workerTrainings} isLoading={false} showWorkerName={false} />
            ) : (
              <p className="text-xs text-slate-500">Nema unesenih osposobljavanja — čl. 27 ZZnR</p>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                <h4 className="text-sm font-semibold text-slate-700">Zdravstveni pregledi</h4>
              </div>
              {worker.status === 'active' && (
                <Link href={`/radnici/${worker.id}/pregledi/novo`}>
                  <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
                    Dodaj
                  </Button>
                </Link>
              )}
            </div>
            {loadingChecks ? (
              <p className="text-xs text-slate-400">Učitavanje...</p>
            ) : workerChecks.length > 0 ? (
              <HealthChecksTable checks={workerChecks} isLoading={false} showWorkerName={false} />
            ) : (
              <p className="text-xs text-slate-500">Nema pregleda — čl. 34 ZZnR</p>
            )}
          </Card>

          <Card padding="md" className="opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-amber-500" />
              <h4 className="text-sm font-semibold text-slate-700">Radna oprema</h4>
            </div>
            <p className="text-xs text-slate-500">Sprint 006 — PR-04 NN 16/16</p>
          </Card>
        </div>
      </div>

      {/* Deactivation modal */}
      <DeactivateWorkerModal
        worker={worker}
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          await deactivateWorker(worker.id)
          toast.success(`${fullName} označen/a kao bivši djelatnik`)
          setShowDeactivate(false)
          navigate('/radnici')
        }}
      />
    </AppLayout>
  )
}
