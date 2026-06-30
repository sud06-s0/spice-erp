import StatusBadge from '../StatusBadge'

export default function ScheduleTable({ schedules, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading schedules…</p>
  if (schedules.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No maintenance schedules set up yet.</p>
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="divide-y divide-border">
      {schedules.map((s) => {
        const overdue = s.next_due_date && s.next_due_date < today
        return (
          <div key={s.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink font-medium">{s.maintenance_equipment?.name}</p>
              <p className="text-xs text-ink-muted capitalize">
                {s.maintenance_type} · every {s.frequency_days} days
              </p>
            </div>
            <StatusBadge tone={overdue ? 'danger' : 'neutral'}>
              {s.next_due_date ? `due ${s.next_due_date}` : 'not scheduled'}
            </StatusBadge>
          </div>
        )
      })}
    </div>
  )
}