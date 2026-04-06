// M11 — Akcijski centar hook
// Agregira alarme iz svih ZNR modula u jedan pregled
// [ZAK] Svaki alarm ima zakonsku referencu, rok i razinu hitnosti

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AlarmLevel } from '@/types/legal.types'
import { getAlarmLevel } from '@/types/legal.types'

type TaskWithWorker = {
  id: string; title: string; description: string | null; due_date: string | null
  legal_ref_code: string | null; status: string
  worker: { id: string; first_name: string; last_name: string } | null
}

type TrainingWithWorker = {
  id: string; training_name: string; valid_until: string | null
  legal_ref_code: string | null; status: string; worker_id: string
  worker: { id: string; first_name: string; last_name: string } | null
}

type HealthCheckWithWorker = {
  id: string; check_type: string; next_check_date: string | null
  legal_ref_code: string | null; worker_id: string
  worker: { id: string; first_name: string; last_name: string } | null
}

type EquipmentItem = {
  id: string; name: string; equipment_type: string; next_inspection_date: string | null
  legal_ref_code: string | null; location: string | null; status: string
}

export interface AkcijskiItem {
  id: string
  level: AlarmLevel
  title: string
  description: string
  entityType: 'task' | 'training' | 'health_check' | 'equipment'
  entityId: string
  workerId: string | null
  workerName: string | null
  dueDate: string | null
  daysUntilDue: number | null
  legalRefCode: string | null
  moduleCode: string
  actionUrl: string
}

export function useAkcijskiCentar() {
  const [items, setItems] = useState<AkcijskiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState({ critical: 0, urgent: 0, warning: 0, info: 0 })

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const allItems: AkcijskiItem[] = []

    // 1) Pending tasks (M03 osposobljavanje alarmi)
    const { data: tasksRaw } = await supabase
      .from('tasks')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
    const tasksList = (tasksRaw ?? []) as unknown as TaskWithWorker[]

    for (const t of tasksList) {
      const w = t.worker
      const days = t.due_date
        ? Math.ceil((new Date(t.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      allItems.push({
        id: t.id,
        level: days !== null ? getAlarmLevel(days) : 'info',
        title: t.title,
        description: t.description ?? '',
        entityType: 'task',
        entityId: t.id,
        workerId: w?.id ?? null,
        workerName: w ? `${w.first_name} ${w.last_name}` : null,
        dueDate: t.due_date,
        daysUntilDue: days,
        legalRefCode: t.legal_ref_code,
        moduleCode: 'M03',
        actionUrl: w ? `/radnici/${w.id}` : '/osposobljavanja',
      })
    }

    // 2) Trainings expiring/expired
    const { data: trainingsRaw } = await supabase
      .from('trainings')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .in('status', ['expiring_soon', 'expired'])
    const trainingsList = (trainingsRaw ?? []) as unknown as TrainingWithWorker[]

    for (const t of trainingsList) {
      const w = t.worker
      const days = t.valid_until
        ? Math.ceil((new Date(t.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      allItems.push({
        id: `training-${t.id}`,
        level: days !== null ? getAlarmLevel(days) : 'warning',
        title: `Osposobljavanje ističe: ${t.training_name}`,
        description: w ? `${w.first_name} ${w.last_name}` : '',
        entityType: 'training',
        entityId: t.id,
        workerId: w?.id ?? null,
        workerName: w ? `${w.first_name} ${w.last_name}` : null,
        dueDate: t.valid_until,
        daysUntilDue: days,
        legalRefCode: t.legal_ref_code,
        moduleCode: 'M03',
        actionUrl: w ? `/radnici/${w.id}` : '/osposobljavanja',
      })
    }

    // 3) Health checks with expired next_check_date
    const { data: checksRaw } = await supabase
      .from('health_checks')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .not('next_check_date', 'is', null)
      .lte('next_check_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    const checksList = (checksRaw ?? []) as unknown as HealthCheckWithWorker[]

    for (const c of checksList) {
      const w = c.worker
      const days = c.next_check_date
        ? Math.ceil((new Date(c.next_check_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      allItems.push({
        id: `health-${c.id}`,
        level: days !== null ? getAlarmLevel(days) : 'warning',
        title: `Zdravstveni pregled: ${c.check_type === 'periodic' ? 'periodički' : c.check_type}`,
        description: w ? `${w.first_name} ${w.last_name}` : '',
        entityType: 'health_check',
        entityId: c.id,
        workerId: w?.id ?? null,
        workerName: w ? `${w.first_name} ${w.last_name}` : null,
        dueDate: c.next_check_date,
        daysUntilDue: days,
        legalRefCode: c.legal_ref_code,
        moduleCode: 'M04',
        actionUrl: w ? `/radnici/${w.id}` : '/zdravstveni-pregledi',
      })
    }

    // 4) Equipment with expired next_inspection_date
    const { data: equipRaw } = await supabase
      .from('equipment')
      .select('*')
      .eq('status', 'active')
      .not('next_inspection_date', 'is', null)
      .lte('next_inspection_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    const equipList = (equipRaw ?? []) as unknown as EquipmentItem[]

    for (const eq of equipList) {
      const days = eq.next_inspection_date
        ? Math.ceil((new Date(eq.next_inspection_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      allItems.push({
        id: `equip-${eq.id}`,
        level: days !== null ? getAlarmLevel(days) : 'warning',
        title: `Pregled opreme: ${eq.name}`,
        description: eq.equipment_type === 'fire_extinguisher' ? 'Vatrogasni aparat' : eq.location ?? '',
        entityType: 'equipment',
        entityId: eq.id,
        workerId: null,
        workerName: null,
        dueDate: eq.next_inspection_date,
        daysUntilDue: days,
        legalRefCode: eq.legal_ref_code,
        moduleCode: 'M05',
        actionUrl: '/radna-oprema',
      })
    }

    // Sortiraj po hitnosti (critical first) pa po datumu
    const levelOrder: Record<AlarmLevel, number> = { critical: 0, urgent: 1, warning: 2, info: 3, ok: 4 }
    allItems.sort((a, b) => {
      const ld = levelOrder[a.level] - levelOrder[b.level]
      if (ld !== 0) return ld
      return (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999)
    })

    setItems(allItems)
    setCounts({
      critical: allItems.filter(i => i.level === 'critical').length,
      urgent: allItems.filter(i => i.level === 'urgent').length,
      warning: allItems.filter(i => i.level === 'warning').length,
      info: allItems.filter(i => i.level === 'info').length,
    })
    setIsLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { items, counts, isLoading, refetch: fetch }
}
