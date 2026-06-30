import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import EmployeeFormModal from '../components/hr/EmployeeFormModal'
import EmployeeTable from '../components/hr/EmployeeTable'
import AttendanceMarker from '../components/hr/AttendanceMarker'
import LeaveFormModal from '../components/hr/LeaveFormModal'
import LeaveTable from '../components/hr/LeaveTable'
import PerformanceFormModal from '../components/hr/PerformanceFormModal'
import PerformanceTable from '../components/hr/PerformanceTable'

export default function HR() {
  const [tab, setTab] = useState('employees')

  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)

  const [leaves, setLeaves] = useState([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true)
    const { data } = await supabase.from('hr_employees').select('*').order('full_name')
    setEmployees(data ?? [])
    setLoadingEmployees(false)
  }, [])

  const loadLeaves = useCallback(async () => {
    setLoadingLeaves(true)
    const { data } = await supabase
      .from('hr_leave_requests')
      .select('*, hr_employees(full_name)')
      .order('applied_at', { ascending: false })
    setLeaves(data ?? [])
    setLoadingLeaves(false)
  }, [])

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true)
    const { data } = await supabase
      .from('hr_performance_reviews')
      .select('*, hr_employees(full_name)')
      .order('reviewed_at', { ascending: false })
    setReviews(data ?? [])
    setLoadingReviews(false)
  }, [])

  useEffect(() => {
    loadEmployees()
    loadLeaves()
    loadReviews()
  }, [loadEmployees, loadLeaves, loadReviews])

  const activeEmployees = employees.filter((e) => e.status === 'active')

  const tabs = [
    ['employees', 'Employees'],
    ['attendance', 'Attendance'],
    ['leave', 'Leave Requests'],
    ['performance', 'Performance'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Human Resources</h1>
          <p className="text-sm text-ink-muted mt-0.5">Employees, attendance, leave, and performance.</p>
        </div>
        {tab === 'employees' && (
          <button
            onClick={() => setShowEmployeeModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Employee
          </button>
        )}
        {tab === 'leave' && (
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Apply Leave
          </button>
        )}
        {tab === 'performance' && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Review
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="bg-surface border border-border rounded-lg">
        {tab === 'employees' && <EmployeeTable employees={employees} loading={loadingEmployees} />}
        {tab === 'attendance' && <AttendanceMarker employees={activeEmployees} />}
        {tab === 'leave' && <LeaveTable leaves={leaves} loading={loadingLeaves} onChanged={loadLeaves} />}
        {tab === 'performance' && <PerformanceTable reviews={reviews} loading={loadingReviews} />}
      </section>

      {showEmployeeModal && (
        <EmployeeFormModal onClose={() => setShowEmployeeModal(false)} onCreated={loadEmployees} />
      )}
      {showLeaveModal && (
        <LeaveFormModal employees={employees} onClose={() => setShowLeaveModal(false)} onCreated={loadLeaves} />
      )}
      {showReviewModal && (
        <PerformanceFormModal employees={employees} onClose={() => setShowReviewModal(false)} onCreated={loadReviews} />
      )}
    </div>
  )
}