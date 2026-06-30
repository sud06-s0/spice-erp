import StatusBadge from '../StatusBadge'

export default function PendingInspectionsTable({ grns, loading, onInspect }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading…</p>
  if (grns.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">Nothing waiting on inspection. Clean queue.</p>
  }

  return (
    <div className="divide-y divide-border">
      {grns.map((grn) => (
        <div key={grn.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-mono text-ink">{grn.grn_no}</p>
            <p className="text-xs text-ink-muted">
              {grn.supplierName} · PO {grn.po_no}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge tone="warning">awaiting inspection</StatusBadge>
            <button onClick={() => onInspect(grn)} className="text-sm text-primary font-medium hover:underline">
              Inspect
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}