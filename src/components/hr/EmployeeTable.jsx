import StatusBadge from '../StatusBadge'

export default function EmployeeTable({ employees, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading employees…</p>
  if (employees.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No employees yet. Add your first one above.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Code</th>
            <th className="px-5 py-3 font-medium">Department</th>
            <th className="px-5 py-3 font-medium">Designation</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((e) => (
            <tr key={e.id}>
              <td className="px-5 py-3 text-ink font-medium">{e.full_name}</td>
              <td className="px-5 py-3 text-ink-muted font-mono">{e.employee_code}</td>
              <td className="px-5 py-3 text-ink-muted">{e.department}</td>
              <td className="px-5 py-3 text-ink-muted">{e.designation || '—'}</td>
              <td className="px-5 py-3 text-ink-muted capitalize">{e.employment_type?.replace('_', ' ')}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={e.status === 'active' ? 'success' : 'neutral'}>{e.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}