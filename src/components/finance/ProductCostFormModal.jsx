import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

export default function ProductCostFormModal({ finishedProducts, onClose, onCreated }) {
  const [finishedProductId, setFinishedProductId] = useState('')
  const [rawMaterialCost, setRawMaterialCost] = useState('')
  const [laborCost, setLaborCost] = useState('')
  const [overheadCost, setOverheadCost] = useState('')
  const [packagingCost, setPackagingCost] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: insertError } = await supabase.from('finance_product_costs').insert({
      finished_product_id: finishedProductId,
      raw_material_cost: Number(rawMaterialCost) || 0,
      labor_cost: Number(laborCost) || 0,
      overhead_cost: Number(overheadCost) || 0,
      packaging_cost: Number(packagingCost) || 0,
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
    <Modal title="Log Product Cost" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Finished Product *
          </label>
          <select
            required
            value={finishedProductId}
            onChange={(e) => setFinishedProductId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">Select product…</option>
            {finishedProducts.map((fp) => (
              <option key={fp.id} value={fp.id}>
                {fp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Raw Material Cost
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rawMaterialCost}
              onChange={(e) => setRawMaterialCost(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Labor Cost
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Overhead Cost
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={overheadCost}
              onChange={(e) => setOverheadCost(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Packaging Cost
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={packagingCost}
              onChange={(e) => setPackagingCost(e.target.value)}
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
            {submitting ? 'Saving…' : 'Log Cost'}
          </button>
        </div>
      </form>
    </Modal>
  )
}