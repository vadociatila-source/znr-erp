// [ZAK: čl. 61 ZZnR] Modul M12 — Izvješća
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function IzvjescaPage() {
  return (
    <AppLayout title="Izvješća" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Izvješća' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M12 — Izvješća</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="čl. 61 ZZnR" />
      </div>
    </AppLayout>
  )
}
