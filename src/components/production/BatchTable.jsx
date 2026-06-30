import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'on_hold') return 'warning'
  return 'neutral' // planned, in_progress
}

export default function BatchTable({ batches, loading, onComplete }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading batches…</p>
  if (batches.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No production batches yet. Start your first one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {batches.map((b) => (
        <div key={b.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-mono text-ink">{b.batch_no}</p>
            <p className="text-xs text-ink-muted">
              {b.procurement_commodities?.name} · {b.input_qty} kg in
              {b.output_qty != null && ` → ${b.output_qty} kg out`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge tone={toneForStatus(b.status)}>{b.status.replace('_', ' ')}</StatusBadge>
            {b.status === 'in_progress' && (
              <button onClick={() => onComplete(b)} className="text-sm text-primary font-medium hover:underline">
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}