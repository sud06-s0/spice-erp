import StatusBadge from '../StatusBadge'

export default function DocumentTable({ documents, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading documents…</p>
  if (documents.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No controlled documents added yet.</p>
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="divide-y divide-border">
      {documents.map((doc) => {
        const overdue = doc.review_due_date && doc.review_due_date < today
        return (
          <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-medium">{doc.title}</p>
              <p className="text-xs text-ink-muted">
                {doc.doc_type} · v{doc.version}
              </p>
            </div>
            {doc.review_due_date && (
              <StatusBadge tone={overdue ? 'danger' : 'neutral'}>
                {overdue ? 'review overdue' : `review by ${doc.review_due_date}`}
              </StatusBadge>
            )}
          </div>
        )
      })}
    </div>
  )
}