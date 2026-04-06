// Forma za unos zdravstvenog pregleda
// [ZAK: čl. 34 ZZnR] Zdravstveni pregledi za poslove s posebnim uvjetima

import { useState, useEffect } from 'react'
import { Input, Card, Alert } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { CHECK_TYPES, RESULT_OPTIONS, CHECK_LEGAL_CODES } from '../types'
import type { HealthCheckInsert } from '../types'

type FormData = {
  check_type: string
  check_date: string
  next_check_date: string
  result: string
  doctor_name: string
  institution: string
  restrictions: string
  notes: string
}

interface Props {
  workerId: string
  onSubmit: (data: Omit<HealthCheckInsert, 'tenant_id'>) => Promise<void>
  isSubmitting: boolean
}

export function HealthCheckForm({ workerId, onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState<FormData>({
    check_type: 'periodic',
    check_date: new Date().toISOString().slice(0, 10),
    next_check_date: '',
    result: 'fit',
    doctor_name: '',
    institution: '',
    restrictions: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  // Auto next_check_date: periodički = +3 god od datuma pregleda
  useEffect(() => {
    if (form.check_type === 'periodic' && form.check_date) {
      const d = new Date(form.check_date)
      d.setFullYear(d.getFullYear() + 3)
      setForm(f => ({ ...f, next_check_date: d.toISOString().slice(0, 10) }))
    }
  }, [form.check_type, form.check_date])

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.check_date) e.check_date = 'Datum pregleda je obavezan'
    if (!form.result) e.result = 'Rezultat je obavezan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)
    try {
      await onSubmit({
        worker_id: workerId,
        check_type: form.check_type,
        check_date: form.check_date,
        next_check_date: form.next_check_date || null,
        result: form.result,
        doctor_name: form.doctor_name.trim() || null,
        institution: form.institution.trim() || null,
        restrictions: form.restrictions.trim() || null,
        legal_ref_code: CHECK_LEGAL_CODES[form.check_type] ?? null,
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
          <h3 className="text-sm font-semibold text-[var(--text)]">Podaci o pregledu</h3>
          <LegalBadge article="čl. 34 ZZnR" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Vrsta pregleda" options={[...CHECK_TYPES]} value={form.check_type}
            onChange={update('check_type')} required />
          <Input label="Datum pregleda" type="date" value={form.check_date}
            onChange={update('check_date')} required error={errors.check_date} />
          <Input label="Sljedeći pregled" type="date" value={form.next_check_date}
            onChange={update('next_check_date')}
            hint={form.check_type === 'periodic' ? 'Auto: +3 godine (čl. 34 ZZnR)' : ''} />
          <Select label="Rezultat" options={[...RESULT_OPTIONS]} value={form.result}
            onChange={update('result')} required error={errors.result} />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Liječnik i ustanova</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ime liječnika" value={form.doctor_name} onChange={update('doctor_name')} />
          <Input label="Ustanova" value={form.institution} onChange={update('institution')} />
          <Input label="Ograničenja" value={form.restrictions} onChange={update('restrictions')}
            hint="Ako rezultat = sposoban s ograničenjima" />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Napomene</h3>
        <textarea value={form.notes} onChange={update('notes')} rows={3}
          className="w-full rounded-lg border border-[var(--border)] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--border-f)] focus:border-transparent"
          placeholder="Dodatne napomene..." />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>Spremi pregled</Button>
      </div>
    </form>
  )
}
