// Dashboard — pregled stanja tvrtke
// Statistike + grafovi iz svih modula

import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import {
  AlertTriangle, CheckCircle, Clock, Building2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar,
} from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Spinner } from '@/components/ui/index'
import { StatCard } from '@/components/ui/StatCard'
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

// Graphite × Magenta chart boje
const COLORS = {
  mg: '#EC4BAC',
  mgLight: '#F472C0',
  crit: '#EF4444',
  warn: '#F59E0B',
  ok: '#22C55E',
  info: '#F9A8DA',
  muted: '#8D95A0',
  surf: '#383C44',
  raised: '#474A51',
  text: '#EDEEF0',
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--sunken)] border border-[var(--border)] rounded-[8px] px-3 py-2 shadow-2xl">
      <p className="text-[11px] text-[var(--muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] text-[var(--text)] font-[500]">{p.value}</p>
      ))}
    </div>
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

  // Chart data
  const workersPie = [
    { name: 'Aktivni', value: s.workers.active, color: COLORS.mg },
    { name: 'Bivši', value: s.workers.former, color: COLORS.raised },
  ]

  const complianceBar = [
    { name: 'Ospos.', uredni: s.trainings.valid, problemi: s.trainings.expiring + s.trainings.expired },
    { name: 'Pregledi', uredni: Math.max(0, s.healthChecks.total - s.healthChecks.overdue), problemi: s.healthChecks.overdue },
    { name: 'Oprema', uredni: Math.max(0, s.equipment.active - s.equipment.overdue), problemi: s.equipment.overdue },
    { name: 'Rad. mj.', uredni: Math.max(0, s.positions.total - s.positions.overdueRisk), problemi: s.positions.overdueRisk },
  ]

  const totalTasks = s.tasks.pending
  const critPct = totalTasks > 0 ? Math.round((s.tasks.critical / totalTasks) * 100) : 0
  const taskRadial = [
    { name: 'Kritični', value: critPct, fill: COLORS.crit },
  ]

  return (
    <AppLayout title="Dashboard">
      {/* Tenant info */}
      <div className="mb-6">
        <h2 className="text-lg font-[500] text-[var(--text)]">{tenant?.name}</h2>
        <p className="text-[12px] text-[var(--muted)]">
          {tenant?.industry} | {tenant?.city} | Plan: {tenant?.plan} | {s.workers.active} aktivnih djelatnika
        </p>
      </div>

      {/* Alarmi summary */}
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard value={s.workers.active} label="Aktivni djelatnici" variant="accent" index={0} onClick={() => window.location.href = '/radnici'} />
        <StatCard value={s.tasks.pending} label="Pending zadaci" variant={s.tasks.critical > 0 ? 'critical' : 'default'} index={1} onClick={() => window.location.href = '/akcijski-centar'} />
        <StatCard value={s.equipment.active} label="Radna oprema" index={2} onClick={() => window.location.href = '/radna-oprema'} />
        <StatCard value={s.positions.total} label="Radna mjesta" index={3} onClick={() => window.location.href = '/radna-mjesta'} />
      </div>

      {/* Grafovi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pie — Djelatnici */}
        <Card padding="md" className="animate-stagger" style={{ '--i': 4 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-[var(--hint)] mb-3">Djelatnici</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workersPie}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {workersPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--mg-500)]" /> {s.workers.active} aktivnih
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--raised)]" /> {s.workers.former} bivših
            </span>
          </div>
        </Card>

        {/* Bar — Usklađenost po modulu */}
        <Card padding="md" className="animate-stagger" style={{ '--i': 5 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-[var(--hint)] mb-3">Usklađenost</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceBar} barGap={2}>
                <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="uredni" stackId="a" fill={COLORS.ok} radius={[0, 0, 0, 0]}
                  animationBegin={300} animationDuration={800} />
                <Bar dataKey="problemi" stackId="a" fill={COLORS.crit} radius={[3, 3, 0, 0]}
                  animationBegin={400} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Uredni
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Problemi
            </span>
          </div>
        </Card>

        {/* Radial — Kritični zadaci */}
        <Card padding="md" className="animate-stagger" style={{ '--i': 6 } as React.CSSProperties}>
          <p className="text-[10px] font-[500] uppercase tracking-[0.07em] text-[var(--hint)] mb-3">Kritični zadaci</p>
          <div className="h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="60%" outerRadius="90%"
                barSize={12}
                data={taskRadial}
                startAngle={90} endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  background={{ fill: COLORS.raised }}
                  animationBegin={500}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[22px] font-[500] text-[var(--text)]">{s.tasks.critical}</p>
              <p className="text-[10px] text-[var(--muted)]">od {s.tasks.pending}</p>
            </div>
          </div>
          <p className="text-center text-[11px] text-[var(--muted)] mt-1">
            {critPct}% kritičnih
          </p>
        </Card>
      </div>

      {/* Quick links */}
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
