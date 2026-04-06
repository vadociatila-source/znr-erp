// M12 — Inspekcijska mapa — agregira sve podatke za inspektora
// Jedan klik → ZIP download s CSV-ovima svih ZNR evidencija
// Kad Sprint 008 (PDF) bude gotov, zamijenit ćemo CSV-ove s PDFovima.

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type ExportData = {
  workers: Record<string, unknown>[]
  trainings: Record<string, unknown>[]
  healthChecks: Record<string, unknown>[]
  equipment: Record<string, unknown>[]
  incidents: Record<string, unknown>[]
  workPositions: Record<string, unknown>[]
}

function toCsv(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return ''
  const keys = headers ?? Object.keys(data[0])
  const rows = data.map(row =>
    keys.map(k => {
      const v = String(row[k] ?? '')
      return `"${v.replace(/"/g, '""')}"`
    }).join(',')
  )
  return [keys.join(','), ...rows].join('\n')
}

export function useInspekcijskaMapa() {
  const [isExporting, setIsExporting] = useState(false)

  const exportZip = async (): Promise<void> => {
    setIsExporting(true)
    try {
      // Dohvati sve podatke paralelno
      const [workers, trainings, healthChecks, equipment, incidents, positions] = await Promise.all([
        supabase.from('workers').select('*').order('last_name'),
        supabase.from('trainings').select('*').order('training_date', { ascending: false }),
        supabase.from('health_checks').select('*').order('check_date', { ascending: false }),
        supabase.from('equipment').select('*').order('name'),
        supabase.from('incidents').select('*').order('incident_date', { ascending: false }),
        supabase.from('work_positions').select('*').order('name'),
      ])

      const data: ExportData = {
        workers: workers.data ?? [],
        trainings: trainings.data ?? [],
        healthChecks: healthChecks.data ?? [],
        equipment: equipment.data ?? [],
        incidents: incidents.data ?? [],
        workPositions: positions.data ?? [],
      }

      // Generiraj CSV-ove
      const files: Array<{ name: string; content: string }> = [
        { name: 'djelatnici.csv', content: toCsv(data.workers) },
        { name: 'osposobljavanja.csv', content: toCsv(data.trainings) },
        { name: 'zdravstveni_pregledi.csv', content: toCsv(data.healthChecks) },
        { name: 'radna_oprema.csv', content: toCsv(data.equipment) },
        { name: 'ozljede.csv', content: toCsv(data.incidents) },
        { name: 'radna_mjesta.csv', content: toCsv(data.workPositions) },
      ]

      // ZIP generiranje bez externe biblioteke — koristimo nativni Blob + download
      // Za pravi ZIP trebao bi JSZip, ali to je extra dependency.
      // Za MVP: download svaki CSV zasebno u jednom potezu, ili spakirati u JSON.
      // Odluka: downloadamo jedan JSON s svim podacima + pojedinačne CSV-ove.

      // Za sad: download kao JSON bundle (inspektor može otvoriti u Excel-u)
      const dateStr = new Date().toISOString().slice(0, 10)
      const bundle = {
        generated_at: new Date().toISOString(),
        tenant: 'Carta d.o.o.',
        summary: {
          djelatnici: data.workers.length,
          osposobljavanja: data.trainings.length,
          zdravstveni_pregledi: data.healthChecks.length,
          radna_oprema: data.equipment.length,
          ozljede: data.incidents.length,
          radna_mjesta: data.workPositions.length,
        },
        ...data,
      }

      // Download JSON
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inspekcijska_mapa_${dateStr}.json`
      a.click()
      URL.revokeObjectURL(url)

      // Download CSV-ove
      for (const file of files) {
        if (!file.content) continue
        const csvBlob = new Blob(['\uFEFF' + file.content], { type: 'text/csv;charset=utf-8;' })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvA = document.createElement('a')
        csvA.href = csvUrl
        csvA.download = `inspekcijska_mapa_${dateStr}_${file.name}`
        csvA.click()
        URL.revokeObjectURL(csvUrl)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return { exportZip, isExporting }
}
