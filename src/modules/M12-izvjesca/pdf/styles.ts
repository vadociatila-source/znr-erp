// Zajednički PDF stilovi za sve ZNR obrasce
import { StyleSheet } from '@react-pdf/renderer'

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#555',
    marginBottom: 2,
  },
  legalRef: {
    fontSize: 8,
    textAlign: 'center',
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    backgroundColor: '#f1f5f9',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e2e8f0',
    paddingVertical: 3,
  },
  label: {
    width: '40%',
    fontSize: 9,
    color: '#64748b',
  },
  value: {
    width: '60%',
    fontSize: 10,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottom: '1pt solid #cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e2e8f0',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: '#94a3b8',
    borderTop: '0.5pt solid #e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    marginTop: 40,
    borderTop: '1pt solid #333',
    width: 200,
    paddingTop: 4,
    fontSize: 9,
    color: '#555',
  },
})

export function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('hr-HR')
}

export function formatDateTime(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('hr-HR', { dateStyle: 'short', timeStyle: 'short' })
}
