import { useState } from 'react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

export default function ReceiveMaterialModal({ pos, onClose, onCreated }) {
  const [poId, setPoId] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [driverName, setDriverName] = useState('')
  const [grossWeight, setGrossWeight] = useState('')
  const [tareWeight, setTareWeight] = useState('')
  const [qtyByItem, setQtyByItem] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedPo = pos.find((p) => p.id === poId)
  const receivableItems = selectedPo?.items.filter((i) => i.remaining > 0) ?? []
  const netWeight = grossWeight !== '' && tareWeight !== '' ? Number(grossWeight) - Number(tareWeight) : null

  const handlePoChange = (id) => {
    setPoId(id)
    const po = pos.find((p) => p.id === id)
    const initial = {}
    po?.items.forEach((i) => {
      if (i.remaining > 0) initial[i.id] = i.remaining
    })
    setQtyByItem(initial)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!poId) {
      setError('Select a purchase order')
      return
    }
    const items = receivableItems
      .map((i) => ({
        po_item_id: i.id,
        commodity_id: i.commodity_id,
        qty_received: Number(qtyByItem[i.id]),
      }))
      .filter((i) => i.qty_received > 0)

    if (items.length === 0) {
      setError('Enter a received quantity for at least one item')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post('/api/receiving/grn', {
        po_id: poId,
        vehicle_no: vehicleNo || null,
        driver_name: driverName || null,
        gross_weight: grossWeight ? Number(grossWeight) : null,
        tare_weight: tareWeight ? Number(tareWeight) : null,
        items,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Receive Material" onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Purchase Order *
          </label>
          <select
            required
            value={poId}
            onChange={(e) => handlePoChange(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">Select a PO awaiting delivery…</option>
            {pos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.po_no} — {p.supplierName}
              </option>
            ))}
          </select>
          {pos.length === 0 && (
            <p className="text-xs text-ink-muted mt-1.5">
              No purchase orders are awaiting delivery. Create or approve one in Procurement first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Vehicle No.
            </label>
            <input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Driver Name
            </label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Gross Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={grossWeight}
              onChange={(e) => setGrossWeight(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Tare Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tareWeight}
              onChange={(e) => setTareWeight(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Net Weight
            </label>
            <div className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-ink-muted">
              {netWeight !== null ? `${netWeight.toLocaleString()} kg` : '—'}
            </div>
          </div>
        </div>

        {receivableItems.length > 0 && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-2">
              Items Received
            </label>
            <div className="space-y-2">
              {receivableItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-surface-muted rounded-md px-3 py-2">
                  <span className="flex-1 text-sm text-ink">{item.commodity_name}</span>
                  <span className="text-xs text-ink-muted whitespace-nowrap">
                    Ordered {item.qty_ordered} kg · Pending {item.remaining} kg
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={item.remaining}
                    step="0.01"
                    value={qtyByItem[item.id] ?? ''}
                    onChange={(e) => setQtyByItem((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-28 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-ink"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
            disabled={submitting || pos.length === 0}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Recording…' : 'Record Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  )
}