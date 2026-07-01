import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'
import { apiClient } from '../../lib/apiClient'

const incoterms = ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA']
const emptyLine = () => ({ finished_product_id: '', qty: '', unit_price: '' })

export default function ExportOrderFormModal({ customers, finishedProducts, onClose, onCreated, onCustomerAdded }) {
  const [customerId, setCustomerId] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerCountry, setNewCustomerCountry] = useState('')
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [addCustomerError, setAddCustomerError] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [incoterm, setIncoterm] = useState('FOB')
  const [currency, setCurrency] = useState('USD')
  const [lines, setLines] = useState([emptyLine()])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateLine = (i, field, value) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i))

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unit_price) || 0), 0)

  // Direct Supabase insert — works once the export role has insert permission
  // on customers (see 08b_export_customer_policy.sql run in Supabase).
  const handleAddCustomer = async () => {
    setAddCustomerError('')
    if (!newCustomerName.trim()) {
      setAddCustomerError('Enter a customer name first')
      return
    }
    setAddingCustomer(true)
    const { data, error: insertError } = await supabase
      .from('customers')
      .insert({
        name: newCustomerName.trim(),
        customer_type: 'export',
        country: newCustomerCountry.trim() || null,
      })
      .select()
      .single()
    setAddingCustomer(false)
    if (insertError) {
      setAddCustomerError(insertError.message)
      return
    }
    setNewCustomerName('')
    setNewCustomerCountry('')
    onCustomerAdded(data)
    setCustomerId(data.id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!customerId) { setError('Select a customer'); return }
    if (!destinationCountry) { setError('Destination country is required'); return }
    const validLines = lines.filter((l) => l.finished_product_id && l.qty && l.unit_price)
    if (validLines.length === 0) { setError('Add at least one complete line item'); return }

    setSubmitting(true)
    try {
      await apiClient.post('/api/export/orders', {
        customer_id: customerId,
        destination_country: destinationCountry,
        destination_port: destinationPort || null,
        incoterm,
        currency,
        items: validLines.map((l) => ({
          finished_product_id: l.finished_product_id,
          qty: Number(l.qty),
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
    <Modal title="Create Export Order" onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Customer *
          </label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="mt-2 bg-warning-tint border border-border rounded-md px-3 py-2">
            <p className="text-xs text-ink-muted mb-1.5">Add new customer</p>
            <div className="flex items-center gap-2">
              <input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer name"
                className="flex-1 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink"
              />
              <input
                value={newCustomerCountry}
                onChange={(e) => setNewCustomerCountry(e.target.value)}
                placeholder="Country"
                className="w-28 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink"
              />
              <button
                type="button"
                onClick={handleAddCustomer}
                disabled={addingCustomer}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60 whitespace-nowrap"
              >
                {addingCustomer ? 'Adding…' : 'Add customer'}
              </button>
            </div>
            {addCustomerError && <p className="text-xs text-danger mt-1">{addCustomerError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Destination Country *
            </label>
            <input
              required
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Destination Port
            </label>
            <input
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Incoterm</label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {incoterms.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">Line Items</label>
            <button type="button" onClick={addLine}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={line.finished_product_id}
                  onChange={(e) => updateLine(i, 'finished_product_id', e.target.value)}
                  className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                >
                  <option value="">Product…</option>
                  {finishedProducts.map((fp) => (
                    <option key={fp.id} value={fp.id}>{fp.name}</option>
                  ))}
                </select>
                <input type="number" min="0" step="0.01" placeholder="Qty"
                  value={line.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)}
                  className="w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink" />
                <input type="number" min="0" step="0.01" placeholder="Price"
                  value={line.unit_price} onChange={(e) => updateLine(i, 'unit_price', e.target.value)}
                  className="w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink" />
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-ink-muted hover:text-danger p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-ink-muted">Total ({currency})</span>
          <span className="font-display text-xl text-ink">{total.toLocaleString()}</span>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-surface-muted">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create Export Order'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ExportOrderFormModal({ customers, finishedProducts, onClose, onCreated, onCustomerAdded }) {
  const [customerId, setCustomerId] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerCountry, setNewCustomerCountry] = useState('')
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [destinationCountry, setDestinationCountry] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [incoterm, setIncoterm] = useState('FOB')
  const [currency, setCurrency] = useState('USD')
  const [lines, setLines] = useState([emptyLine()])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateLine = (i, field, value) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i))

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unit_price) || 0), 0)

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return
    setAddingCustomer(true)
    try {
      const customer = await apiClient.post('/api/export/quick-customer', {
        name: newCustomerName.trim(),
        country: newCustomerCountry || null,
      })
      setNewCustomerName('')
      setNewCustomerCountry('')
      onCustomerAdded(customer)
      setCustomerId(customer.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingCustomer(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!customerId) {
      setError('Select a customer')
      return
    }
    if (!destinationCountry) {
      setError('Destination country is required')
      return
    }
    const validLines = lines.filter((l) => l.finished_product_id && l.qty && l.unit_price)
    if (validLines.length === 0) {
      setError('Add at least one complete line item')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post('/api/export/orders', {
        customer_id: customerId,
        destination_country: destinationCountry,
        destination_port: destinationPort || null,
        incoterm,
        currency,
        items: validLines.map((l) => ({
          finished_product_id: l.finished_product_id,
          qty: Number(l.qty),
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
    <Modal title="Create Export Order" onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Customer *
          </label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 mt-2 bg-warning-tint border border-border rounded-md px-3 py-2">
            <input
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="New customer name"
              className="flex-1 bg-transparent text-sm text-ink focus:outline-none"
            />
            <input
              value={newCustomerCountry}
              onChange={(e) => setNewCustomerCountry(e.target.value)}
              placeholder="Country"
              className="w-28 bg-transparent text-sm text-ink focus:outline-none border-l border-border pl-2"
            />
            <button
              type="button"
              onClick={handleAddCustomer}
              disabled={addingCustomer}
              className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
            >
              {addingCustomer ? 'Adding…' : 'Add customer'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Destination Country *
            </label>
            <input
              required
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Destination Port
            </label>
            <input
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Incoterm
            </label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {incoterms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Currency
            </label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
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
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={line.finished_product_id}
                  onChange={(e) => updateLine(i, 'finished_product_id', e.target.value)}
                  className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                >
                  <option value="">Product…</option>
                  {finishedProducts.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Qty"
                  value={line.qty}
                  onChange={(e) => updateLine(i, 'qty', e.target.value)}
                  className="w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={line.unit_price}
                  onChange={(e) => updateLine(i, 'unit_price', e.target.value)}
                  className="w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="text-ink-muted hover:text-danger p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-ink-muted">Total ({currency})</span>
          <span className="font-display text-xl text-ink">{total.toLocaleString()}</span>
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
            {submitting ? 'Creating…' : 'Create Export Order'}
          </button>
        </div>
      </form>
    </Modal>
  )
}