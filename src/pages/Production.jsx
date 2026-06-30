import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { apiClient } from '../lib/apiClient'
import StartBatchModal from '../components/production/StartBatchModal'
import CompleteBatchModal from '../components/production/CompleteBatchModal'
import BatchTable from '../components/production/BatchTable'

export default function Production() {
  const [batches, setBatches] = useState([])
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [commodities, setCommodities] = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])
  const [showStartModal, setShowStartModal] = useState(false)
  const [activeBatch, setActiveBatch] = useState(null)
  const [error, setError] = useState('')

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true)
    setError('')
    try {
      const data = await apiClient.get('/api/production/batches')
      setBatches(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingBatches(false)
    }
  }, [])

  const loadCommodities = useCallback(async () => {
    const { data } = await supabase.from('procurement_commodities').select('*').order('name')
    setCommodities(data ?? [])
  }, [])

  const loadFinishedProducts = useCallback(async () => {
    const { data } = await supabase.from('finished_products').select('*').order('name')
    setFinishedProducts(data ?? [])
  }, [])

  useEffect(() => {
    loadBatches()
    loadCommodities()
    loadFinishedProducts()
  }, [loadBatches, loadCommodities, loadFinishedProducts])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Production</h1>
          <p className="text-sm text-ink-muted mt-0.5">Turn raw material into finished spice products.</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          <Plus size={16} /> Start Batch
        </button>
      </div>

      <section className="bg-surface border border-border rounded-lg">
        {error && <p className="px-5 py-3 text-sm text-danger border-b border-border">{error}</p>}
        <BatchTable batches={batches} loading={loadingBatches} onComplete={setActiveBatch} />
      </section>

      {showStartModal && (
        <StartBatchModal commodities={commodities} onClose={() => setShowStartModal(false)} onCreated={loadBatches} />
      )}
      {activeBatch && (
        <CompleteBatchModal
          batch={activeBatch}
          finishedProducts={finishedProducts}
          onClose={() => setActiveBatch(null)}
          onCompleted={loadBatches}
          onFinishedProductAdded={(fp) =>
            setFinishedProducts((prev) => [...prev, fp].sort((a, b) => a.name.localeCompare(b.name)))
          }
        />
      )}
    </div>
  )
}