import StatusBadge from '../StatusBadge'

export default function ProfitabilityTable({ rows, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading profitability…</p>
  if (rows.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No sales or cost data yet to analyze.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Product</th>
            <th className="px-5 py-3 font-medium">Revenue</th>
            <th className="px-5 py-3 font-medium">Avg Unit Cost</th>
            <th className="px-5 py-3 font-medium">Est. Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.finished_product_id}>
              <td className="px-5 py-3 text-ink font-medium">{r.product_name}</td>
              <td className="px-5 py-3 text-ink-muted">{Number(r.total_revenue).toLocaleString()}</td>
              <td className="px-5 py-3 text-ink-muted">{Number(r.avg_unit_cost).toLocaleString()}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={Number(r.estimated_margin) >= 0 ? 'success' : 'danger'}>
                  {Number(r.estimated_margin).toLocaleString()}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}