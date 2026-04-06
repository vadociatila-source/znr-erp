// Forma za prijavu ozljede na radu
// [ZAK: čl. 62 ZZnR] 48 sati za prijavu HZZO — HITNO!
import { useState } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import type { IncidentInsert } from '../types'

interface Props {
  workers: Array<{ id: string; first_name: string; last_name: string }>
  onSubmit: (data: Omit<IncidentInsert, 'tenant_id' | 'report_deadline'>) => Promise<void>
  isSubmitting: boolean
}

export function IncidentForm({ workers, onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState({
    worker_id: '',
    incident_date: new Date().toISOString().slice(0, 16), // datetime-local
    description: '',
    injury_type: '',
    body_part: '',
    location: '',
    witnesses: '',
    immediate_actions: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.worker_id) e.worker_id = 'Odaberite djelatnika'
    if (!form.incident_date) e.incident_date = 'Datum je obavezan'
    if (!form.description.trim()) e.description = 'Opis je obavezan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)
    try {
      await onSubmit({
        worker_id: form.worker_id,
        incident_date: new Date(form.incident_date).toISOString(),
        description: form.description.trim(),
        injury_type: form.injury_type.trim() || null,
        body_part: form.body_part.trim() || null,
        location: form.location.trim() || null,
        witnesses: form.witnesses.trim() || null,
        immediate_actions: form.immediate_actions.trim() || null,
      })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Greška pri spremanju')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {serverError && <Alert variant="danger" title="Greška">{serverError}</Alert>}

      <Alert variant="danger" title="HITNO — 48 sati za prijavu HZZO">
        Ozljeda na radu mora biti prijavljena HZZO-u u roku 48 sati od nastanka.
        Kazna za nepravovremenu prijavu: 5.000–50.000 EUR.
        <div className="mt-2">
          <LegalBadge article="čl. 62 ZZnR" deadline="48 sati" penalty="Kazna: 5.000–50.000 EUR" />
        </div>
      </Alert>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Podaci o ozljedi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Djelatnik" required error={errors.worker_id}
            options={workers.map(w => ({ value: w.id, label: `${w.first_name} ${w.last_name}` }))}
            value={form.worker_id} onChange={update('worker_id')} placeholder="-- Odaberi --" />
          <Input label="Datum i vrijeme ozljede" type="datetime-local" required
            value={form.incident_date} onChange={update('incident_date')} error={errors.incident_date} />
          <Input label="Vrsta ozljede" value={form.injury_type} onChange={update('injury_type')}
            placeholder="npr. posjekotina, udarac, pad..." />
          <Input label="Dio tijela" value={form.body_part} onChange={update('body_part')}
            placeholder="npr. ruka, noga, glava..." />
          <Input label="Mjesto nastanka" value={form.location} onChange={update('location')} />
          <Input label="Svjedoci" value={form.witnesses} onChange={update('witnesses')} />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Opis ozljede</h3>
        <textarea value={form.description} onChange={update('description')} rows={4} required
          className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Detaljno opišite što se dogodilo..." />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Poduzete mjere</h3>
        <textarea value={form.immediate_actions} onChange={update('immediate_actions')} rows={3}
          className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Koje mjere su odmah poduzete?" />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="danger" isLoading={isSubmitting}>Prijavi ozljedu</Button>
      </div>
    </form>
  )
}
