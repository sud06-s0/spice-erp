import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { apiClient } from '../../lib/apiClient'

function ResolveForm({ breakdownId, onResolved }) {
  const [open, setOpen] = useState(false)
  const [rootCause, setRootCause] = useState('')
  const [downtimeMinutes, setDowntimeMinutes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await apiClient.post(`/api/maintenance/breakdowns/${breakdownId}/resolve`, {
        root_cause: rootCause || null,
        downtime_minutes: downtimeMinutes ? Number(downtimeMinutes) : null,
      })
      onResolved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-primary font-medium hover:underline">
        Resolve
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1.5 flex-wrap">
      <input
        placeholder="Root cause"
        value={rootCause}
        onChange={(e) => setRootCause(e.target.value)}
        className="flex-1 min-w-[140px] rounded-md border border-border bg-bg px-2 py-1 text-xs text-ink"
      />
      <input
        type="number"
        min="0"
        placeholder="Downtime (min)"
        value={downtimeMinutes}
        onChange={(e) => setDowntimeMinutes(e.target.value)}
        className="w-28 rounded-md border border-border bg-bg px-2 py-1 text-xs text-ink"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
      >
        {submitting ? 'Saving…' : 'Confirm'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-muted hover:underline">
        Cancel
      </button>
      {error && <span className="text-xs text-danger w-full">{error}</span>}
    </form>
  )
}

export default function BreakdownTable({ breakdowns, loading, onRefresh }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading breakdowns…</p>
  if (breakdowns.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No breakdowns reported. Clean record.</p>
  }

  return (
    <div className="divide-y divide-border">
      {breakdowns.map((b) => (
        <div key={b.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-medium">{b.maintenance_equipment?.name}</p>
              <p className="text-xs text-ink-muted">{b.issue_description}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone={b.resolved_at ? 'success' : 'danger'}>
                {b.resolved_at ? 'resolved' : 'open'}
              </StatusBadge>
              {!b.resolved_at && <ResolveForm breakdownId={b.id} onResolved={onRefresh} />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}