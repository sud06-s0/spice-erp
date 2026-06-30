import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'

const toneForStatus = (status) => {
  if (status === 'accepted') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'partially_accepted') return 'warning'
  return 'neutral' // pending_inspection, inspected
}

// Rejecting a quantity is a single-table insert (receiving_rejections) —
// no Node API needed, RLS on the 'receiving' role covers it.
function RejectItemForm({ grnItem, onRejected }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!qty || !reason) {
      setError('Quantity and reason are required')
      return
    }
    setSubmitting(true)
    const { error: insertError } = await supabase.from('receiving_rejections').insert({
      grn_item_id: grnItem.id,
      rejected_qty: Number(qty),
      rejection_reason: reason,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setOpen(false)
    setQty('')
    setReason('')
    onRejected()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-danger hover:underline">
        Reject some quantity
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1.5 flex-wrap">
      <input
        type="number"
        min="0"
        max={grnItem.qty_received}
        step="0.01"
        placeholder="Qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-xs text-ink"
      />
      <input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="flex-1 min-w-[140px] rounded-md border border-border bg-bg px-2 py-1 text-xs text-ink"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
      >
        {submitting ? 'Saving…' : 'Confirm'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-muted hover:underline">
        Cancel
      </button>
      {error && <span className="text-xs text-danger w-full">{error}</span>}
    </form>
  )
}

export default function GRNTable({ grns, loading, onRefresh }) {
  const [expanded, setExpanded] = useState(null)

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading receipts…</p>
  if (grns.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No material received yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {grns.map((grn) => {
        const isOpen = expanded === grn.id
        return (
          <div key={grn.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : grn.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown size={15} className="text-ink-muted" />
                ) : (
                  <ChevronRight size={15} className="text-ink-muted" />
                )}
                <div>
                  <p className="text-sm font-mono text-ink">{grn.grn_no}</p>
                  <p className="text-xs text-ink-muted">
                    {grn.procurement_suppliers?.name} · PO {grn.procurement_purchase_orders?.po_no}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-ink-muted">{grn.net_weight ? `${grn.net_weight} kg net` : '—'}</span>
                <StatusBadge tone={toneForStatus(grn.status)}>{grn.status.replace('_', ' ')}</StatusBadge>
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pl-10 space-y-2">
                {grn.receiving_grn_items?.map((item) => (
                  <div key={item.id} className="bg-surface-muted rounded-md px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink">{item.procurement_commodities?.name}</span>
                      <span className="text-sm text-ink-muted">
                        {item.qty_received} {item.unit}
                      </span>
                    </div>
                    <RejectItemForm grnItem={item} onRejected={onRefresh} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}