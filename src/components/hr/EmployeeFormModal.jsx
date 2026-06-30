import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

const employmentTypes = ['permanent', 'contract', 'seasonal', 'daily_wage']

export default function EmployeeFormModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    employee_code: '',
    full_name: '',
    department: '',
    designation: '',
    date_of_joining: '',
    employment_type: 'permanent',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const employee_code = form.employee_code.trim() || `EMP-${Date.now()}`
    const { error: insertError } = await supabase.from('hr_employees').insert({
      ...form,
      employee_code,
      date_of_joining: form.date_of_joining || null,
      status: 'active',
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
    <Modal title="Add Employee" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Full Name *
            </label>
            <input
              required
              value={form.full_name}
              onChange={update('full_name')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Employee Code
            </label>
            <input
              value={form.employee_code}
              onChange={update('employee_code')}
              placeholder="Auto-generated if blank"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Department *
            </label>
            <input
              required
              value={form.department}
              onChange={update('department')}
              placeholder="e.g. Production"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Designation
            </label>
            <input
              value={form.designation}
              onChange={update('designation')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Date of Joining
            </label>
            <input
              type="date"
              value={form.date_of_joining}
              onChange={update('date_of_joining')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Employment Type
            </label>
            <select
              value={form.employment_type}
              onChange={update('employment_type')}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {employmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
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
            {submitting ? 'Saving…' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}