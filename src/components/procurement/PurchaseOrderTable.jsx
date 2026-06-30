import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'

const toneForStatus = (status) => {
  if (status === 'received') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'partially_received') return 'warning'
  if (status === 'approved') return 'warning'
  return 'neutral' // draft
}

export default function PurchaseOrderTable({ orders, loading, onRefresh }) {
  const [approvingId, setApprovingId] = useState(null)

  // Approving a PO is a single-table status update — procurement already
  // has full RLS access to its own table, no API call needed. This is
  // what moves a PO out of 'draft' so it becomes eligible for Receiving,
  // which only shows POs with status 'approved' or 'partially_received'.
  const approvePO = async (id) => {
    setApprovingId(id)
    await supabase.from('procurement_purchase_orders').update({ status: 'approved' }).eq('id', id)
    setApprovingId(null)
    onRefresh()
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading purchase orders…</p>
  if (orders.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No purchase orders yet. Create your first one above.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">PO No.</th>
            <th className="px-5 py-3 font-medium">Supplier</th>
            <th className="px-5 py-3 font-medium">Items</th>
            <th className="px-5 py-3 font-medium">Total</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((po) => (
            <tr key={po.id}>
              <td className="px-5 py-3 font-mono text-ink">{po.po_no}</td>
              <td className="px-5 py-3 text-ink-muted">{po.procurement_suppliers?.name ?? '—'}</td>
              <td className="px-5 py-3 text-ink-muted">
                {po.procurement_purchase_order_items?.length ?? po.items?.length ?? 0} line(s)
              </td>
              <td className="px-5 py-3 text-ink">₹{Number(po.total_amount).toLocaleString()}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={toneForStatus(po.status)}>{po.status.replace('_', ' ')}</StatusBadge>
              </td>
              <td className="px-5 py-3 text-right">
                {po.status === 'draft' && (
                  <button
                    onClick={() => approvePO(po.id)}
                    disabled={approvingId === po.id}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {approvingId === po.id ? 'Approving…' : 'Approve'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}