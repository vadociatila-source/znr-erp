// [ZAK: PR-06 NN 5/21] Modul M07 — OZO
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function OzoPage() {
  return (
    <AppLayout title="OZO" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'OZO' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M07 — OZO</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="PR-06 NN 5/21" />
      </div>
    </AppLayout>
  )
}
