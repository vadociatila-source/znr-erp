// M02 — Dodaj radno mjesto
// [ZAK: čl. 18 ZZnR]
import { useLocation } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { PositionForm } from '../components/PositionForm'
import { usePositionMutations } from '../hooks/useWorkPositions'
import toast from 'react-hot-toast'

export default function PositionFormPage() {
  const [, navigate] = useLocation()
  const { createPosition, isSubmitting } = usePositionMutations()

  return (
    <AppLayout
      title="Novo radno mjesto"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Radna mjesta', href: '/radna-mjesta' },
        { label: 'Novo radno mjesto' },
      ]}
      actions={<LegalBadge article="čl. 18 ZZnR" deadline="revizija min. 2 god" />}
    >
      <PositionForm
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          await createPosition(data)
          toast.success('Radno mjesto dodano')
          navigate('/radna-mjesta')
        }}
      />
    </AppLayout>
  )
}
