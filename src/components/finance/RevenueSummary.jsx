import KPITile from '../KPITile'
import StatusBadge from '../StatusBadge'

const fmt = (n) => Number(n || 0).toLocaleString()

export default function RevenueSummary({ summary, loading }) {
  if (loading) return <p className="text-sm text-ink-muted">Loading revenue summary…</p>
  if (!summary) return null

  const { domestic, export: exportRows, overall } = summary

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          label="Domestic Invoiced"
          value={`₹${fmt(domestic.invoiced_total)}`}
          sublabel={`${domestic.invoice_count} invoice${domestic.invoice_count === 1 ? '' : 's'}`}
          accent="primary"
        />
        <KPITile
          label="Domestic Collected"
          value={`₹${fmt(domestic.collected_total)}`}
          sublabel={`₹${fmt(domestic.outstanding_total)} outstanding`}
          accent="success"
        />
        <KPITile
          label="Total Invoices"
          value={overall.total_invoices}
          sublabel={`${overall.paid_invoices} paid`}
          accent="accent"
        />
        <KPITile
          label="Outstanding"
          value={overall.outstanding_invoices}
          sublabel="Invoices not fully paid"
          accent="danger"
        />
      </div>

      <section className="bg-surface border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg text-ink">Export Revenue by Currency</h2>
        </div>
        {exportRows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted">No export invoices yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {exportRows.map((row) => (
              <div key={row.currency} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium">{row.currency}</p>
                  <p className="text-xs text-ink-muted">{row.invoice_count} invoice(s)</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-ink">
                    Invoiced: {row.currency} {fmt(row.invoiced_total)}
                  </span>
                  <span className="text-ink-muted">Collected: {fmt(row.collected_total)}</span>
                  <StatusBadge tone={row.outstanding_total > 0 ? 'warning' : 'success'}>
                    {fmt(row.outstanding_total)} due
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}