// M03 — Dodaj osposobljavanje za djelatnika
// [ZAK: čl. 27 ZZnR] Novi djelatnik → 30 dana rok

import { useLocation, useRoute } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { TrainingForm } from '../components/TrainingForm'
import { useTrainingMutations } from '../hooks/useTrainings'
import { useWorker } from '@/modules/M01-radnici/hooks/useWorkers'
import toast from 'react-hot-toast'

export default function TrainingFormPage() {
  const [, navigate] = useLocation()
  const [, params] = useRoute('/radnici/:workerId/osposobljavanja/novo')
  const workerId = params?.workerId

  const { worker, isLoading: loadingWorker } = useWorker(workerId)
  const { createTraining, isSubmitting } = useTrainingMutations()

  if (loadingWorker || !workerId) {
    return (
      <AppLayout title="Učitavanje...">
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </AppLayout>
    )
  }

  const fullName = worker ? `${worker.first_name} ${worker.last_name}` : ''

  return (
    <AppLayout
      title={`Novo osposobljavanje: ${fullName}`}
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Djelatnici', href: '/radnici' },
        { label: fullName, href: `/radnici/${workerId}` },
        { label: 'Novo osposobljavanje' },
      ]}
      actions={
        <LegalBadge
          article="čl. 27 ZZnR"
          deadline="30 dana za osposobljavanje novog djelatnika"
        />
      }
    >
      <TrainingForm
        workerId={workerId}
        isSubmitting={isSubmitting}
        submitLabel="Dodaj osposobljavanje"
        onSubmit={async (data) => {
          await createTraining(data)
          toast.success('Osposobljavanje dodano')
          navigate(`/radnici/${workerId}`)
        }}
      />
    </AppLayout>
  )
}
