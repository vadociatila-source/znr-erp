// M07 — OZO — Osobna zaštitna oprema
// [ZAK: PR-06 NN 5/21]
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge, Spinner, Input } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { useOzoList, useOzoMutations } from '../hooks/useOzo'
import { OZO_ITEM_TYPES } from '../types'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function OzoPage() {
  const { records, isLoading, refetch } = useOzoList()
  const { create, isSubmitting } = useOzoMutations()
  const [showForm, setShowForm] = useState(false)
  const [workers, setWorkers] = useState<Array<{ id: string; first_name: string; last_name: string }>>([])
  const [form, setForm] = useState({
    worker_id: '', item_name: '', item_type: 'gloves',
    issued_date: new Date().toISOString().slice(0, 10),
    replacement_date: '', quantity: '1', size: '', notes: '',
  })

  useEffect(() => {
    supabase.from('workers').select('id, first_name, last_name').eq('status', 'active')
      .order('last_name').then(({ data }) => setWorkers(data ?? []))
  }, [])

  const handleSubmit = async () => {
    if (!form.worker_id || !form.item_name.trim()) { toast.error('Djelatnik i naziv su obavezni'); return }
    await create({
      worker_id: form.worker_id, item_name: form.item_name.trim(), item_type: form.item_type,
      issued_date: form.issued_date, replacement_date: form.replacement_date || null,
      quantity: Number(form.quantity) || 1, size: form.size.trim() || null,
      notes: form.notes.trim() || null,
    })
    toast.success('OZO izdana')
    setShowForm(false)
    refetch()
  }

  return (
    <AppLayout title="OZO — Osobna zaštitna oprema" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'OZO' }]}
      actions={<div className="flex items-center gap-3">
        <LegalBadge article="PR-06 NN 5/21" />
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Izdaj OZO</Button>
      </div>}
    >
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : records.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">Nema izdane OZO</p>
          <p className="text-sm mt-1">Evidentirajte izdavanje osobne zaštitne opreme djelatnicima.</p>
        </div>
      ) : (
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Djelatnik</Table.HeaderCell><Table.HeaderCell>Oprema</Table.HeaderCell>
            <Table.HeaderCell>Vrsta</Table.HeaderCell><Table.HeaderCell>Datum izdavanja</Table.HeaderCell>
            <Table.HeaderCell>Zamjena</Table.HeaderCell><Table.HeaderCell>Kol.</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {records.map(r => (
              <Table.Row key={r.id}>
                <Table.Cell><span className="font-medium">{r.worker ? `${r.worker.first_name} ${r.worker.last_name}` : '—'}</span></Table.Cell>
                <Table.Cell>{r.item_name}</Table.Cell>
                <Table.Cell><span className="text-xs">{OZO_ITEM_TYPES.find(t => t.value === r.item_type)?.label ?? r.item_type}</span></Table.Cell>
                <Table.Cell>{new Date(r.issued_date).toLocaleDateString('hr-HR')}</Table.Cell>
                <Table.Cell>{r.replacement_date ? new Date(r.replacement_date).toLocaleDateString('hr-HR') : '—'}</Table.Cell>
                <Table.Cell>{r.quantity}</Table.Cell>
                <Table.Cell><Badge variant={r.status === 'active' ? 'success' : 'default'}>{r.status === 'active' ? 'Aktivna' : r.status}</Badge></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Izdaj osobnu zaštitnu opremu" size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Odustani</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Spremi</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Djelatnik" options={workers.map(w => ({ value: w.id, label: `${w.first_name} ${w.last_name}` }))}
            value={form.worker_id} onChange={e => setForm(f => ({ ...f, worker_id: e.target.value }))} placeholder="-- Odaberi --" required />
          <Input label="Naziv opreme" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} required />
          <Select label="Vrsta" options={[...OZO_ITEM_TYPES]} value={form.item_type} onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))} />
          <Input label="Datum izdavanja" type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))} />
          <Input label="Datum zamjene" type="date" value={form.replacement_date} onChange={e => setForm(f => ({ ...f, replacement_date: e.target.value }))} />
          <Input label="Količina" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
          <Input label="Veličina" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
        </div>
      </Modal>
    </AppLayout>
  )
}
