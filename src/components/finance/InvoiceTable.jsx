import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => {
  if (status === 'paid') return 'success'
  if (status === 'overdue' || status === 'cancelled') return 'danger'
  if (status === 'sent') return 'warning'
  return 'neutral'
}

export default function InvoiceTable({ invoices, loading, onRecordPayment }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading invoices…</p>
  if (invoices.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No invoices yet. Create one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {invoices.map((inv) => {
        const balance = Number(inv.total_amount) - Number(inv.paid_amount ?? 0)
        return (
          <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-ink">{inv.invoice_no}</p>
              <p className="text-xs text-ink-muted">{inv.customers?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink">
                {inv.currency} {Number(inv.total_amount).toLocaleString()}
                {balance > 0 && inv.status !== 'paid' && (
                  <span className="text-ink-muted"> · {balance.toLocaleString()} due</span>
                )}
              </span>
              <StatusBadge tone={toneForStatus(inv.status)}>{inv.status}</StatusBadge>
              {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                <button
                  onClick={() => onRecordPayment(inv)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}