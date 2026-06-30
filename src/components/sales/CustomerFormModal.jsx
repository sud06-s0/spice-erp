import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

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

export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEdit = Boolean(customer?.id)
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    customer_type: customer?.customer_type ?? 'export',
    country: customer?.country ?? '',
    address: customer?.address ?? '',
    contact_person: customer?.contact_person ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    tax_id: customer?.tax_id ?? '',
    credit_limit: customer?.credit_limit ?? '',
    payment_terms: customer?.payment_terms ?? '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = { ...form, credit_limit: form.credit_limit ? Number(form.credit_limit) : null }

    const { error: saveError } = isEdit
      ? await supabase.from('customers').update(payload).eq('id', customer.id)
      : await supabase.from('customers').insert(payload)

    setSubmitting(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    onSaved()
    onClose()
  }

  return (
    <Modal title={isEdit ? 'Edit Customer' : 'Add Customer'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required value={form.name} onChange={update('name')} />
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Type</label>
            <select
              value={form.customer_type}
              onChange={update('customer_type')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="export">Export</option>
              <option value="domestic">Domestic</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" value={form.country} onChange={update('country')} />
          <Field label="Tax ID / GST" value={form.tax_id} onChange={update('tax_id')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Person" value={form.contact_person} onChange={update('contact_person')} />
          <Field label="Phone" value={form.phone} onChange={update('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" type="email" value={form.email} onChange={update('email')} />
          <Field label="Payment Terms" value={form.payment_terms} onChange={update('payment_terms')} placeholder="e.g. Net 30" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Credit Limit" type="number" value={form.credit_limit} onChange={update('credit_limit')} />
          <Field label="Address" value={form.address} onChange={update('address')} />
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
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}