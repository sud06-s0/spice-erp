export default function ServiceLogTable({ logs, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading service logs…</p>
  if (logs.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No maintenance services logged yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {logs.map((log) => (
        <div key={log.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink font-medium">{log.maintenance_equipment?.name}</p>
            <span className="text-xs text-ink-muted">{new Date(log.performed_at).toLocaleDateString()}</span>
          </div>
          {log.work_done && <p className="text-xs text-ink-muted mt-1">{log.work_done}</p>}
          <p className="text-xs text-ink-muted mt-0.5">
            {log.cost != null && `Cost: ${Number(log.cost).toLocaleString()}`}
            {log.downtime_minutes != null && ` · Downtime: ${log.downtime_minutes} min`}
          </p>
        </div>
      ))}
    </div>
  )
}