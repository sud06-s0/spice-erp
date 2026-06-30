import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

const categories = ['Food Safety', 'Regulatory', 'Supply Chain', 'Financial']

export default function RiskFormModal({ onClose, onCreated }) {
  const [riskDescription, setRiskDescription] = useState('')
  const [category, setCategory] = useState('Food Safety')
  const [likelihood, setLikelihood] = useState('3')
  const [impact, setImpact] = useState('3')
  const [mitigationPlan, setMitigationPlan] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: insertError } = await supabase.from('compliance_risk_register').insert({
      risk_description: riskDescription,
      category,
      likelihood: Number(likelihood),
      impact: Number(impact),
      mitigation_plan: mitigationPlan || null,
      status: 'open',
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
    <Modal title="Add Risk" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Risk Description *
          </label>
          <textarea
            required
            value={riskDescription}
            onChange={(e) => setRiskDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Likelihood (1–5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={likelihood}
              onChange={(e) => setLikelihood(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Impact (1–5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Mitigation Plan
          </label>
          <textarea
            value={mitigationPlan}
            onChange={(e) => setMitigationPlan(e.target.value)}
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
            {submitting ? 'Saving…' : 'Add Risk'}
          </button>
        </div>
      </form>
    </Modal>
  )
}