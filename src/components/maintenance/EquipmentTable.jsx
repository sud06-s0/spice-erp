import StatusBadge from '../StatusBadge'

const toneForStatus = (status) => {
  if (status === 'operational') return 'success'
  if (status === 'breakdown') return 'danger'
  if (status === 'under_maintenance') return 'warning'
  return 'neutral' // retired
}

export default function EquipmentTable({ equipment, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading equipment…</p>
  if (equipment.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No equipment added yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {equipment.map((eq) => (
        <div key={eq.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{eq.name}</p>
            <p className="text-xs text-ink-muted">
              {eq.category || 'Uncategorized'}
              {eq.code && ` · ${eq.code}`}
            </p>
          </div>
          <StatusBadge tone={toneForStatus(eq.status)}>{eq.status.replace('_', ' ')}</StatusBadge>
        </div>
      ))}
    </div>
  )
}