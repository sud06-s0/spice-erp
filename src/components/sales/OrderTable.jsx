import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => {
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'dispatched' || status === 'in_production') return 'warning'
  return 'neutral'
}

export default function OrderTable({ orders, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading orders…</p>
  if (orders.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No sales orders yet — accept a quotation to create one.</p>
  }

  return (
    <div className="divide-y divide-border">
      {orders.map((o) => (
        <div key={o.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-ink">{o.sales_order_no}</p>
            <p className="text-xs text-ink-muted">{o.customers?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink">{Number(o.total_amount).toLocaleString()}</span>
            <StatusBadge tone={toneForStatus(o.status)}>{o.status.replace('_', ' ')}</StatusBadge>
          </div>
        </div>
      ))}
    </div>
  )
}