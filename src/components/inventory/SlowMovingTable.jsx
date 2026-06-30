import StatusBadge from '../StatusBadge'

export default function SlowMovingTable({ rows, loading, locationLookup }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading…</p>
  if (rows.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-ink-muted">
        Nothing slow-moving right now — everything's turning over.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">Qty</th>
            <th className="px-5 py-3 font-medium">Location</th>
            <th className="px-5 py-3 font-medium">Last Movement</th>
            <th className="px-5 py-3 font-medium">Idle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.stock_id}>
              <td className="px-5 py-3 text-ink font-medium">{r.item_name}</td>
              <td className="px-5 py-3 text-ink">{Number(r.qty).toLocaleString()} kg</td>
              <td className="px-5 py-3 text-ink-muted">{locationLookup[r.location_id] || '—'}</td>
              <td className="px-5 py-3 text-ink-muted">
                {r.last_movement_at ? new Date(r.last_movement_at).toLocaleDateString() : 'Never moved'}
              </td>
              <td className="px-5 py-3">
                <StatusBadge tone="warning">{r.days_since_last_movement}d</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}