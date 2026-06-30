import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'

const statuses = [
  ['present', 'Present'],
  ['absent', 'Absent'],
  ['half_day', 'Half Day'],
  ['on_leave', 'On Leave'],
]

export default function AttendanceMarker({ employees }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('hr_attendance').select('*').eq('attendance_date', date)
    const byEmployee = {}
    ;(data ?? []).forEach((row) => {
      byEmployee[row.employee_id] = row
    })
    setAttendance(byEmployee)
    setLoading(false)
  }, [date])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  // Single-table upsert per click — hr_attendance has a unique constraint on
  // (employee_id, attendance_date), so this is either an insert or an update,
  // never both, no API needed.
  const markStatus = async (employeeId, status) => {
    setSavingId(employeeId)
    const existing = attendance[employeeId]
    if (existing) {
      await supabase.from('hr_attendance').update({ status }).eq('id', existing.id)
    } else {
      await supabase.from('hr_attendance').insert({ employee_id: employeeId, attendance_date: date, status })
    }
    await loadAttendance()
    setSavingId(null)
  }

  return (
    <div>
      <div className="px-5 py-3 border-b border-border">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5 block">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-ink"
        />
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-ink-muted">Loading attendance…</p>
      ) : employees.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-muted">No active employees to mark attendance for.</p>
      ) : (
        <div className="divide-y divide-border">
          {employees.map((emp) => {
            const current = attendance[emp.id]?.status
            return (
              <div key={emp.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-ink font-medium">{emp.full_name}</p>
                  <p className="text-xs text-ink-muted">{emp.department}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {statuses.map(([key, label]) => (
                    <button
                      key={key}
                      disabled={savingId === emp.id}
                      onClick={() => markStatus(emp.id, key)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                        current === key
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-ink-muted hover:bg-surface-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}