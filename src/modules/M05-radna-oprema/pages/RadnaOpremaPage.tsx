// [ZAK: PR-04 NN 16/16] Modul M05 — Radna oprema
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function RadnaOpremaPage() {
  return (
    <AppLayout title="Radna oprema" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Radna oprema' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M05 — Radna oprema</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="PR-04 NN 16/16" />
      </div>
    </AppLayout>
  )
}
