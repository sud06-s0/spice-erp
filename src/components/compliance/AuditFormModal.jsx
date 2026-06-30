import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

const auditTypes = ['internal', 'external', 'customer', 'regulatory']
const severities = ['minor', 'major', 'critical']

export default function AuditFormModal({ onClose, onCreated }) {
  const [auditType, setAuditType] = useState('internal')
  const [auditDate, setAuditDate] = useState('')
  const [auditorName, setAuditorName] = useState('')
  const [scope, setScope] = useState('')
  const [overallResult, setOverallResult] = useState('')
  const [reportUrl, setReportUrl] = useState('')
  const [findings, setFindings] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateFinding = (i, field, value) =>
    setFindings((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)))
  const addFinding = () => setFindings((prev) => [...prev, { finding_description: '', severity: 'minor' }])
  const removeFinding = (i) => setFindings((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!auditDate) {
      setError('Audit date is required')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post('/api/compliance/audits', {
        audit_type: auditType,
        audit_date: auditDate,
        auditor_name: auditorName || null,
        scope: scope || null,
        overall_result: overallResult || null,
        report_url: reportUrl || null,
        findings: findings.filter((f) => f.finding_description),
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
    <Modal title="Log Audit" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Audit Type
            </label>
            <select
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {auditTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Audit Date *
            </label>
            <input
              required
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Auditor Name
            </label>
            <input
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Overall Result
            </label>
            <select
              value={overallResult}
              onChange={(e) => setOverallResult(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">Pending…</option>
              <option value="pass">Pass</option>
              <option value="pass_with_observations">Pass with observations</option>
              <option value="fail">Fail</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Scope</label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">Findings</label>
            <button
              type="button"
              onClick={addFinding}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add finding
            </button>
          </div>
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={f.finding_description}
                  onChange={(e) => updateFinding(i, 'finding_description', e.target.value)}
                  placeholder="Finding description"
                  className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                <select
                  value={f.severity}
                  onChange={(e) => updateFinding(i, 'severity', e.target.value)}
                  className="w-28 rounded-md border border-border bg-bg px-2 py-2 text-sm text-ink"
                >
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => removeFinding(i)} className="text-ink-muted hover:text-danger p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
            {submitting ? 'Saving…' : 'Log Audit'}
          </button>
        </div>
      </form>
    </Modal>
  )
}