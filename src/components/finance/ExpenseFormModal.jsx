import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

export default function ExpenseFormModal({ onClose, onCreated }) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [department, setDepartment] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: insertError } = await supabase.from('finance_expenses').insert({
      category,
      amount: Number(amount),
      department: department || null,
      notes: notes || null,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <Modal title="Log Expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Category *
            </label>
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Freight, Utilities"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Amount *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Department
          </label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
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
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Log Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}