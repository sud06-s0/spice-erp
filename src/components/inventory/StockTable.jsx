import StatusBadge from '../StatusBadge'

const toneForStockType = (type) => {
  if (type === 'raw_material') return 'success'
  if (type === 'wip') return 'warning'
  return 'neutral' // finished_goods
}

const toneForAge = (days) => {
  if (days == null) return 'neutral'
  if (days > 90) return 'danger'
  if (days > 60) return 'warning'
  return 'success'
}

export default function StockTable({ rows, loading, locationLookup }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading inventory…</p>
  if (rows.length === 0) return <p className="px-5 py-6 text-sm text-ink-muted">No stock on hand yet.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Batch</th>
            <th className="px-5 py-3 font-medium">Qty</th>
            <th className="px-5 py-3 font-medium">Location</th>
            <th className="px-5 py-3 font-medium">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.stock_id}>
              <td className="px-5 py-3 text-ink font-medium">{r.item_name}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={toneForStockType(r.stock_type)}>{r.stock_type.replace('_', ' ')}</StatusBadge>
              </td>
              <td className="px-5 py-3 text-ink-muted font-mono">{r.batch_no || '—'}</td>
              <td className="px-5 py-3 text-ink">{Number(r.qty).toLocaleString()} kg</td>
              <td className="px-5 py-3 text-ink-muted">{locationLookup[r.location_id] || '—'}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={toneForAge(r.age_days)}>{r.age_days != null ? `${r.age_days}d` : '—'}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}