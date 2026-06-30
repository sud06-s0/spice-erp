import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const supplierTypes = ['farmer', 'aggregator', 'trader', 'cooperative', 'processor']

function Field({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
        {label}
        {required && ' *'}
      </label>
      <input
        {...props}
        required={required}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

export default function SupplierFormModal({ onClose, onCreated }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    code: '',
    supplier_type: 'aggregator',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    region: '',
    gst_number: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Single-table insert — RLS on procurement_suppliers checks the user
    // has the 'procurement' role (or owner/admin), no Node API needed here.
    const { error: insertError } = await supabase.from('procurement_suppliers').insert({
      ...form,
      code: form.code || null,
      onboarded_by: profile?.id,
      onboarded_at: new Date().toISOString(),
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
    <Modal title="Add Supplier" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required value={form.name} onChange={update('name')} />
          <Field label="Code" value={form.code} onChange={update('code')} placeholder="e.g. SUP-001" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Supplier Type
            </label>
            <select
              value={form.supplier_type}
              onChange={update('supplier_type')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {supplierTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Field label="Region" value={form.region} onChange={update('region')} placeholder="e.g. Idukki, Kerala" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Person" value={form.contact_person} onChange={update('contact_person')} />
          <Field label="Phone" value={form.phone} onChange={update('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" type="email" value={form.email} onChange={update('email')} />
          <Field label="GST Number" value={form.gst_number} onChange={update('gst_number')} />
        </div>
        <Field label="Address" value={form.address} onChange={update('address')} />

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
            {submitting ? 'Saving…' : 'Add Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  )
}