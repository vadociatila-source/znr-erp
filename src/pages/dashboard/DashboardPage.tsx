// Dashboard — pregled stanja tvrtke
// Čisti SVG grafovi (Paco Coursey stil) + statistike

import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { AlertTriangle, CheckCircle, Clock, Building2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Spinner } from '@/components/ui/index'
import { StatCard } from '@/components/ui/StatCard'
import { DonutChart, ComplianceChart, CriticalArc } from '@/components/charts'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'

interface DashboardStats {
  workers: { active: number; former: number }
  trainings: { valid: number; expiring: number; expired: number }
  healthChecks: { total: number; overdue: number }
  equipment: { active: number; overdue: number }
  incidents: { total: number; unreported: number }
  positions: { total: number; overdueRisk: number }
  tasks: { pending: number; critical: number }
}

export default function DashboardPage() {
  const tenant = useTenantStore(s => s.activeTenant)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        workersActive, workersFormer,
        trainingsValid, trainingsExpiring, trainingsExpired,
        healthTotal, healthOverdue,
        equipActive, equipOverdue,
        incTotal, incUnreported,
        posTotal, posOverdue,
        tasksPending, tasksCritical,
      ] = await Promise.all([
        supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'former'),
        supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('status', 'valid'),
        supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('status', 'expiring_soon'),
        supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
        supabase.from('health_checks').select('*', { count: 'exact', head: true }),
        supabase.from('health_checks').select('*', { count: 'exact', head: true })
          .not('next_check_date', 'is', null).lte('next_check_date', new Date().toISOString().slice(0, 10)),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .not('next_inspection_date', 'is', null).lte('next_inspection_date', new Date().toISOString().slice(0, 10)),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('hzzo_reported', false),
        supabase.from('work_positions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('work_positions').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .not('risk_assessment_next', 'is', null).lte('risk_assessment_next', new Date().toISOString().slice(0, 10)),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending')
          .lte('due_date', new Date().toISOString().slice(0, 10)),
      ])

      setStats({
        workers: { active: workersActive.count ?? 0, former: workersFormer.count ?? 0 },
        trainings: { valid: trainingsValid.count ?? 0, expiring: trainingsExpiring.count ?? 0, expired: trainingsExpired.count ?? 0 },
        healthChecks: { total: healthTotal.count ?? 0, overdue: healthOverdue.count ?? 0 },
        equipment: { active: equipActive.count ?? 0, overdue: equipOverdue.count ?? 0 },
        incidents: { total: incTotal.count ?? 0, unreported: incUnreported.count ?? 0 },
        positions: { total: posTotal.count ?? 0, overdueRisk: posOverdue.count ?? 0 },
        tasks: { pending: tasksPending.count ?? 0, critical: tasksCritical.count ?? 0 },
      })
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return <AppLayout title="Dashboard">
      <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>
    </AppLayout>
  }

  const s = stats!
  const complianceItems = [
    { label: 'Osposobljavanja', ok: s.trainings.valid, total: s.trainings.valid + s.trainings.expiring + s.trainings.expired },
    { label: 'Zdravstveni', ok: Math.max(0, s.healthChecks.total - s.healthChecks.overdue), total: s.healthChecks.total || 1 },
    { label: 'Radna oprema', ok: Math.max(0, s.equipment.active - s.equipment.overdue), total: s.equipment.active || 1 },
    { label: 'Radna mjesta', ok: Math.max(0, s.positions.total - s.positions.overdueRisk), total: s.positions.total || 1 },
  ]

  return (
    <AppLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-lg font-[500] text-[var(--text)]">{tenant?.name}</h2>
        <p className="text-[12px] text-[var(--muted)]">
          {tenant?.industry} | {tenant?.city} | Plan: {tenant?.plan} | {s.workers.active} aktivnih djelatnika
        </p>
      </div>

      {(s.tasks.critical > 0 || s.incidents.unreported > 0) && (
        <Card padding="md" className="mb-6 border-[var(--crit-b)] bg-[var(--crit-bg)] animate-enter">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-[var(--crit-acc)]" />
            <div>
              <p className="text-[13px] font-[500] text-[var(--crit-t)]">Hitne akcije potrebne</p>
              <p className="text-[11px] text-[var(--crit-acc)]">
                {s.tasks.critical > 0 && `${s.tasks.critical} isteklih zadataka`}
                {s.tasks.critical > 0 && s.incidents.unreported > 0 && ' | '}
                {s.incidents.unreported > 0 && `${s.incidents.unreported} neprijavljenih ozljeda HZZO-u`}
              </p>
            </div>
            <Link href="/akcijski-centar" className="ml-auto text-[11px] text-[var(--crit-t)] font-[500] hover:underline">
              Otvori Akcijski centar →
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard value={s.workers.active} label="Aktivni djelatnici" variant="accent" index={0} onClick={() => { window.location.href = '/radnici' }} />
        <StatCard value={s.tasks.pending} label="Pending zadaci" variant={s.tasks.critical > 0 ? 'critical' : 'default'} index={1} onClick={() => { window.location.href = '/akcijski-centar' }} />
        <StatCard value={s.equipment.active} label="Radna oprema" index={2} onClick={() => { window.location.href = '/radna-oprema' }} />
        <StatCard value={s.positions.total} label="Radna mjesta" index={3} onClick={() => { window.location.href = '/radna-mjesta' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card padding="lg" className="animate-stagger" style={{ '--i': 4 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.08em] text-[var(--hint)] mb-4">Djelatnici</p>
          <DonutChart active={s.workers.active} former={s.workers.former} />
        </Card>
        <Card padding="lg" className="animate-stagger" style={{ '--i': 5 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.08em] text-[var(--hint)] mb-4">Usklađenost</p>
          <ComplianceChart items={complianceItems} />
        </Card>
        <Card padding="lg" className="animate-stagger flex flex-col items-center" style={{ '--i': 6 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.08em] text-[var(--hint)] mb-4 self-start">Kritični zadaci</p>
          <CriticalArc critical={s.tasks.critical} total={s.workers.active} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="animate-stagger" style={{ '--i': 7 } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-[var(--ok-acc)]" />
            <h4 className="text-[13px] font-[500] text-[var(--text)]">Brze akcije</h4>
          </div>
          <div className="space-y-2">
            <Link href="/radnici/novi" className="block text-[12px] text-[var(--mg-500)] hover:underline">+ Novi djelatnik</Link>
            <Link href="/radna-oprema/novo" className="block text-[12px] text-[var(--mg-500)] hover:underline">+ Nova oprema</Link>
            <Link href="/radna-mjesta/novo" className="block text-[12px] text-[var(--mg-500)] hover:underline">+ Novo radno mjesto</Link>
            <Link href="/ozljede/novo" className="block text-[12px] text-[var(--crit-acc)] hover:underline">! Prijavi ozljedu</Link>
          </div>
        </Card>
        <Card padding="md" className="animate-stagger" style={{ '--i': 8 } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-[var(--warn-acc)]" />
            <h4 className="text-[13px] font-[500] text-[var(--text)]">Zakonski rokovi</h4>
          </div>
          <div className="space-y-1 text-[11px] text-[var(--muted)]">
            <p>Osposobljavanje: 30d novi / 4 god usavršavanje</p>
            <p>Zdravstveni pregled: 1-3 god periodički</p>
            <p>Radna oprema: 3 god / vatrogasni 90d+1g+5g</p>
            <p>Procjena rizika: 2 god revizija</p>
            <p>Vježba evakuacije: 1 god</p>
            <p className="text-[var(--crit-t)] font-[500]">Ozljeda → HZZO 48 sati!</p>
          </div>
        </Card>
        <Card padding="md" className="animate-stagger" style={{ '--i': 9 } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[var(--info-acc)]" />
            <h4 className="text-[13px] font-[500] text-[var(--text)]">Tvrtka</h4>
          </div>
          <div className="space-y-1 text-[11px] text-[var(--muted)]">
            <p><strong className="text-[var(--text)]">{tenant?.name}</strong></p>
            <p>OIB: {tenant?.oib ?? '—'}</p>
            <p>Djelatnost: {tenant?.industry ?? '—'}</p>
            <p>Plan: <Badge variant="info" size="sm">{tenant?.plan}</Badge></p>
            <p>Trial do: {tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('hr-HR') : '—'}</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
