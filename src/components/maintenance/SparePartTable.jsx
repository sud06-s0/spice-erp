import StatusBadge from '../StatusBadge'

export default function SparePartTable({ spareParts, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading spare parts…</p>
  if (spareParts.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No spare parts tracked yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {spareParts.map((sp) => {
        const low = Number(sp.current_stock) <= Number(sp.reorder_level)
        return (
          <div key={sp.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-medium">{sp.name}</p>
              <p className="text-xs text-ink-muted">{sp.code || 'No code'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink">
                {sp.current_stock} {sp.unit}
              </span>
              {low && <StatusBadge tone="danger">reorder</StatusBadge>}
            </div>
          </div>
        )
      })}
    </div>
  )
}