// CSV export za listu radnika
import type { WorkerWithPosition } from '../types'

export function exportWorkersCSV(workers: WorkerWithPosition[]): void {
  const headers = [
    'Ime', 'Prezime', 'OIB', 'Email', 'Telefon',
    'Datum zaposlenja', 'Radno mjesto', 'Odjel', 'Lokacija', 'Status',
  ]

  const rows = workers.map(w => [
    w.first_name,
    w.last_name,
    w.oib ?? '',
    w.email ?? '',
    w.phone ?? '',
    w.employment_date ?? '',
    w.work_position?.name ?? '',
    w.department ?? '',
    w.location ?? '',
    w.status === 'active' ? 'Aktivan' : 'Bivši',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `djelatnici_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
