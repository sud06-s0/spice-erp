export default function PerformanceTable({ reviews, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading reviews…</p>
  if (reviews.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No performance reviews logged yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {reviews.map((r) => (
        <div key={r.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-medium">{r.hr_employees?.full_name}</p>
              <p className="text-xs text-ink-muted">{r.review_period}</p>
            </div>
            {r.score != null && <span className="font-display text-lg text-ink">{r.score}/10</span>}
          </div>
          {r.strengths && <p className="text-xs text-ink-muted mt-1.5">+ {r.strengths}</p>}
          {r.areas_to_improve && <p className="text-xs text-ink-muted mt-0.5">→ {r.areas_to_improve}</p>}
        </div>
      ))}
    </div>
  )
}