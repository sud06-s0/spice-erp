import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from '../StatusBadge'

const toneForResult = (result) => {
  if (result === 'pass') return 'success'
  if (result === 'fail') return 'danger'
  if (result === 'pass_with_observations') return 'warning'
  return 'neutral'
}
const toneForSeverity = (s) => (s === 'critical' ? 'danger' : s === 'major' ? 'warning' : 'neutral')

export default function AuditTable({ audits, loading }) {
  const [expanded, setExpanded] = useState(null)

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading audits…</p>
  if (audits.length === 0) return <p className="px-5 py-6 text-sm text-ink-muted">No audits logged yet.</p>

  return (
    <div className="divide-y divide-border">
      {audits.map((audit) => {
        const isOpen = expanded === audit.id
        return (
          <div key={audit.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : audit.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown size={15} className="text-ink-muted" />
                ) : (
                  <ChevronRight size={15} className="text-ink-muted" />
                )}
                <div>
                  <p className="text-sm text-ink font-medium capitalize">{audit.audit_type} Audit</p>
                  <p className="text-xs text-ink-muted">
                    {audit.audit_date}
                    {audit.auditor_name && ` · ${audit.auditor_name}`}
                  </p>
                </div>
              </div>
              <StatusBadge tone={toneForResult(audit.overall_result)}>
                {audit.overall_result?.replace(/_/g, ' ') || 'pending'}
              </StatusBadge>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pl-10 space-y-2">
                {audit.scope && <p className="text-xs text-ink-muted">{audit.scope}</p>}
                {audit.compliance_audit_findings?.length === 0 && (
                  <p className="text-xs text-ink-muted">No findings recorded.</p>
                )}
                {audit.compliance_audit_findings?.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-surface-muted rounded-md px-3 py-2">
                    <span className="text-sm text-ink">{f.finding_description}</span>
                    <StatusBadge tone={toneForSeverity(f.severity)}>{f.severity}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}