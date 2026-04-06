// [ZAK: čl. 18 ZZnR] Modul M02 — Radna mjesta
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function RadnaMjestaPage() {
  return (
    <AppLayout title="Radna mjesta" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Radna mjesta' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M02 — Radna mjesta</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="čl. 18 ZZnR" />
      </div>
    </AppLayout>
  )
}
