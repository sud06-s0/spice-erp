import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => (status === 'dispatched' ? 'success' : status === 'cancelled' ? 'danger' : 'warning')

export default function DispatchTable({ dispatches, loading, onLoad }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading dispatches…</p>
  if (dispatches.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No dispatches yet. Prepare one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {dispatches.map((d) => (
        <div key={d.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-ink">{d.dispatch_no}</p>
              <p className="text-xs text-ink-muted">
                {d.warehouse_dispatch_items.map((i) => `${i.product_name} (${i.qty})`).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge tone={toneForStatus(d.status)}>{d.status}</StatusBadge>
              {d.status === 'pending' && (
                <button onClick={() => onLoad(d)} className="text-sm text-primary font-medium hover:underline">
                  Load &amp; Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}