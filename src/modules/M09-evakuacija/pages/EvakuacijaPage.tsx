// M09 — Evakuacija — vježbe evakuacije i spašavanja
// [ZAK: čl. 45 ZZnR] Min. jednom godišnje
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge, Spinner, Input } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { useEvacuationsList, useEvacuationMutations } from '../hooks/useEvacuations'
import { DRILL_TYPES } from '../types'
import toast from 'react-hot-toast'

export default function EvakuacijaPage() {
  const { drills, isLoading, refetch } = useEvacuationsList()
  const { create, isSubmitting } = useEvacuationMutations()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    drill_date: new Date().toISOString().slice(0, 10), next_drill_date: '',
    drill_type: 'full', participants: '', duration_minutes: '', location: '',
    findings: '', corrective_actions: '', notes: '',
  })

  const handleSubmit = async () => {
    const nextDate = form.next_drill_date || (() => {
      const d = new Date(form.drill_date); d.setFullYear(d.getFullYear() + 1)
      return d.toISOString().slice(0, 10)
    })()
    await create({
      drill_date: form.drill_date, next_drill_date: nextDate, drill_type: form.drill_type,
      participants: form.participants ? Number(form.participants) : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      location: form.location.trim() || null, findings: form.findings.trim() || null,
      corrective_actions: form.corrective_actions.trim() || null,
      legal_ref_code: 'ZZnR-45-evakuacija-1god', notes: form.notes.trim() || null,
    })
    toast.success('Vježba evakuacije evidentirana')
    setShowForm(false)
    refetch()
  }

  return (
    <AppLayout title="Evakuacija" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Evakuacija' }]}
      actions={<div className="flex items-center gap-3">
        <LegalBadge article="čl. 45 ZZnR" deadline="min. jednom godišnje" />
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Nova vježba</Button>
      </div>}
    >
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : drills.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">Nema evidentiranih vježbi</p>
          <p className="text-sm mt-1">Evidentirajte vježbu evakuacije i spašavanja (čl. 45 ZZnR — min. godišnje).</p>
        </div>
      ) : (
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Datum</Table.HeaderCell><Table.HeaderCell>Vrsta</Table.HeaderCell>
            <Table.HeaderCell>Sudionici</Table.HeaderCell><Table.HeaderCell>Trajanje</Table.HeaderCell>
            <Table.HeaderCell>Lokacija</Table.HeaderCell><Table.HeaderCell>Sljedeća</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {drills.map(d => (
              <Table.Row key={d.id}>
                <Table.Cell>{new Date(d.drill_date).toLocaleDateString('hr-HR')}</Table.Cell>
                <Table.Cell><span className="text-xs">{DRILL_TYPES.find(t => t.value === d.drill_type)?.label}</span></Table.Cell>
                <Table.Cell>{d.participants ?? '—'}</Table.Cell>
                <Table.Cell>{d.duration_minutes ? `${d.duration_minutes} min` : '—'}</Table.Cell>
                <Table.Cell>{d.location ?? '—'}</Table.Cell>
                <Table.Cell>{d.next_drill_date ? new Date(d.next_drill_date).toLocaleDateString('hr-HR') : '—'}</Table.Cell>
                <Table.Cell><Badge variant={d.status === 'completed' ? 'success' : 'info'}>{d.status === 'completed' ? 'Završena' : d.status}</Badge></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova vježba evakuacije" size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Odustani</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Spremi</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Datum vježbe" type="date" value={form.drill_date} onChange={e => setForm(f => ({ ...f, drill_date: e.target.value }))} />
          <Input label="Sljedeća vježba" type="date" value={form.next_drill_date} onChange={e => setForm(f => ({ ...f, next_drill_date: e.target.value }))} hint="Auto: +1 godina (čl. 45 ZZnR)" />
          <Select label="Vrsta" options={[...DRILL_TYPES]} value={form.drill_type} onChange={e => setForm(f => ({ ...f, drill_type: e.target.value }))} />
          <Input label="Broj sudionika" type="number" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} />
          <Input label="Trajanje (min)" type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
          <Input label="Lokacija" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <div className="mt-4 space-y-4">
          <div><label className="text-sm font-medium text-slate-700">Nalazi</label>
            <textarea value={form.findings} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))} rows={2}
              className="w-full mt-1 rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="text-sm font-medium text-slate-700">Korektivne mjere</label>
            <textarea value={form.corrective_actions} onChange={e => setForm(f => ({ ...f, corrective_actions: e.target.value }))} rows={2}
              className="w-full mt-1 rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
      </Modal>
    </AppLayout>
  )
}
