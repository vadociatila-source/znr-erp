// Potvrda deaktivacije radnika
// [ZAK: čl. 61 ZZnR] Podaci se trajno čuvaju — samo se status mijenja u 'former'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { LegalBadge } from '@/components/legal/LegalBadge'
import type { WorkerRow } from '../types'

interface Props {
  worker: WorkerRow
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isSubmitting: boolean
}

export function DeactivateWorkerModal({ worker, isOpen, onClose, onConfirm, isSubmitting }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deaktivacija djelatnika"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Odustani
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isSubmitting}>
            Deaktiviraj
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-700">
        Djelatnik <strong>{worker.first_name} {worker.last_name}</strong> će biti označen kao bivši zaposlenik.
      </p>
      <p className="text-sm text-slate-500 mt-2">
        Podaci se trajno čuvaju sukladno zakonu. Nikad se ne brišu iz sustava.
      </p>
      <div className="mt-3">
        <LegalBadge
          article="čl. 61 ZZnR"
          deadline="evidencija trajno"
          penalty="Kazna: 5.000–50.000 EUR za nepostojanje evidencije"
        />
      </div>
    </Modal>
  )
}
