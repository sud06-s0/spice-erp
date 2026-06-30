import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => {
  if (status === 'active') return 'success'
  if (status === 'pending') return 'warning'
  return 'danger' // suspended, blacklisted
}

export default function SupplierTable({ suppliers, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading suppliers…</p>
  if (suppliers.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No suppliers yet. Add your first one above.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Region</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-3">
                <p className="text-ink font-medium">{s.name}</p>
                {s.code && <p className="text-xs text-ink-muted font-mono">{s.code}</p>}
              </td>
              <td className="px-5 py-3 text-ink-muted capitalize">{s.supplier_type}</td>
              <td className="px-5 py-3 text-ink-muted">{s.region || '—'}</td>
              <td className="px-5 py-3 text-ink-muted">
                {s.contact_person && <p>{s.contact_person}</p>}
                {s.phone && <p className="text-xs">{s.phone}</p>}
              </td>
              <td className="px-5 py-3">
                <StatusBadge tone={toneForStatus(s.status)}>{s.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}