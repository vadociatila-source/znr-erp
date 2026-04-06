// Forma za dodavanje/uređivanje osposobljavanja
// [ZAK: čl. 27 ZZnR] Osposobljavanje novog djelatnika u 30 dana
// [ZAK: PR-02 NN 142/21] Usavršavanje svake 4 godine

import { useState, useEffect } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { TRAINING_TYPES, TRAINING_LEGAL_CODES } from '../types'
import type { TrainingRow, TrainingInsert } from '../types'

type FormData = {
  training_type: string
  training_name: string
  training_date: string
  valid_until: string
  provider: string
  location: string
  certificate_number: string
  notes: string
}

function toFormData(t?: TrainingRow | null): FormData {
  return {
    training_type: t?.training_type ?? 'initial',
    training_name: t?.training_name ?? '',
    training_date: t?.training_date ?? new Date().toISOString().slice(0, 10),
    valid_until: t?.valid_until ?? '',
    provider: t?.provider ?? '',
    location: t?.location ?? '',
    certificate_number: t?.certificate_number ?? '',
    notes: t?.notes ?? '',
  }
}

interface TrainingFormProps {
  workerId: string
  initialData?: TrainingRow | null
  onSubmit: (data: Omit<TrainingInsert, 'tenant_id'>) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function TrainingForm({ workerId, initialData, onSubmit, isSubmitting, submitLabel }: TrainingFormProps) {
  const [form, setForm] = useState<FormData>(toFormData(initialData))
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  // Auto-fill training name i valid_until na osnovu tipa
  useEffect(() => {
    if (initialData) return // ne auto-fillaj za edit
    const typeLabel = TRAINING_TYPES.find(t => t.value === form.training_type)?.label ?? ''
    setForm(f => {
      const updates: Partial<FormData> = { training_name: typeLabel }

      // Auto valid_until: initial nema isteka, refresher = +4 godine
      if (form.training_type === 'refresher' && f.training_date) {
        const d = new Date(f.training_date)
        d.setFullYear(d.getFullYear() + 4)
        updates.valid_until = d.toISOString().slice(0, 10)
      } else if (form.training_type === 'initial') {
        updates.valid_until = '' // početno nema isteka (dok ne dođe refresher)
      }

      return { ...f, ...updates }
    })
  }, [form.training_type, form.training_date, initialData])

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.training_name.trim()) e.training_name = 'Naziv je obavezan'
    if (!form.training_date) e.training_date = 'Datum je obavezan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)

    const legalCode = TRAINING_LEGAL_CODES[form.training_type] ?? null

    try {
      await onSubmit({
        worker_id: workerId,
        training_type: form.training_type,
        training_name: form.training_name.trim(),
        training_date: form.training_date,
        valid_until: form.valid_until || null,
        provider: form.provider.trim() || null,
        location: form.location.trim() || null,
        certificate_number: form.certificate_number.trim() || null,
        legal_ref_code: legalCode,
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
          <h3 className="text-sm font-semibold text-slate-900">Podaci o osposobljavanju</h3>
          <LegalBadge article="čl. 27 ZZnR" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Vrsta osposobljavanja"
            options={[...TRAINING_TYPES]}
            value={form.training_type}
            onChange={update('training_type')}
            required
          />
          <Input
            label="Naziv"
            value={form.training_name}
            onChange={update('training_name')}
            required
            error={errors.training_name}
          />
          <Input
            label="Datum osposobljavanja"
            type="date"
            value={form.training_date}
            onChange={update('training_date')}
            required
            error={errors.training_date}
          />
          <Input
            label="Vrijedi do"
            type="date"
            value={form.valid_until}
            onChange={update('valid_until')}
            hint={form.training_type === 'refresher'
              ? 'Auto: 4 godine od datuma (čl. 27 ZZnR + PR-02)'
              : 'Prazno = trajno važeće'}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Izvoditelj i dokument</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Izvoditelj" value={form.provider} onChange={update('provider')} />
          <Input label="Lokacija" value={form.location} onChange={update('location')} />
          <Input label="Broj certifikata" value={form.certificate_number}
            onChange={update('certificate_number')} />
        </div>
      </Card>

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
