import { useState } from 'react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

export default function PrepareDispatchModal({ lots, productLookup, onClose, onCreated }) {
  const [selections, setSelections] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const items = Object.entries(selections)
      .filter(([, qty]) => qty && Number(qty) > 0)
      .map(([stock_id, qty]) => ({ stock_id, qty: Number(qty) }))

    if (items.length === 0) {
      setError('Enter a quantity for at least one item')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post('/api/warehouse/dispatch', { items })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Prepare Dispatch" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {lots.length === 0 ? (
          <p className="text-sm text-ink-muted">No finished goods in stock to dispatch yet.</p>
        ) : (
          <div className="space-y-2">
            {lots.map((lot) => (
              <div key={lot.id} className="flex items-center gap-3 bg-surface-muted rounded-md px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm text-ink">{productLookup[lot.item_id] ?? 'Unknown product'}</p>
                  <p className="text-xs text-ink-muted font-mono">
                    {lot.batch_no || 'No batch ref'} · {lot.qty} {lot.unit} available
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={lot.qty}
                  step="0.01"
                  placeholder="Qty"
                  value={selections[lot.id] ?? ''}
                  onChange={(e) => setSelections((prev) => ({ ...prev, [lot.id]: e.target.value }))}
                  className="w-24 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink"
                />
              </div>
            ))}
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
            disabled={submitting || lots.length === 0}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Preparing…' : 'Prepare Dispatch'}
          </button>
        </div>
      </form>
    </Modal>
  )
}