// M05 — Dodaj radnu opremu
// [ZAK: PR-04 NN 16/16]

import { useLocation } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { EquipmentForm } from '../components/EquipmentForm'
import { useEquipmentMutations } from '../hooks/useEquipment'
import toast from 'react-hot-toast'

export default function EquipmentFormPage() {
  const [, navigate] = useLocation()
  const { createEquipment, isSubmitting } = useEquipmentMutations()

  return (
    <AppLayout
      title="Nova oprema"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Radna oprema', href: '/radna-oprema' },
        { label: 'Nova oprema' },
      ]}
      actions={<LegalBadge article="PR-04 NN 16/16" deadline="pregled max. 3 god" />}
    >
      <EquipmentForm
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          await createEquipment(data)
          toast.success('Oprema dodana')
          navigate('/radna-oprema')
        }}
      />
    </AppLayout>
  )
}
