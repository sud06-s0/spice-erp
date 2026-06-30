import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

export default function InvoiceFormModal({ onClose, onCreated }) {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [selectedKey, setSelectedKey] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiClient
      .get('/api/finance/uninvoiced-orders')
      .then((data) => setOrders(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingOrders(false))
  }, [])

  const selected = orders.find((o) => `${o.type}:${o.id}` === selectedKey)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selected) {
      setError('Select an order to invoice')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/api/finance/invoices', {
        order_type: selected.type,
        order_id: selected.id,
        due_date: dueDate || null,
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
    <Modal title="Create Invoice" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Order to Invoice *
          </label>
          {loadingOrders ? (
            <p className="text-sm text-ink-muted">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-ink-muted">No confirmed orders awaiting invoicing.</p>
          ) : (
            <select
              required
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">Select order…</option>
              {orders.map((o) => (
                <option key={`${o.type}:${o.id}`} value={`${o.type}:${o.id}`}>
                  {o.label} — {o.customer_name} ({o.type === 'sales_order' ? 'Domestic' : 'Export'})
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
          <div className="bg-surface-muted rounded-md px-3 py-2.5 space-y-1">
            {selected.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink">{item.description}</span>
                <span className="text-ink-muted">
                  {item.qty} × {item.unit_price} = {item.amount}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-medium border-t border-border pt-1.5 mt-1.5">
              <span className="text-ink">Total</span>
              <span className="text-ink">
                {selected.currency} {Number(selected.total).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
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
            disabled={submitting || orders.length === 0}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}