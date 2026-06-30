export default function CustomerTable({ customers, loading, onEdit }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading customers…</p>
  if (customers.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No customers yet. Add your first one above.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Country</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 text-ink font-medium">{c.name}</td>
              <td className="px-5 py-3 text-ink-muted capitalize">{c.customer_type}</td>
              <td className="px-5 py-3 text-ink-muted">{c.country || '—'}</td>
              <td className="px-5 py-3 text-ink-muted">
                {c.contact_person && <p>{c.contact_person}</p>}
                {c.email && <p className="text-xs">{c.email}</p>}
              </td>
              <td className="px-5 py-3 text-right">
                <button onClick={() => onEdit(c)} className="text-xs text-primary font-medium hover:underline">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}