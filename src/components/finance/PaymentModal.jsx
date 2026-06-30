import { useState } from 'react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

export default function PaymentModal({ invoice, onClose, onRecorded }) {
  const balance = Number(invoice.total_amount) - Number(invoice.paid_amount ?? 0)
  const [amount, setAmount] = useState(balance > 0 ? balance.toString() : '')
  const [method, setMethod] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post(`/api/finance/invoices/${invoice.id}/payments`, {
        amount: Number(amount),
        payment_method: method || null,
        reference_no: referenceNo || null,
      })
      onRecorded()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Record Payment — ${invoice.invoice_no}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-muted">
          Outstanding: {invoice.currency} {balance.toLocaleString()}
        </p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Amount *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Method
            </label>
            <input
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="e.g. Bank transfer"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Reference No.
            </label>
            <input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
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
            {submitting ? 'Recording…' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}