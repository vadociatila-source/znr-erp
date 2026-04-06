// Forma za dodavanje radne opreme
// [ZAK: PR-04 NN 16/16] Pregled radne opreme max. svake 3 godine

import { useState, useEffect } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { EQUIPMENT_TYPES, EQUIPMENT_LEGAL_CODES } from '../types'
import type { EquipmentInsert } from '../types'

type FormData = {
  name: string
  equipment_type: string
  serial_number: string
  inventory_number: string
  manufacturer: string
  model: string
  year_manufactured: string
  location: string
  department: string
  has_increased_risk: boolean
  last_inspection_date: string
  next_inspection_date: string
  notes: string
}

interface Props {
  onSubmit: (data: Omit<EquipmentInsert, 'tenant_id'>) => Promise<void>
  isSubmitting: boolean
}

export function EquipmentForm({ onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState<FormData>({
    name: '', equipment_type: 'machine', serial_number: '', inventory_number: '',
    manufacturer: '', model: '', year_manufactured: '', location: '', department: '',
    has_increased_risk: false, last_inspection_date: '', next_inspection_date: '', notes: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  // Auto next_inspection: +3 godine od zadnjeg pregleda (standardna oprema)
  // Vatrogasni aparat: +1 godina vizualni
  useEffect(() => {
    if (!form.last_inspection_date) return
    const d = new Date(form.last_inspection_date)
    if (form.equipment_type === 'fire_extinguisher') {
      d.setFullYear(d.getFullYear() + 1) // vizualni 1 god
    } else {
      d.setFullYear(d.getFullYear() + 3) // standardno 3 god
    }
    setForm(f => ({ ...f, next_inspection_date: d.toISOString().slice(0, 10) }))
  }, [form.last_inspection_date, form.equipment_type])

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim()) e.name = 'Naziv opreme je obavezan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        equipment_type: form.equipment_type,
        serial_number: form.serial_number.trim() || null,
        inventory_number: form.inventory_number.trim() || null,
        manufacturer: form.manufacturer.trim() || null,
        model: form.model.trim() || null,
        year_manufactured: form.year_manufactured ? Number(form.year_manufactured) : null,
        location: form.location.trim() || null,
        department: form.department.trim() || null,
        has_increased_risk: form.has_increased_risk,
        last_inspection_date: form.last_inspection_date || null,
        next_inspection_date: form.next_inspection_date || null,
        legal_ref_code: EQUIPMENT_LEGAL_CODES[form.equipment_type] ?? null,
        notes: form.notes.trim() || null,
      })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Greška pri spremanju')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {serverError && <Alert variant="danger" title="Greška">{serverError}</Alert>}

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Podaci o opremi</h3>
          <LegalBadge article="PR-04 NN 16/16" deadline="pregled max. 3 god" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Naziv opreme" value={form.name} onChange={update('name')} required error={errors.name} />
          <Select label="Vrsta" options={[...EQUIPMENT_TYPES]} value={form.equipment_type}
            onChange={update('equipment_type')} required />
          <Input label="Serijski broj" value={form.serial_number} onChange={update('serial_number')} />
          <Input label="Inventarski broj" value={form.inventory_number} onChange={update('inventory_number')} />
          <Input label="Proizvođač" value={form.manufacturer} onChange={update('manufacturer')} />
          <Input label="Model" value={form.model} onChange={update('model')} />
          <Input label="Godina proizvodnje" type="number" value={form.year_manufactured} onChange={update('year_manufactured')} />
          <Input label="Lokacija" value={form.location} onChange={update('location')} />
          <Input label="Odjel" value={form.department} onChange={update('department')} />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
            <input type="checkbox" checked={form.has_increased_risk}
              onChange={e => setForm(f => ({ ...f, has_increased_risk: e.target.checked }))}
              className="rounded border-[var(--border)] text-[var(--mg-500)] focus:ring-[var(--border-f)]" />
            Oprema s povećanim rizikom
          </label>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Pregledi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Datum zadnjeg pregleda" type="date" value={form.last_inspection_date}
            onChange={update('last_inspection_date')} />
          <Input label="Sljedeći pregled" type="date" value={form.next_inspection_date}
            onChange={update('next_inspection_date')}
            hint={form.equipment_type === 'fire_extinguisher'
              ? 'Auto: +1 godina (vizualni, čl. 39 ZOP)'
              : 'Auto: +3 godine (PR-04 NN 16/16)'} />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Napomene</h3>
        <textarea value={form.notes} onChange={update('notes')} rows={3}
          className="w-full rounded-lg border border-[var(--border)] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--border-f)] focus:border-transparent" />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>Dodaj opremu</Button>
      </div>
    </form>
  )
}
