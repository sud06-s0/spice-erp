import { useState } from 'react'
import StatusBadge from '../StatusBadge'
import { supabase } from '../../lib/supabaseClient'
import { apiClient } from '../../lib/apiClient'

const toneForStatus = (status) => {
  if (status === 'accepted') return 'success'
  if (status === 'rejected' || status === 'expired') return 'danger'
  if (status === 'sent') return 'warning'
  return 'neutral'
}

export default function QuotationTable({ quotations, loading, onRefresh }) {
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  // Status changes here are single-table updates — sales already owns full
  // RLS access to sales_quotations, no API needed for these.
  const setStatus = async (id, status) => {
    setBusyId(id)
    await supabase.from('sales_quotations').update({ status }).eq('id', id)
    setBusyId(null)
    onRefresh()
  }

  const convertToOrder = async (id) => {
    setBusyId(id)
    setError('')
    try {
      await apiClient.post('/api/sales/orders', { quotation_id: id })
      onRefresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading quotations…</p>
  if (quotations.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No quotations yet. Create your first one above.</p>
  }

  return (
    <div className="divide-y divide-border">
      {error && <p className="px-5 py-3 text-sm text-danger">{error}</p>}
      {quotations.map((q) => {
        const total = q.sales_quotation_items?.reduce((sum, i) => sum + Number(i.amount), 0) ?? 0
        return (
          <div key={q.id} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-ink">{q.quotation_no}</p>
              <p className="text-xs text-ink-muted">
                {q.customers?.name} · {q.currency} {total.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={toneForStatus(q.status)}>{q.status}</StatusBadge>
              {q.status === 'draft' && (
                <button
                  disabled={busyId === q.id}
                  onClick={() => setStatus(q.id, 'sent')}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Mark Sent
                </button>
              )}
              {q.status === 'sent' && (
                <>
                  <button
                    disabled={busyId === q.id}
                    onClick={() => setStatus(q.id, 'accepted')}
                    className="text-xs text-success font-medium hover:underline"
                  >
                    Accept
                  </button>
                  <button
                    disabled={busyId === q.id}
                    onClick={() => setStatus(q.id, 'rejected')}
                    className="text-xs text-danger font-medium hover:underline"
                  >
                    Reject
                  </button>
                </>
              )}
              {q.status === 'accepted' && (
                <button
                  disabled={busyId === q.id}
                  onClick={() => convertToOrder(q.id)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  {busyId === q.id ? 'Converting…' : 'Convert to Order'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}