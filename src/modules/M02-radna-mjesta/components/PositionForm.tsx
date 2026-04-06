// Forma za radno mjesto + procjena rizika
// [ZAK: čl. 18 ZZnR] Revizija procjene rizika min. svake 2 godine
import { useState, useEffect } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { RISK_LEVELS } from '../types'
import type { WorkPositionInsert } from '../types'

type FormData = {
  name: string; code: string; description: string
  is_special_conditions: boolean; residual_risk_level: string
  risk_assessment_date: string; risk_assessment_next: string
  department: string; location: string
}

interface Props {
  onSubmit: (data: Omit<WorkPositionInsert, 'tenant_id'>) => Promise<void>
  isSubmitting: boolean
}

export function PositionForm({ onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState<FormData>({
    name: '', code: '', description: '', is_special_conditions: false,
    residual_risk_level: '', risk_assessment_date: '', risk_assessment_next: '',
    department: '', location: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  // Auto next revision: +2 god od datuma procjene
  useEffect(() => {
    if (form.risk_assessment_date) {
      const d = new Date(form.risk_assessment_date)
      d.setFullYear(d.getFullYear() + 2)
      setForm(f => ({ ...f, risk_assessment_next: d.toISOString().slice(0, 10) }))
    }
  }, [form.risk_assessment_date])

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim()) e.name = 'Naziv je obavezan'
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
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        is_special_conditions: form.is_special_conditions,
        residual_risk_level: form.residual_risk_level || null,
        risk_assessment_date: form.risk_assessment_date || null,
        risk_assessment_next: form.risk_assessment_next || null,
        department: form.department.trim() || null,
        location: form.location.trim() || null,
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
          <h3 className="text-sm font-semibold text-slate-900">Podaci o radnom mjestu</h3>
          <LegalBadge article="čl. 18 ZZnR" deadline="revizija min. 2 god" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Naziv radnog mjesta" value={form.name} onChange={update('name')} required error={errors.name} />
          <Input label="Šifra" value={form.code} onChange={update('code')} />
          <Input label="Odjel" value={form.department} onChange={update('department')} />
          <Input label="Lokacija" value={form.location} onChange={update('location')} />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_special_conditions}
              onChange={e => setForm(f => ({ ...f, is_special_conditions: e.target.checked }))}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Posebni uvjeti rada (čl. 34 ZZnR — zahtijeva zdravstveni pregled)
          </label>
        </div>
        <div className="mt-4">
          <textarea value={form.description} onChange={update('description')} rows={3}
            className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Opis radnog mjesta..." />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Procjena rizika</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Preostali rizik" options={[...RISK_LEVELS]} value={form.residual_risk_level}
            onChange={update('residual_risk_level')} placeholder="-- Odaberi --" />
          <Input label="Datum procjene" type="date" value={form.risk_assessment_date}
            onChange={update('risk_assessment_date')} />
          <Input label="Sljedeća revizija" type="date" value={form.risk_assessment_next}
            onChange={update('risk_assessment_next')}
            hint="Auto: +2 godine (čl. 18 ZZnR)" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>Dodaj radno mjesto</Button>
      </div>
    </form>
  )
}
