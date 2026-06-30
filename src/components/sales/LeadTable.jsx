import { supabase } from '../../lib/supabaseClient'

const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export default function LeadTable({ leads, loading, onChanged }) {
  const updateStage = async (id, stage) => {
    await supabase.from('sales_leads').update({ stage }).eq('id', id)
    onChanged()
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading pipeline…</p>
  if (leads.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No leads yet. Add your first one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm text-ink font-medium">{lead.customers?.name ?? 'Unnamed prospect'}</p>
            <p className="text-xs text-ink-muted">
              {lead.lead_source || 'No source'}
              {lead.estimated_value ? ` · ~${Number(lead.estimated_value).toLocaleString()}` : ''}
            </p>
          </div>
          <select
            value={lead.stage}
            onChange={(e) => updateStage(lead.id, e.target.value)}
            className="text-xs rounded-md border border-border bg-bg px-2 py-1.5 text-ink capitalize"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}