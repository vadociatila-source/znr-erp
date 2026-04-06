// [ZAK: čl. 61 ZZnR] Modul M11 — Akcijski centar
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function AkcijskiCentarPage() {
  return (
    <AppLayout title="Akcijski centar" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Akcijski centar' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M11 — Akcijski centar</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="čl. 61 ZZnR" />
      </div>
    </AppLayout>
  )
}
