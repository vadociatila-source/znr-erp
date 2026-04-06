// [ZAK: čl. 62 ZZnR] Modul M08 — Ozljede na radu
import { AppLayout } from '@/components/layout/AppLayout'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { Construction } from 'lucide-react'

export default function OzljededPage() {
  return (
    <AppLayout title="Ozljede na radu" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Ozljede na radu' }]}>
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <Construction size={48} className="text-slate-300" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700">M08 — Ozljede na radu</h2>
          <p className="text-sm text-slate-500 mt-1">U razvoju — vidi SPRINT_PLAN.md</p>
        </div>
        <LegalBadge article="čl. 62 ZZnR" />
      </div>
    </AppLayout>
  )
}
