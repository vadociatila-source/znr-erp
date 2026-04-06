// M01 — Dodaj/uredi radnika
// [ZAK: čl. 27 ZZnR] Novi radnik automatski dobiva task "Osposobljavanje u 30 dana" (DB trigger)
// [ZAK: čl. 61 ZZnR] Evidencija se trajno čuva

import { useLocation, useRoute } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { WorkerForm } from '../components/WorkerForm'
import { useWorker, useWorkerMutations } from '../hooks/useWorkers'
import toast from 'react-hot-toast'

export default function RadnikFormPage() {
  const [, navigate] = useLocation()
  const [editMatch, editParams] = useRoute('/radnici/:id/uredi')
  const editId = editMatch ? editParams?.id : undefined
  const isEdit = Boolean(editId)

  const { worker, isLoading: loadingWorker } = useWorker(editId)
  const { createWorker, updateWorker, isSubmitting } = useWorkerMutations()

  if (isEdit && loadingWorker) {
    return (
      <AppLayout title="Učitavanje...">
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </AppLayout>
    )
  }

  const title = isEdit
    ? `Uredi: ${worker?.first_name} ${worker?.last_name}`
    : 'Novi djelatnik'

  const breadcrumb = isEdit
    ? [
        { label: 'Home', href: '/' },
        { label: 'Djelatnici', href: '/radnici' },
        { label: `${worker?.first_name} ${worker?.last_name}`, href: `/radnici/${editId}` },
        { label: 'Uredi' },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Djelatnici', href: '/radnici' },
        { label: 'Novi djelatnik' },
      ]

  return (
    <AppLayout
      title={title}
      breadcrumb={breadcrumb}
      actions={
        !isEdit ? (
          <LegalBadge
            article="čl. 27 ZZnR"
            deadline="30 dana za osposobljavanje novog djelatnika"
          />
        ) : undefined
      }
    >
      <WorkerForm
        initialData={isEdit ? worker : null}
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Spremi promjene' : 'Dodaj djelatnika'}
        onSubmit={async (data) => {
          if (isEdit && editId) {
            await updateWorker(editId, data)
            toast.success('Djelatnik ažuriran')
            navigate(`/radnici/${editId}`)
          } else {
            // data from WorkerForm always has first_name/last_name as required strings
            const newId = await createWorker(data as Parameters<typeof createWorker>[0])
            toast.success('Djelatnik dodan — osposobljavanje u roku 30 dana (čl. 27 ZZnR)')
            navigate(`/radnici/${newId}`)
          }
        }}
      />
    </AppLayout>
  )
}
