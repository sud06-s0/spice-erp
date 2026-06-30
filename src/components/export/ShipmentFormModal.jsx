import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

export default function ShipmentFormModal({ exportOrderId, onClose, onCreated }) {
  const [shippingLine, setShippingLine] = useState('')
  const [vesselName, setVesselName] = useState('')
  const [etd, setEtd] = useState('')
  const [eta, setEta] = useState('')
  const [containerNo, setContainerNo] = useState('')
  const [sealNo, setSealNo] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const shipment_no = `SHP-${Date.now()}`
    const { data: shipment, error: shipmentError } = await supabase
      .from('export_shipments')
      .insert({
        shipment_no,
        export_order_id: exportOrderId,
        shipping_line: shippingLine || null,
        vessel_name: vesselName || null,
        etd: etd || null,
        eta: eta || null,
        status: 'planned',
      })
      .select()
      .single()

    if (shipmentError) {
      setSubmitting(false)
      setError(shipmentError.message)
      return
    }

    if (containerNo) {
      await supabase.from('export_containers').insert({
        shipment_id: shipment.id,
        container_no: containerNo,
        seal_no: sealNo || null,
      })
    }

    setSubmitting(false)
    onCreated()
    onClose()
  }

  return (
    <Modal title="Add Shipment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Shipping Line
            </label>
            <input
              value={shippingLine}
              onChange={(e) => setShippingLine(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Vessel Name
            </label>
            <input
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">ETD</label>
            <input
              type="date"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">ETA</label>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Container No. (optional)
            </label>
            <input
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Seal No.
            </label>
            <input
              value={sealNo}
              onChange={(e) => setSealNo(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Add Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}