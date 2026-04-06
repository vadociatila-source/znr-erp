// M04 — Dodaj zdravstveni pregled za djelatnika
// [ZAK: čl. 34 ZZnR]

import { useLocation, useRoute } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { HealthCheckForm } from '../components/HealthCheckForm'
import { useHealthCheckMutations } from '../hooks/useHealthChecks'
import { useWorker } from '@/modules/M01-radnici/hooks/useWorkers'
import toast from 'react-hot-toast'

export default function HealthCheckFormPage() {
  const [, navigate] = useLocation()
  const [, params] = useRoute('/radnici/:workerId/pregledi/novo')
  const workerId = params?.workerId

  const { worker, isLoading: loadingWorker } = useWorker(workerId)
  const { createCheck, isSubmitting } = useHealthCheckMutations()

  if (loadingWorker || !workerId) {
    return <AppLayout title="Učitavanje..."><div className="flex justify-center py-12"><Spinner size="lg" /></div></AppLayout>
  }

  const fullName = worker ? `${worker.first_name} ${worker.last_name}` : ''

  return (
    <AppLayout
      title={`Novi pregled: ${fullName}`}
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Djelatnici', href: '/radnici' },
        { label: fullName, href: `/radnici/${workerId}` },
        { label: 'Novi pregled' },
      ]}
      actions={<LegalBadge article="čl. 34 ZZnR" deadline="periodički: max. 3 godine" />}
    >
      <HealthCheckForm
        workerId={workerId}
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          await createCheck(data)
          toast.success('Zdravstveni pregled spremljen')
          navigate(`/radnici/${workerId}`)
        }}
      />
    </AppLayout>
  )
}
