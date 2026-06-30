import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

export default function LeadFormModal({ customers, commodities, onClose, onCreated }) {
  const [customerId, setCustomerId] = useState('')
  const [leadSource, setLeadSource] = useState('')
  const [commodityId, setCommodityId] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: insertError } = await supabase.from('sales_leads').insert({
      customer_id: customerId || null,
      lead_source: leadSource || null,
      commodity_interest: commodityId || null,
      estimated_value: estimatedValue ? Number(estimatedValue) : null,
      expected_close_date: expectedCloseDate || null,
      stage: 'new',
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
    <Modal title="Add Lead" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Customer (optional)
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">New / unnamed prospect</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Lead Source
            </label>
            <input
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              placeholder="e.g. Trade fair, referral"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Commodity Interest
            </label>
            <select
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">—</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Estimated Value
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Expected Close Date
            </label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
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
            {submitting ? 'Saving…' : 'Add Lead'}
          </button>
        </div>
      </form>
    </Modal>
  )
}