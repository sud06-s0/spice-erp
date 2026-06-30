import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'

const toneForSeverity = (s) => (s === 'critical' ? 'danger' : s === 'major' ? 'warning' : 'neutral')
const toneForStatus = (s) => (s === 'open' ? 'danger' : s === 'investigating' ? 'warning' : 'success')

// Single-table reads/writes on quality_non_conformances — the 'quality' role
// already has full access via RLS, no API needed here.
export default function NonConformanceTable({ ncs, loading, onRefresh }) {
  const [updating, setUpdating] = useState(null)

  const closeNc = async (id) => {
    setUpdating(id)
    await supabase.from('quality_non_conformances').update({ status: 'closed' }).eq('id', id)
    setUpdating(null)
    onRefresh()
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading…</p>
  if (ncs.length === 0) return <p className="px-5 py-6 text-sm text-ink-muted">No non-conformances. Clean board.</p>

  return (
    <div className="divide-y divide-border">
      {ncs.map((nc) => (
        <div key={nc.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-ink">{nc.nc_no}</p>
            <p className="text-xs text-ink-muted">{nc.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge tone={toneForSeverity(nc.severity)}>{nc.severity}</StatusBadge>
            <StatusBadge tone={toneForStatus(nc.status)}>{nc.status}</StatusBadge>
            {nc.status !== 'closed' && (
              <button
                onClick={() => closeNc(nc.id)}
                disabled={updating === nc.id}
                className="text-xs text-primary font-medium hover:underline"
              >
                {updating === nc.id ? 'Closing…' : 'Close'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}