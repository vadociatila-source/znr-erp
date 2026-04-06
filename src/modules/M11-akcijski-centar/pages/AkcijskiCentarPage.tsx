// M11 — Akcijski centar
// Jedno mjesto za SVE hitne ZNR obveze — poslodavac ovo otvara svaki dan.
// Agregira alarme iz M03 (osposobljavanja), M04 (pregledi), M05 (oprema) + tasks.
// [ZAK] Svaki alarm prikazuje zakonsku referencu, rok i razinu.

import { useState } from 'react'
import { useLocation } from 'wouter'
import { Bell, AlertTriangle, Clock, Info, CheckCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Spinner } from '@/components/ui/index'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { useAkcijskiCentar } from '../hooks/useAkcijskiCentar'
import type { AkcijskiItem } from '../hooks/useAkcijskiCentar'
import { ALARM_COLORS, type AlarmLevel } from '@/types/legal.types'

const LEVEL_ICON: Record<AlarmLevel, React.ReactNode> = {
  critical: <AlertTriangle size={16} className="text-[var(--crit-acc)]" />,
  urgent:   <Clock size={16} className="text-[var(--warn-acc)]" />,
  warning:  <Bell size={16} className="text-yellow-600" />,
  info:     <Info size={16} className="text-[var(--info-acc)]" />,
  ok:       <CheckCircle size={16} className="text-[var(--ok-acc)]" />,
}

const LEVEL_LABELS: Record<AlarmLevel, string> = {
  critical: 'Isteklo / Hitno',
  urgent:   'Uskoro ističe',
  warning:  'Upozorenje',
  info:     'Na vidiku',
  ok:       'Uredno',
}

const MODULE_LABELS: Record<string, string> = {
  M03: 'Osposobljavanja',
  M04: 'Zdravstveni pregledi',
  M05: 'Radna oprema',
}

function AlarmCard({ item }: { item: AkcijskiItem }) {
  const [, navigate] = useLocation()
  return (
    <div
      className={`rounded-lg border p-4 cursor-pointer transition-shadow hover:shadow-md ${ALARM_COLORS[item.level]}`}
      onClick={() => navigate(item.actionUrl)}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{LEVEL_ICON[item.level]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{item.title}</p>
            <Badge variant={item.level === 'critical' ? 'danger' : item.level === 'urgent' ? 'warning' : 'info'} size="sm">
              {item.daysUntilDue !== null
                ? item.daysUntilDue <= 0
                  ? `${Math.abs(item.daysUntilDue)}d kasni`
                  : `${item.daysUntilDue}d`
                : '—'}
            </Badge>
          </div>
          {item.workerName && (
            <p className="text-xs mt-0.5 opacity-75">{item.workerName}</p>
          )}
          {item.description && !item.workerName && (
            <p className="text-xs mt-0.5 opacity-75">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs opacity-60">{MODULE_LABELS[item.moduleCode] ?? item.moduleCode}</span>
            {item.legalRefCode && (
              <LegalBadge article={item.legalRefCode} size="xs" />
            )}
            {item.dueDate && (
              <span className="text-xs opacity-60">
                Rok: {new Date(item.dueDate).toLocaleDateString('hr-HR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AkcijskiCentarPage() {
  const { items, counts, isLoading } = useAkcijskiCentar()
  const [filterLevel, setFilterLevel] = useState<AlarmLevel | 'all'>('all')

  const filtered = filterLevel === 'all' ? items : items.filter(i => i.level === filterLevel)
  const total = counts.critical + counts.urgent + counts.warning + counts.info

  if (isLoading) {
    return (
      <AppLayout title="Akcijski centar">
        <div className="flex justify-center py-12"><Spinner size="lg" className="text-[var(--mg-500)]" /></div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Akcijski centar"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Akcijski centar' }]}
    >
      {/* Statistike */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card
          padding="md"
          className={`cursor-pointer border-2 ${filterLevel === 'critical' ? 'border-[var(--crit-b)]' : 'border-transparent'}`}
          onClick={() => setFilterLevel(f => f === 'critical' ? 'all' : 'critical')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[var(--crit-acc)]">{counts.critical}</p>
              <p className="text-xs text-[var(--muted)]">Isteklo / Hitno</p>
            </div>
            <AlertTriangle size={24} className="text-red-300" />
          </div>
        </Card>
        <Card
          padding="md"
          className={`cursor-pointer border-2 ${filterLevel === 'urgent' ? 'border-orange-400' : 'border-transparent'}`}
          onClick={() => setFilterLevel(f => f === 'urgent' ? 'all' : 'urgent')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[var(--warn-acc)]">{counts.urgent}</p>
              <p className="text-xs text-[var(--muted)]">Uskoro ističe</p>
            </div>
            <Clock size={24} className="text-orange-300" />
          </div>
        </Card>
        <Card
          padding="md"
          className={`cursor-pointer border-2 ${filterLevel === 'warning' ? 'border-yellow-400' : 'border-transparent'}`}
          onClick={() => setFilterLevel(f => f === 'warning' ? 'all' : 'warning')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{counts.warning}</p>
              <p className="text-xs text-[var(--muted)]">Upozorenja</p>
            </div>
            <Bell size={24} className="text-yellow-300" />
          </div>
        </Card>
        <Card
          padding="md"
          className={`cursor-pointer border-2 ${filterLevel === 'info' ? 'border-blue-400' : 'border-transparent'}`}
          onClick={() => setFilterLevel(f => f === 'info' ? 'all' : 'info')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[var(--info-acc)]">{counts.info}</p>
              <p className="text-xs text-[var(--muted)]">Na vidiku</p>
            </div>
            <Info size={24} className="text-blue-300" />
          </div>
        </Card>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--muted)]">
          {filterLevel === 'all'
            ? `${total} aktivnih alarma`
            : `${filtered.length} — ${LEVEL_LABELS[filterLevel]}`}
        </p>
        {filterLevel !== 'all' && (
          <button
            onClick={() => setFilterLevel('all')}
            className="text-xs text-[var(--mg-500)] hover:underline"
          >
            Prikaži sve
          </button>
        )}
      </div>

      {/* Lista alarma */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle size={48} className="text-[var(--ok-t)] mx-auto mb-3" />
          <p className="text-lg font-medium text-[var(--text)]">Sve uredno!</p>
          <p className="text-sm text-[var(--muted)]">Nema aktivnih alarma.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AlarmCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
