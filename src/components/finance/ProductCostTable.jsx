export default function ProductCostTable({ costs, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading…</p>
  if (costs.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No cost entries logged yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {costs.map((c) => (
        <div key={c.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{c.finished_products?.name}</p>
            <p className="text-xs text-ink-muted">{new Date(c.cost_date).toLocaleDateString()}</p>
          </div>
          <span className="text-sm text-ink">{Number(c.total_cost).toLocaleString()} total</span>
        </div>
      ))}
    </div>
  )
}