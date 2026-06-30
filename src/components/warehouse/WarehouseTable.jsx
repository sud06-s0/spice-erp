export default function WarehouseTable({ warehouses, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading storage locations…</p>
  if (warehouses.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No storage locations yet. Add your first one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {warehouses.map((w) => (
        <div key={w.id} className="px-5 py-3">
          <p className="text-sm font-medium text-ink">{w.name}</p>
          <p className="text-xs text-ink-muted">
            {[w.location, w.address].filter(Boolean).join(' · ') || 'No location details yet'}
          </p>
        </div>
      ))}
    </div>
  )
}