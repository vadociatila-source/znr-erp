import { Shield } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield size={48} className="text-brand-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Dobrodošli u ZNR ERP</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          Sustav za upravljanje zaštitom na radu.
          Počnite s unosom djelatnika ili otvorite Akcijski centar.
        </p>
      </div>
    </AppLayout>
  )
}
