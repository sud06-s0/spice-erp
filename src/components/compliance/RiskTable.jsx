import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'

const toneForScore = (score) => {
  if (score >= 15) return 'danger'
  if (score >= 8) return 'warning'
  return 'success'
}
const toneForStatus = (status) => (status === 'closed' ? 'success' : status === 'mitigated' ? 'warning' : 'danger')

export default function RiskTable({ risks, loading, onChanged }) {
  const [busyId, setBusyId] = useState(null)

  const setStatus = async (id, status) => {
    setBusyId(id)
    await supabase.from('compliance_risk_register').update({ status }).eq('id', id)
    setBusyId(null)
    onChanged()
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading risk register…</p>
  if (risks.length === 0) return <p className="px-5 py-6 text-sm text-ink-muted">No risks logged yet.</p>

  return (
    <div className="divide-y divide-border">
      {risks.map((r) => (
        <div key={r.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{r.risk_description}</p>
            <p className="text-xs text-ink-muted">{r.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={toneForScore(r.risk_score)}>score {r.risk_score}</StatusBadge>
            <StatusBadge tone={toneForStatus(r.status)}>{r.status}</StatusBadge>
            {r.status === 'open' && (
              <button
                disabled={busyId === r.id}
                onClick={() => setStatus(r.id, 'mitigated')}
                className="text-xs text-primary font-medium hover:underline"
              >
                Mark Mitigated
              </button>
            )}
            {r.status === 'mitigated' && (
              <button
                disabled={busyId === r.id}
                onClick={() => setStatus(r.id, 'closed')}
                className="text-xs text-primary font-medium hover:underline"
              >
                Close
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}