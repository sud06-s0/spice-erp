import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '../lib/apiClient'
import { supabase } from '../lib/supabaseClient'
import PendingInspectionsTable from '../components/quality/PendingInspectionsTable'
import InspectionHistoryTable from '../components/quality/InspectionHistoryTable'
import NonConformanceTable from '../components/quality/NonConformanceTable'
import InspectionModal from '../components/quality/InspectionModal'

export default function Quality() {
  const [tab, setTab] = useState('pending')

  const [pending, setPending] = useState([])
  const [loadingPending, setLoadingPending] = useState(true)
  const [activeGrn, setActiveGrn] = useState(null)

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const [ncs, setNcs] = useState([])
  const [loadingNcs, setLoadingNcs] = useState(true)

  const [error, setError] = useState('')

  const loadPending = useCallback(async () => {
    setLoadingPending(true)
    setError('')
    try {
      const data = await apiClient.get('/api/quality/pending-inspections')
      setPending(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPending(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await apiClient.get('/api/quality/inspections')
      setHistory(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const loadNcs = useCallback(async () => {
    setLoadingNcs(true)
    const { data } = await supabase.from('quality_non_conformances').select('*').order('raised_at', { ascending: false })
    setNcs(data ?? [])
    setLoadingNcs(false)
  }, [])

  useEffect(() => {
    loadPending()
    loadHistory()
    loadNcs()
  }, [loadPending, loadHistory, loadNcs])

  const refreshAfterInspection = () => {
    loadPending()
    loadHistory()
    loadNcs()
  }

  const openNcCount = ncs.filter((n) => n.status !== 'closed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Quality Management</h1>
        <p className="text-sm text-ink-muted mt-0.5">Incoming inspections and non-conformances.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          ['pending', `Pending Inspections${pending.length ? ` (${pending.length})` : ''}`],
          ['history', 'Inspection History'],
          ['nc', `Non-Conformances${openNcCount ? ` (${openNcCount})` : ''}`],
        ].map(([key, label]) => (
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

      {error && <p className="text-sm text-danger">{error}</p>}

      <section className="bg-surface border border-border rounded-lg">
        {tab === 'pending' && (
          <PendingInspectionsTable grns={pending} loading={loadingPending} onInspect={setActiveGrn} />
        )}
        {tab === 'history' && <InspectionHistoryTable inspections={history} loading={loadingHistory} />}
        {tab === 'nc' && <NonConformanceTable ncs={ncs} loading={loadingNcs} onRefresh={loadNcs} />}
      </section>

      {activeGrn && (
        <InspectionModal grn={activeGrn} onClose={() => setActiveGrn(null)} onCompleted={refreshAfterInspection} />
      )}
    </div>
  )
}