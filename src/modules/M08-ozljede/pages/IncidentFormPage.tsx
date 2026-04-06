// M08 — Prijavi ozljedu na radu
// [ZAK: čl. 62 ZZnR] 48h HZZO — DB trigger automatski kreira HITNI task
import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Spinner } from '@/components/ui/index'
import { IncidentForm } from '../components/IncidentForm'
import { useIncidentMutations } from '../hooks/useIncidents'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function IncidentFormPage() {
  const [, navigate] = useLocation()
  const { createIncident, isSubmitting } = useIncidentMutations()
  const [workers, setWorkers] = useState<Array<{ id: string; first_name: string; last_name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('workers').select('id, first_name, last_name').eq('status', 'active')
      .order('last_name').then(({ data }) => { setWorkers(data ?? []); setLoading(false) })
  }, [])

  if (loading) return <AppLayout title="Učitavanje..."><div className="flex justify-center py-12"><Spinner size="lg" /></div></AppLayout>

  return (
    <AppLayout
      title="Prijava ozljede na radu"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Ozljede na radu', href: '/ozljede' },
        { label: 'Nova prijava' },
      ]}
      actions={<LegalBadge article="čl. 62 ZZnR" deadline="48h HZZO" penalty="5.000–50.000 EUR" />}
    >
      <IncidentForm
        workers={workers}
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          await createIncident(data)
          toast.success('Ozljeda prijavljena — HITNO prijavi HZZO u roku 48h!')
          navigate('/ozljede')
        }}
      />
    </AppLayout>
  )
}
