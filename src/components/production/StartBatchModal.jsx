import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

export default function StartBatchModal({ commodities, onClose, onCreated }) {
  const [commodityId, setCommodityId] = useState('')
  const [lots, setLots] = useState([])
  const [loadingLots, setLoadingLots] = useState(false)
  const [stockId, setStockId] = useState('')
  const [inputQty, setInputQty] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!commodityId) {
      setLots([])
      return
    }
    setLoadingLots(true)
    apiClient
      .get(`/api/production/available-stock?commodity_id=${commodityId}`)
      .then((data) => setLots(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingLots(false))
  }, [commodityId])

  const selectedLot = lots.find((l) => l.id === stockId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!commodityId || !stockId || !inputQty) {
      setError('Fill in all fields')
      return
    }
    if (Number(inputQty) > Number(selectedLot?.qty ?? 0)) {
      setError(`Only ${selectedLot?.qty} kg available in that lot`)
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/api/production/batches', {
        commodity_id: commodityId,
        stock_id: stockId,
        input_qty: Number(inputQty),
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
    <Modal title="Start Production Batch" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Commodity *
          </label>
          <select
            required
            value={commodityId}
            onChange={(e) => {
              setCommodityId(e.target.value)
              setStockId('')
            }}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">Select commodity…</option>
            {commodities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {commodityId && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Raw Material Lot *
            </label>
            {loadingLots ? (
              <p className="text-sm text-ink-muted">Loading available lots…</p>
            ) : lots.length === 0 ? (
              <p className="text-sm text-ink-muted">No raw material in stock for this commodity.</p>
            ) : (
              <select
                required
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
              >
                <option value="">Select lot…</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.batch_no || 'No batch ref'} — {l.qty} {l.unit} available
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {selectedLot && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Input Quantity (kg) *
            </label>
            <input
              type="number"
              min="0"
              max={selectedLot.qty}
              step="0.01"
              required
              value={inputQty}
              onChange={(e) => setInputQty(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
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
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Starting…' : 'Start Batch'}
          </button>
        </div>
      </form>
    </Modal>
  )
}