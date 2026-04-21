// M12 — Inspekcijska mapa — agregira sve podatke za inspektora
// Jedan klik → jedna .xlsx s više listova, razriješena imena umjesto UUID-ova
// [ZAK: čl. 61 ZZnR] evidencija trajno — format pogodan za print i pohranu

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'

type Row = Record<string, unknown>

const fmtDate = (v: unknown): string => {
  if (!v) return ''
  const s = String(v)
  if (s.length < 10) return s
  return new Date(s).toLocaleDateString('hr-HR')
}

const fmtBool = (v: unknown): string => (v === true ? 'Da' : v === false ? 'Ne' : '')

const fmtArray = (v: unknown): string => (Array.isArray(v) ? v.join(', ') : String(v ?? ''))

export function useInspekcijskaMapa() {
  const [isExporting, setIsExporting] = useState(false)
  const tenant = useTenantStore(s => s.activeTenant)

  const exportZip = async (): Promise<void> => {
    setIsExporting(true)
    try {
      const [
        workersR, positionsR, trainingsR, healthR, equipmentR, incidentsR,
      ] = await Promise.all([
        supabase.from('workers').select('*').order('last_name'),
        supabase.from('work_positions').select('*').order('name'),
        supabase.from('trainings').select('*').order('training_date', { ascending: false }),
        supabase.from('health_checks').select('*').order('check_date', { ascending: false }),
        supabase.from('equipment').select('*').order('name'),
        supabase.from('incidents').select('*').order('incident_date', { ascending: false }),
      ])

      const workers = (workersR.data ?? []) as Row[]
      const positions = (positionsR.data ?? []) as Row[]
      const trainings = (trainingsR.data ?? []) as Row[]
      const healthChecks = (healthR.data ?? []) as Row[]
      const equipment = (equipmentR.data ?? []) as Row[]
      const incidents = (incidentsR.data ?? []) as Row[]

      // Lookup mape — UUID → naziv
      const workerLabel = new Map<string, string>()
      for (const w of workers) {
        workerLabel.set(
          String(w.id),
          `${w.last_name ?? ''} ${w.first_name ?? ''}`.trim()
        )
      }
      const positionLabel = new Map<string, string>()
      for (const p of positions) positionLabel.set(String(p.id), String(p.name ?? ''))

      // ── Djelatnici ──
      const djelatniciSheet = workers.map(w => ({
        'Prezime': w.last_name,
        'Ime': w.first_name,
        'OIB': w.oib,
        'Datum rođenja': fmtDate(w.date_of_birth),
        'Spol': w.gender === 'M' ? 'Muški' : w.gender === 'F' ? 'Ženski' : '',
        'Radno mjesto': positionLabel.get(String(w.position_id)) ?? '',
        'Odjel': w.department,
        'Lokacija': w.location,
        'Datum zaposlenja': fmtDate(w.employment_date),
        'Datum prestanka': fmtDate(w.termination_date),
        'Vrsta ugovora': w.contract_type,
        'Posebni uvjeti': fmtBool(w.is_special_conditions),
        'Status': w.status === 'active' ? 'Aktivan' : w.status === 'former' ? 'Bivši' : String(w.status ?? ''),
        'Email': w.email,
        'Telefon': w.phone,
        'Napomena': w.notes,
      }))

      // ── Radna mjesta ──
      const radnaMjestaSheet = positions.map(p => ({
        'Naziv': p.name,
        'Kod': p.code,
        'Opis': p.description,
        'Odjel': p.department,
        'Lokacija': p.location,
        'Posebni uvjeti': fmtBool(p.is_special_conditions),
        'Tip posebnih uvjeta': fmtArray(p.special_conditions_type),
        'Opasnosti': fmtArray(p.hazards),
        'Zaštitne mjere': fmtArray(p.protective_measures),
        'Razina rizika': p.residual_risk_level,
        'Datum procjene': fmtDate(p.risk_assessment_date),
        'Sljedeća procjena': fmtDate(p.risk_assessment_next),
        'Status': p.status,
      }))

      // ── Osposobljavanja ──
      const osposobljavanjaSheet = trainings.map(t => ({
        'Djelatnik': workerLabel.get(String(t.worker_id)) ?? '',
        'Vrsta osposobljavanja': t.training_type,
        'Naziv': t.training_name,
        'Datum': fmtDate(t.training_date),
        'Vrijedi do': fmtDate(t.valid_until),
        'Izvođač': t.provider,
        'Lokacija': t.location,
        'Broj certifikata': t.certificate_number,
        'Zakonska referenca': t.legal_ref_code,
        'Potpisano': fmtDate(t.digital_signature_at),
        'Status': t.status,
        'Napomena': t.notes,
      }))

      // ── Zdravstveni pregledi ──
      const preglediSheet = healthChecks.map(h => ({
        'Djelatnik': workerLabel.get(String(h.worker_id)) ?? '',
        'Vrsta pregleda': h.check_type,
        'Datum': fmtDate(h.check_date),
        'Sljedeći pregled': fmtDate(h.next_check_date),
        'Liječnik': h.doctor_name,
        'Ustanova': h.institution,
        'Rezultat': h.result,
        'Ograničenja': h.restrictions,
        'Zakonska referenca': h.legal_ref_code,
        'Napomena': h.notes,
      }))

      // ── Radna oprema ──
      const opremaSheet = equipment.map(e => ({
        'Naziv': e.name,
        'Vrsta': e.equipment_type,
        'Serijski broj': e.serial_number,
        'Inv. broj': e.inventory_number,
        'Proizvođač': e.manufacturer,
        'Model': e.model,
        'God. proizvodnje': e.year_manufactured,
        'Lokacija': e.location,
        'Odjel': e.department,
        'Povećan rizik': fmtBool(e.has_increased_risk),
        'Zadnji pregled': fmtDate(e.last_inspection_date),
        'Sljedeći pregled': fmtDate(e.next_inspection_date),
        'Interval (dana)': e.inspection_interval_days,
        'Zakonska referenca': e.legal_ref_code,
        'Status': e.status,
        'VA: zadnji kontrolni': fmtDate(e.fire_ext_last_owner_check),
        'VA: sljedeći kontrolni': fmtDate(e.fire_ext_next_owner_check),
        'VA: zadnji servis': fmtDate(e.fire_ext_last_service),
        'VA: sljedeći servis': fmtDate(e.fire_ext_next_service),
        'VA: zadnje tlačno ispitivanje': fmtDate(e.fire_ext_last_control_test),
        'VA: sljedeće tlačno ispitivanje': fmtDate(e.fire_ext_next_control_test),
        'Napomena': e.notes,
      }))

      // ── Ozljede ──
      const ozljedeSheet = incidents.map(i => ({
        'Djelatnik': workerLabel.get(String(i.worker_id)) ?? '',
        'Datum ozljede': fmtDate(i.incident_date),
        'Rok prijave HZZO': fmtDate(i.report_deadline),
        'Opis': i.description,
        'Vrsta ozljede': i.injury_type,
        'Dio tijela': i.body_part,
        'Lokacija': i.location,
        'Svjedoci': i.witnesses,
        'Prve akcije': i.immediate_actions,
        'Analiza uzroka': i.cause_analysis,
        'Preventivne mjere': i.preventive_measures,
        'HZZO prijavljeno': fmtBool(i.hzzo_reported),
        'HZZO datum prijave': fmtDate(i.hzzo_reported_at),
        'Zakonska referenca': i.legal_ref_code,
        'Status': i.status,
        'Napomena': i.notes,
      }))

      // ── Sažetak ──
      const sazetak = [
        { Evidencija: 'Djelatnici', 'Broj zapisa': workers.length },
        { Evidencija: 'Radna mjesta', 'Broj zapisa': positions.length },
        { Evidencija: 'Osposobljavanja', 'Broj zapisa': trainings.length },
        { Evidencija: 'Zdravstveni pregledi', 'Broj zapisa': healthChecks.length },
        { Evidencija: 'Radna oprema', 'Broj zapisa': equipment.length },
        { Evidencija: 'Ozljede na radu', 'Broj zapisa': incidents.length },
      ]

      // ── Build workbook ──
      const wb = XLSX.utils.book_new()
      const sheets: Array<[string, Row[]]> = [
        ['Sažetak', sazetak],
        ['Djelatnici', djelatniciSheet],
        ['Radna mjesta', radnaMjestaSheet],
        ['Osposobljavanja', osposobljavanjaSheet],
        ['Zdravstveni pregledi', preglediSheet],
        ['Radna oprema', opremaSheet],
        ['Ozljede', ozljedeSheet],
      ]

      for (const [name, rows] of sheets) {
        const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Napomena: 'Nema zapisa' }])
        // Auto column widths na bazi headera + sample podataka
        const keys = Object.keys(rows.length ? rows[0] : { Napomena: '' })
        ws['!cols'] = keys.map(k => {
          const headerLen = k.length
          const maxDataLen = rows.slice(0, 50).reduce((m, r) => {
            const v = r[k]
            return Math.max(m, String(v ?? '').length)
          }, 0)
          return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) }
        })
        XLSX.utils.book_append_sheet(wb, ws, name)
      }

      const dateStr = new Date().toISOString().slice(0, 10)
      const tenantSlug = (tenant?.name ?? 'tvrtka').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      XLSX.writeFile(wb, `inspekcijska_mapa_${tenantSlug}_${dateStr}.xlsx`)
    } finally {
      setIsExporting(false)
    }
  }

  return { exportZip, isExporting }
}
