// Forma za kreiranje/uređivanje radnika
// [ZAK: čl. 61 ZZnR] Evidencija radnika se trajno čuva

import { useState } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { formatOIBError } from '../utils/oib'
import { useWorkPositions } from '../hooks/useWorkers'
import { CONTRACT_TYPES, GENDER_OPTIONS } from '../types'
import type { WorkerRow, WorkerInsert, WorkerUpdate } from '../types'

type FormData = {
  first_name: string
  last_name: string
  oib: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  employment_date: string
  contract_type: string
  position_id: string
  department: string
  location: string
  is_special_conditions: boolean
  notes: string
}

function toFormData(w?: WorkerRow | null): FormData {
  return {
    first_name: w?.first_name ?? '',
    last_name: w?.last_name ?? '',
    oib: w?.oib ?? '',
    email: w?.email ?? '',
    phone: w?.phone ?? '',
    date_of_birth: w?.date_of_birth ?? '',
    gender: w?.gender ?? '',
    employment_date: w?.employment_date ?? '',
    contract_type: w?.contract_type ?? '',
    position_id: w?.position_id ?? '',
    department: w?.department ?? '',
    location: w?.location ?? '',
    is_special_conditions: w?.is_special_conditions ?? false,
    notes: w?.notes ?? '',
  }
}

interface WorkerFormProps {
  initialData?: WorkerRow | null
  onSubmit: (data: Omit<WorkerInsert, 'tenant_id'> | WorkerUpdate) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function WorkerForm({ initialData, onSubmit, isSubmitting, submitLabel }: WorkerFormProps) {
  const [form, setForm] = useState<FormData>(toFormData(initialData))
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const positions = useWorkPositions()

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.first_name.trim()) e.first_name = 'Ime je obavezno'
    if (!form.last_name.trim()) e.last_name = 'Prezime je obavezno'
    const oibErr = formatOIBError(form.oib)
    if (oibErr) e.oib = oibErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)

    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      oib: form.oib.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      employment_date: form.employment_date || null,
      contract_type: form.contract_type || null,
      position_id: form.position_id || null,
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      is_special_conditions: form.is_special_conditions,
      notes: form.notes.trim() || null,
    }

    try {
      await onSubmit(payload as Omit<WorkerInsert, 'tenant_id'>)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Greška pri spremanju')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {serverError && <Alert variant="danger" title="Greška">{serverError}</Alert>}

      {/* Osobni podaci */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Osobni podaci</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ime" value={form.first_name} onChange={update('first_name')}
            required error={errors.first_name} />
          <Input label="Prezime" value={form.last_name} onChange={update('last_name')}
            required error={errors.last_name} />
          <Input label="OIB" value={form.oib} onChange={update('oib')}
            maxLength={11} inputMode="numeric" error={errors.oib}
            hint="11 znamenki — potreban za HZZO prijave (čl. 62 ZZnR)" />
          <Input label="Datum rođenja" type="date" value={form.date_of_birth}
            onChange={update('date_of_birth')} />
          <Select label="Spol" options={[...GENDER_OPTIONS]} value={form.gender}
            onChange={update('gender')} placeholder="-- Odaberi --" />
        </div>
      </Card>

      {/* Kontakt */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Kontakt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={update('email')} />
          <Input label="Telefon" value={form.phone} onChange={update('phone')} />
        </div>
      </Card>

      {/* Zaposlenje */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Zaposlenje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Datum zaposlenja" type="date" value={form.employment_date}
            onChange={update('employment_date')}
            hint="Početak roka od 30 dana za osposobljavanje (čl. 27 ZZnR)" />
          <Select label="Vrsta ugovora" options={[...CONTRACT_TYPES]}
            value={form.contract_type} onChange={update('contract_type')}
            placeholder="-- Odaberi --" />
          <Select label="Radno mjesto"
            options={positions.map(p => ({ value: p.id, label: p.name }))}
            value={form.position_id} onChange={update('position_id')}
            placeholder="-- Odaberi --" />
          <Input label="Odjel / Tim" value={form.department} onChange={update('department')} />
          <Input label="Lokacija" value={form.location} onChange={update('location')} />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_special_conditions}
              onChange={e => setForm(f => ({ ...f, is_special_conditions: e.target.checked }))}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Posebni uvjeti rada (zahtijeva zdravstveni pregled — čl. 34 ZZnR)
          </label>
        </div>
      </Card>

      {/* Napomene */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Napomene</h3>
        <textarea
          value={form.notes}
          onChange={update('notes')}
          rows={3}
          className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Dodatne napomene..."
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}
