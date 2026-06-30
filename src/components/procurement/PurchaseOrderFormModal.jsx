import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'
import { apiClient } from '../../lib/apiClient'

const emptyLine = () => ({ commodity_id: '', qty_ordered: '', unit_price: '' })

export default function PurchaseOrderFormModal({ suppliers, commodities, onClose, onCreated, onCommodityAdded }) {
  const [supplierId, setSupplierId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [lines, setLines] = useState([emptyLine()])
  const [newCommodityName, setNewCommodityName] = useState('')
  const [addingCommodity, setAddingCommodity] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateLine = (index, field, value) =>
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)))
  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index))

  const total = lines.reduce((sum, l) => sum + (Number(l.qty_ordered) || 0) * (Number(l.unit_price) || 0), 0)

  // Commodities (the spice catalog) aren't seeded yet in a fresh project —
  // this quick-add keeps the PO form usable without a separate screen first.
  const handleAddCommodity = async () => {
    if (!newCommodityName.trim()) return
    setAddingCommodity(true)
    const { data, error: insertError } = await supabase
      .from('procurement_commodities')
      .insert({ name: newCommodityName.trim() })
      .select()
      .single()
    setAddingCommodity(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewCommodityName('')
    onCommodityAdded(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!supplierId) {
      setError('Select a supplier')
      return
    }
    const validLines = lines.filter((l) => l.commodity_id && l.qty_ordered && l.unit_price)
    if (validLines.length === 0) {
      setError('Add at least one complete line item')
      return
    }

    setSubmitting(true)
    try {
      // Goes through the Node API — inserting the PO + its line items
      // together and computing the total is exactly the kind of logic
      // that shouldn't be duplicated in the browser.
      await apiClient.post('/api/procurement/purchase-orders', {
        supplier_id: supplierId,
        expected_delivery_date: expectedDate || null,
        payment_terms: paymentTerms || null,
        items: validLines.map((l) => ({
          commodity_id: l.commodity_id,
          qty_ordered: Number(l.qty_ordered),
          unit_price: Number(l.unit_price),
        })),
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
    <Modal title="Create Purchase Order" onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Supplier *
            </label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Expected Delivery
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Payment Terms
          </label>
          <input
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="e.g. 50% advance, balance on delivery"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">Line Items</label>
            <button
              type="button"
              onClick={addLine}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add line
            </button>
          </div>

          {commodities.length === 0 && (
            <div className="flex items-center gap-2 mb-3 bg-warning-tint border border-border rounded-md px-3 py-2">
              <input
                value={newCommodityName}
                onChange={(e) => setNewCommodityName(e.target.value)}
                placeholder="No commodities yet — type a name (e.g. Black Pepper)"
                className="flex-1 bg-transparent text-sm text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCommodity}
                disabled={addingCommodity}
                className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
              >
                {addingCommodity ? 'Adding…' : 'Add commodity'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={line.commodity_id}
                  onChange={(e) => updateLine(i, 'commodity_id', e.target.value)}
                  className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                >
                  <option value="">Commodity…</option>
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Qty (kg)"
                  value={line.qty_ordered}
                  onChange={(e) => updateLine(i, 'qty_ordered', e.target.value)}
                  className="w-28 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price/kg"
                  value={line.unit_price}
                  onChange={(e) => updateLine(i, 'unit_price', e.target.value)}
                  className="w-28 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="text-ink-muted hover:text-danger p-1"
                    aria-label="Remove line"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-xl text-ink">₹{total.toLocaleString()}</span>
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
            {submitting ? 'Creating…' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </Modal>
  )
}