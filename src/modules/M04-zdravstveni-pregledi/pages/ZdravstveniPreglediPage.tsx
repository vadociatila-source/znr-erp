// [ZAK: čl. 34 ZZnR] Modul M04 — Zdravstveni pregledi
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function ZdravstveniPreglediPage() {
  return (
    <AppLayout title="Zdravstveni pregledi" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Zdravstveni pregledi' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M04 — Zdravstveni pregledi</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="čl. 34 ZZnR" />
      </div>
    </AppLayout>
  )
}
