export default function ExpenseTable({ expenses, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading expenses…</p>
  if (expenses.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No expenses logged yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {expenses.map((e) => (
        <div key={e.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{e.category}</p>
            <p className="text-xs text-ink-muted">
              {e.department || 'No department'} · {new Date(e.expense_date).toLocaleDateString()}
            </p>
          </div>
          <span className="text-sm text-ink">{Number(e.amount).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}