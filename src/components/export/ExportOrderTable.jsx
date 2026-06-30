import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from '../StatusBadge'

const toneForOrderStatus = (status) => {
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'shipped' || status === 'ready_to_ship') return 'warning'
  return 'neutral'
}
const toneForShipmentStatus = (status) => {
  if (status === 'delivered' || status === 'arrived') return 'success'
  if (status === 'in_transit') return 'warning'
  return 'neutral'
}

export default function ExportOrderTable({ orders, loading, onAddShipment, onManageDocuments }) {
  const [expanded, setExpanded] = useState(null)

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading export orders…</p>
  if (orders.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No export orders yet. Create your first one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {orders.map((order) => {
        const isOpen = expanded === order.id
        return (
          <div key={order.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown size={15} className="text-ink-muted" />
                ) : (
                  <ChevronRight size={15} className="text-ink-muted" />
                )}
                <div>
                  <p className="text-sm font-mono text-ink">{order.export_order_no}</p>
                  <p className="text-xs text-ink-muted">
                    {order.customers?.name} · {order.destination_country}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink">
                  {order.currency} {Number(order.total_value).toLocaleString()}
                </span>
                <StatusBadge tone={toneForOrderStatus(order.status)}>{order.status.replace('_', ' ')}</StatusBadge>
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-4 pl-10 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-muted mb-1.5">Items</p>
                  <div className="space-y-1">
                    {order.export_order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink">{item.finished_products?.name}</span>
                        <span className="text-ink-muted">
                          {item.qty} × {item.unit_price} = {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs uppercase tracking-wide text-ink-muted">Shipments</p>
                    <button
                      onClick={() => onAddShipment(order.id)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      + Add Shipment
                    </button>
                  </div>
                  {order.export_shipments?.length === 0 && (
                    <p className="text-xs text-ink-muted">No shipments planned yet.</p>
                  )}
                  <div className="space-y-1.5">
                    {order.export_shipments?.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-surface-muted rounded-md px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-mono text-ink">{s.shipment_no}</p>
                          <p className="text-xs text-ink-muted">{s.vessel_name || 'No vessel set'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge tone={toneForShipmentStatus(s.status)}>{s.status}</StatusBadge>
                          <button
                            onClick={() => onManageDocuments(s.id)}
                            className="text-xs text-primary font-medium hover:underline"
                          >
                            Documents
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}