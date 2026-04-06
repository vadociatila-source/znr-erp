// M06 — Radni okoliš — ispitivanja fizikalnih/kemijskih čimbenika
// [ZAK: PR-05] Fizikalni max 3 god, kemijski max 2 god
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge, Spinner, Input } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { useEnvironmentTestsList, useEnvironmentTestMutations } from '../hooks/useEnvironmentTests'
import { TEST_TYPES, RESULT_OPTIONS, LEGAL_CODES } from '../types'
import toast from 'react-hot-toast'

const RESULT_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  compliant: { variant: 'success', label: 'Sukladno' },
  non_compliant: { variant: 'danger', label: 'Nesukladno' },
  partial: { variant: 'warning', label: 'Djelomično' },
}

export default function RadniOkolisPage() {
  const { tests, isLoading, refetch } = useEnvironmentTestsList()
  const { create, isSubmitting } = useEnvironmentTestMutations()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    test_type: 'physical', test_name: '', test_date: new Date().toISOString().slice(0, 10),
    next_test_date: '', provider: '', location: '', result: 'compliant', notes: '',
  })

  const handleSubmit = async () => {
    if (!form.test_name.trim()) { toast.error('Naziv je obavezan'); return }
    const nextDate = form.next_test_date || (() => {
      const d = new Date(form.test_date)
      d.setFullYear(d.getFullYear() + (form.test_type === 'chemical' ? 2 : 3))
      return d.toISOString().slice(0, 10)
    })()
    await create({
      test_type: form.test_type, test_name: form.test_name.trim(), test_date: form.test_date,
      next_test_date: nextDate, provider: form.provider.trim() || null,
      location: form.location.trim() || null, result: form.result,
      legal_ref_code: LEGAL_CODES[form.test_type] ?? null, notes: form.notes.trim() || null,
    })
    toast.success('Ispitivanje dodano')
    setShowForm(false)
    refetch()
  }

  return (
    <AppLayout title="Radni okoliš" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Radni okoliš' }]}
      actions={<div className="flex items-center gap-3">
        <LegalBadge article="PR-05" deadline="fizikalni 3god / kemijski 2god" />
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Novo ispitivanje</Button>
      </div>}
    >
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : tests.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <p className="text-lg font-medium">Nema ispitivanja</p>
          <p className="text-sm mt-1">Dodajte ispitivanje radnog okoliša.</p>
        </div>
      ) : (
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Naziv</Table.HeaderCell><Table.HeaderCell>Vrsta</Table.HeaderCell>
            <Table.HeaderCell>Datum</Table.HeaderCell><Table.HeaderCell>Sljedeće</Table.HeaderCell>
            <Table.HeaderCell>Rezultat</Table.HeaderCell><Table.HeaderCell>Izvoditelj</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {tests.map(t => {
              const rb = RESULT_BADGE[t.result ?? 'compliant']
              return (
                <Table.Row key={t.id}>
                  <Table.Cell><span className="font-medium">{t.test_name}</span></Table.Cell>
                  <Table.Cell><span className="text-xs">{TEST_TYPES.find(tt => tt.value === t.test_type)?.label}</span></Table.Cell>
                  <Table.Cell>{new Date(t.test_date).toLocaleDateString('hr-HR')}</Table.Cell>
                  <Table.Cell>{t.next_test_date ? new Date(t.next_test_date).toLocaleDateString('hr-HR') : '—'}</Table.Cell>
                  <Table.Cell><Badge variant={rb?.variant ?? 'default'}>{rb?.label ?? '—'}</Badge></Table.Cell>
                  <Table.Cell>{t.provider ?? '—'}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo ispitivanje radnog okoliša" size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Odustani</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Spremi</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Vrsta" options={[...TEST_TYPES]} value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))} />
          <Input label="Naziv" value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} required />
          <Input label="Datum" type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} />
          <Input label="Sljedeće" type="date" value={form.next_test_date} onChange={e => setForm(f => ({ ...f, next_test_date: e.target.value }))}
            hint={form.test_type === 'chemical' ? 'Auto: +2 god' : 'Auto: +3 god'} />
          <Select label="Rezultat" options={[...RESULT_OPTIONS]} value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} />
          <Input label="Izvoditelj" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
          <Input label="Lokacija" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
      </Modal>
    </AppLayout>
  )
}
