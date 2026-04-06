// M10 — SDS listovi — Safety Data Sheets za opasne tvari
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge, Spinner, Input } from '@/components/ui/index'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { useSdsList, useSdsMutations } from '../hooks/useSds'
import toast from 'react-hot-toast'

export default function SdsPage() {
  const { docs, isLoading, refetch } = useSdsList()
  const { create, isSubmitting } = useSdsMutations()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    chemical_name: '', cas_number: '', supplier: '', location: '',
    received_date: new Date().toISOString().slice(0, 10), expiry_date: '', notes: '',
  })

  const handleSubmit = async () => {
    if (!form.chemical_name.trim()) { toast.error('Naziv kemikalije je obavezan'); return }
    await create({
      chemical_name: form.chemical_name.trim(), cas_number: form.cas_number.trim() || null,
      supplier: form.supplier.trim() || null, location: form.location.trim() || null,
      received_date: form.received_date || null, expiry_date: form.expiry_date || null,
      notes: form.notes.trim() || null,
    })
    toast.success('SDS list dodan')
    setShowForm(false)
    refetch()
  }

  return (
    <AppLayout title="SDS listovi" breadcrumb={[{ label: 'Home', href: '/' }, { label: 'SDS listovi' }]}
      actions={<Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowForm(true)}>Novi SDS</Button>}
    >
      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : docs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">Nema SDS listova</p>
          <p className="text-sm mt-1">Dodajte sigurnosno-tehničke listove za opasne tvari na radnom mjestu.</p>
        </div>
      ) : (
        <Table>
          <Table.Header><Table.Row>
            <Table.HeaderCell>Kemikalija</Table.HeaderCell><Table.HeaderCell>CAS broj</Table.HeaderCell>
            <Table.HeaderCell>Dobavljač</Table.HeaderCell><Table.HeaderCell>Lokacija</Table.HeaderCell>
            <Table.HeaderCell>Zaprimljeno</Table.HeaderCell><Table.HeaderCell>Ističe</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row></Table.Header>
          <Table.Body>
            {docs.map(d => (
              <Table.Row key={d.id}>
                <Table.Cell><span className="font-medium">{d.chemical_name}</span></Table.Cell>
                <Table.Cell><span className="font-mono text-xs">{d.cas_number ?? '—'}</span></Table.Cell>
                <Table.Cell>{d.supplier ?? '—'}</Table.Cell>
                <Table.Cell>{d.location ?? '—'}</Table.Cell>
                <Table.Cell>{d.received_date ? new Date(d.received_date).toLocaleDateString('hr-HR') : '—'}</Table.Cell>
                <Table.Cell>{d.expiry_date ? new Date(d.expiry_date).toLocaleDateString('hr-HR') : '—'}</Table.Cell>
                <Table.Cell><Badge variant={d.status === 'active' ? 'success' : d.status === 'expired' ? 'danger' : 'default'}>
                  {d.status === 'active' ? 'Aktivan' : d.status === 'expired' ? 'Istekao' : 'Arhiviran'}
                </Badge></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novi SDS list" size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Odustani</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Spremi</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Naziv kemikalije" value={form.chemical_name} onChange={e => setForm(f => ({ ...f, chemical_name: e.target.value }))} required />
          <Input label="CAS broj" value={form.cas_number} onChange={e => setForm(f => ({ ...f, cas_number: e.target.value }))} placeholder="npr. 67-56-1" />
          <Input label="Dobavljač" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
          <Input label="Lokacija skladištenja" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <Input label="Datum zaprimanja" type="date" value={form.received_date} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))} />
          <Input label="Datum isteka" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
        </div>
      </Modal>
    </AppLayout>
  )
}
