import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'

const toneForStatus = (status) => (status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning')

export default function LeaveTable({ leaves, loading, onChanged }) {
  const [busyId, setBusyId] = useState(null)

  const setStatus = async (id, status) => {
    setBusyId(id)
    await supabase.from('hr_leave_requests').update({ status }).eq('id', id)
    setBusyId(null)
    onChanged()
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading leave requests…</p>
  if (leaves.length === 0) return <p className="px-5 py-6 text-sm text-ink-muted">No leave requests yet.</p>

  return (
    <div className="divide-y divide-border">
      {leaves.map((leave) => (
        <div key={leave.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{leave.hr_employees?.full_name}</p>
            <p className="text-xs text-ink-muted capitalize">
              {leave.leave_type} leave · {leave.start_date} to {leave.end_date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={toneForStatus(leave.status)}>{leave.status}</StatusBadge>
            {leave.status === 'pending' && (
              <>
                <button
                  disabled={busyId === leave.id}
                  onClick={() => setStatus(leave.id, 'approved')}
                  className="text-xs text-success font-medium hover:underline"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === leave.id}
                  onClick={() => setStatus(leave.id, 'rejected')}
                  className="text-xs text-danger font-medium hover:underline"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}