import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'
import { apiClient } from '../../lib/apiClient'

export default function CompleteBatchModal({ batch, finishedProducts, onClose, onCompleted, onFinishedProductAdded }) {
  const [finishedProductId, setFinishedProductId] = useState('')
  const [outputQty, setOutputQty] = useState('')
  const [newFPName, setNewFPName] = useState('')
  const [newFPSku, setNewFPSku] = useState('')
  const [addingFP, setAddingFP] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const loss = outputQty !== '' ? Number(batch.input_qty) - Number(outputQty) : null

  // finished_products doesn't have a screen of its own yet — this keeps the
  // batch-completion flow usable without blocking on that being built first.
  const handleAddFinishedProduct = async () => {
    if (!newFPName.trim()) return
    setAddingFP(true)
    const sku = newFPSku.trim() || `SKU-${Date.now()}`
    const { data, error: insertError } = await supabase
      .from('finished_products')
      .insert({ name: newFPName.trim(), sku, commodity_id: batch.commodity_id })
      .select()
      .single()
    setAddingFP(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewFPName('')
    setNewFPSku('')
    onFinishedProductAdded(data)
    setFinishedProductId(data.id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!finishedProductId || !outputQty) {
      setError('Fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      const data = await apiClient.post(`/api/production/batches/${batch.id}/complete`, {
        finished_product_id: finishedProductId,
        output_qty: Number(outputQty),
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const finish = () => {
      onCompleted()
      onClose()
    }
    return (
      <Modal title="Batch Completed" onClose={finish}>
        <div className="text-center py-4">
          <p className="font-display text-2xl text-success">{result.efficiency_pct.toFixed(1)}% yield</p>
          <p className="text-sm text-ink-muted mt-2">{result.output_qty} kg added to finished goods inventory.</p>
          <button
            onClick={finish}
            className="mt-5 px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover"
          >
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`Complete ${batch.batch_no}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-muted">
          Input: {batch.input_qty} kg of {batch.procurement_commodities?.name}
        </p>

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
            <option value="">Select finished product…</option>
            {finishedProducts.map((fp) => (
              <option key={fp.id} value={fp.id}>
                {fp.name}
              </option>
            ))}
          </select>

          {finishedProducts.length === 0 && (
            <div className="flex items-center gap-2 mt-2 bg-warning-tint border border-border rounded-md px-3 py-2">
              <input
                value={newFPName}
                onChange={(e) => setNewFPName(e.target.value)}
                placeholder="No finished products yet — name (e.g. Premium Pepper 1kg Pouch)"
                className="flex-1 bg-transparent text-sm text-ink focus:outline-none"
              />
              <input
                value={newFPSku}
                onChange={(e) => setNewFPSku(e.target.value)}
                placeholder="SKU (optional)"
                className="w-28 bg-transparent text-sm text-ink focus:outline-none border-l border-border pl-2"
              />
              <button
                type="button"
                onClick={handleAddFinishedProduct}
                disabled={addingFP}
                className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
              >
                {addingFP ? 'Adding…' : 'Add'}
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Output Quantity (kg) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={outputQty}
            onChange={(e) => setOutputQty(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
          {loss !== null && (
            <p className="text-xs text-ink-muted mt-1.5">
              {loss >= 0
                ? `${loss.toFixed(2)} kg loss/wastage`
                : `${Math.abs(loss).toFixed(2)} kg more than input — double check that number`}
            </p>
          )}
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
            {submitting ? 'Completing…' : 'Complete Batch'}
          </button>
        </div>
      </form>
    </Modal>
  )
}