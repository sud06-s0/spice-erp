import StatusBadge from '../StatusBadge'

const toneForResult = (result) => (result === 'pass' ? 'success' : result === 'fail' ? 'danger' : 'warning')

export default function InspectionHistoryTable({ inspections, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading…</p>
  if (inspections.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No inspections recorded yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {inspections.map((insp) => (
        <div key={insp.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-mono">{insp.reference_label}</p>
              <p className="text-xs text-ink-muted">{new Date(insp.inspection_date).toLocaleString()}</p>
            </div>
            <StatusBadge tone={toneForResult(insp.overall_result)}>{insp.overall_result}</StatusBadge>
          </div>
          {insp.remarks && <p className="text-xs text-ink-muted mt-1">{insp.remarks}</p>}
        </div>
      ))}
    </div>
  )
}