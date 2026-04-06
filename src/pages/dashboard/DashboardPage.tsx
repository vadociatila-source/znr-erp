// Dashboard — pregled stanja tvrtke
// Statistike iz svih modula na jednom ekranu

import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import {
  Users, BookOpen, Heart, Wrench, AlertTriangle, Bell,
  CheckCircle, Clock, Building2, FileText
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Spinner } from '@/components/ui/index'
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

function StatCard({ title, value, icon, subtitle, href, color = 'text-[var(--mg-500)]' }: {
  title: string; value: number; icon: React.ReactNode; subtitle?: string
  href: string; color?: string
}) {
  return (
    <Link href={href}>
      <Card padding="md" className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm font-medium text-[var(--text)] mt-1">{title}</p>
            {subtitle && <p className="text-xs text-[var(--hint)] mt-0.5">{subtitle}</p>}
          </div>
          <div className="text-[var(--hint)]">{icon}</div>
        </div>
      </Card>
    </Link>
  )
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
          .not('next_check_date', 'is', null)
          .lte('next_check_date', new Date().toISOString().slice(0, 10)),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .not('next_inspection_date', 'is', null)
          .lte('next_inspection_date', new Date().toISOString().slice(0, 10)),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('hzzo_reported', false),
        supabase.from('work_positions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('work_positions').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .not('risk_assessment_next', 'is', null)
          .lte('risk_assessment_next', new Date().toISOString().slice(0, 10)),
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
    return (
      <AppLayout title="Dashboard">
        <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>
      </AppLayout>
    )
  }

  const s = stats!

  return (
    <AppLayout title="Dashboard">
      {/* Tenant info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">{tenant?.name}</h2>
        <p className="text-sm text-[var(--muted)]">
          {tenant?.industry} | {tenant?.city} | Plan: {tenant?.plan} | {s.workers.active} aktivnih djelatnika
        </p>
      </div>

      {/* Alarmi summary */}
      {(s.tasks.critical > 0 || s.incidents.unreported > 0) && (
        <Card padding="md" className="mb-6 border-[var(--crit-b)] bg-[var(--crit-bg)]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-[var(--crit-acc)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--crit-t)]">Hitne akcije potrebne</p>
              <p className="text-xs text-[var(--crit-acc)]">
                {s.tasks.critical > 0 && `${s.tasks.critical} isteklih zadataka`}
                {s.tasks.critical > 0 && s.incidents.unreported > 0 && ' | '}
                {s.incidents.unreported > 0 && `${s.incidents.unreported} neprijavljenih ozljeda HZZO-u`}
              </p>
            </div>
            <Link href="/akcijski-centar" className="ml-auto text-xs text-[var(--crit-t)] font-medium hover:underline">
              Otvori Akcijski centar →
            </Link>
          </div>
        </Card>
      )}

      {/* Statistike grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aktivni djelatnici"
          value={s.workers.active}
          subtitle={`${s.workers.former} bivših`}
          icon={<Users size={24} />}
          href="/radnici"
        />
        <StatCard
          title="Osposobljavanja"
          value={s.trainings.valid}
          subtitle={s.trainings.expiring > 0 ? `${s.trainings.expiring} uskoro ističe` : 'Sva važeća'}
          icon={<BookOpen size={24} />}
          href="/osposobljavanja"
          color={s.trainings.expired > 0 ? 'text-[var(--crit-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Zdravstveni pregledi"
          value={s.healthChecks.total}
          subtitle={s.healthChecks.overdue > 0 ? `${s.healthChecks.overdue} isteklih` : 'Svi uredni'}
          icon={<Heart size={24} />}
          href="/zdravstveni-pregledi"
          color={s.healthChecks.overdue > 0 ? 'text-[var(--crit-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Radna oprema"
          value={s.equipment.active}
          subtitle={s.equipment.overdue > 0 ? `${s.equipment.overdue} isteklih pregleda` : 'Svi uredni'}
          icon={<Wrench size={24} />}
          href="/radna-oprema"
          color={s.equipment.overdue > 0 ? 'text-[var(--crit-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Radna mjesta"
          value={s.positions.total}
          subtitle={s.positions.overdueRisk > 0 ? `${s.positions.overdueRisk} treba reviziju` : 'Procjene uredne'}
          icon={<Building2 size={24} />}
          href="/radna-mjesta"
          color={s.positions.overdueRisk > 0 ? 'text-[var(--warn-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Ozljede na radu"
          value={s.incidents.total}
          subtitle={s.incidents.unreported > 0 ? `${s.incidents.unreported} HITNO — HZZO 48h` : 'Sve prijavljeno'}
          icon={<AlertTriangle size={24} />}
          href="/ozljede"
          color={s.incidents.unreported > 0 ? 'text-[var(--crit-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Pending zadaci"
          value={s.tasks.pending}
          subtitle={s.tasks.critical > 0 ? `${s.tasks.critical} kritičnih` : 'Nema hitnih'}
          icon={<Bell size={24} />}
          href="/akcijski-centar"
          color={s.tasks.critical > 0 ? 'text-[var(--crit-acc)]' : 'text-[var(--mg-500)]'}
        />
        <StatCard
          title="Inspekcijska mapa"
          value={s.workers.active + s.workers.former}
          subtitle="Preuzmi sve dokumente"
          icon={<FileText size={24} />}
          href="/izvjesca"
        />
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-[var(--ok-acc)]" />
            <h4 className="text-sm font-semibold text-[var(--text)]">Brze akcije</h4>
          </div>
          <div className="space-y-2">
            <Link href="/radnici/novi" className="block text-sm text-[var(--mg-500)] hover:underline">+ Novi djelatnik</Link>
            <Link href="/radna-oprema/novo" className="block text-sm text-[var(--mg-500)] hover:underline">+ Nova oprema</Link>
            <Link href="/radna-mjesta/novo" className="block text-sm text-[var(--mg-500)] hover:underline">+ Novo radno mjesto</Link>
            <Link href="/ozljede/novo" className="block text-sm text-[var(--crit-acc)] hover:underline">! Prijavi ozljedu</Link>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-orange-500" />
            <h4 className="text-sm font-semibold text-[var(--text)]">Rokovi</h4>
          </div>
          <div className="space-y-1 text-xs text-[var(--muted)]">
            <p>Osposobljavanje: 30 dana novi / 4 god usavršavanje</p>
            <p>Zdravstveni pregled: 1-3 godine periodički</p>
            <p>Radna oprema: 3 godine / 1 god vatrogasni</p>
            <p>Procjena rizika: 2 godine revizija</p>
            <p>Vježba evakuacije: 1 godina</p>
            <p className="text-[var(--crit-acc)] font-medium">Ozljeda → HZZO 48 sati!</p>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[var(--info-acc)]" />
            <h4 className="text-sm font-semibold text-[var(--text)]">Tvrtka</h4>
          </div>
          <div className="space-y-1 text-xs text-[var(--muted)]">
            <p><strong>{tenant?.name}</strong></p>
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
