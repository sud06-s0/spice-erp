import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { apiClient } from '../lib/apiClient'
import WarehouseFormModal from '../components/warehouse/WarehouseFormModal'
import WarehouseTable from '../components/warehouse/WarehouseTable'
import PrepareDispatchModal from '../components/warehouse/PrepareDispatchModal'
import LoadDispatchModal from '../components/warehouse/LoadDispatchModal'
import DispatchTable from '../components/warehouse/DispatchTable'

export default function Warehouse() {
  const [tab, setTab] = useState('storage')

  const [warehouses, setWarehouses] = useState([])
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)

  const [lots, setLots] = useState([])
  const [productLookup, setProductLookup] = useState({})
  const [dispatches, setDispatches] = useState([])
  const [loadingDispatches, setLoadingDispatches] = useState(true)
  const [showPrepareModal, setShowPrepareModal] = useState(false)
  const [loadingDispatch, setLoadingDispatch] = useState(null)
  const [error, setError] = useState('')

  const loadWarehouses = useCallback(async () => {
    setLoadingWarehouses(true)
    const { data } = await supabase.from('warehouses').select('*').order('name')
    setWarehouses(data ?? [])
    setLoadingWarehouses(false)
  }, [])

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('finished_products').select('id, name')
    setProductLookup(Object.fromEntries((data ?? []).map((p) => [p.id, p.name])))
  }, [])

  const loadLots = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/warehouse/available-finished-stock')
      setLots(data ?? [])
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const loadDispatches = useCallback(async () => {
    setLoadingDispatches(true)
    setError('')
    try {
      const data = await apiClient.get('/api/warehouse/dispatch')
      setDispatches(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingDispatches(false)
    }
  }, [])

  useEffect(() => {
    loadWarehouses()
    loadProducts()
    loadLots()
    loadDispatches()
  }, [loadWarehouses, loadProducts, loadLots, loadDispatches])

  const refreshDispatchSide = () => {
    loadLots()
    loadDispatches()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Warehouse</h1>
          <p className="text-sm text-ink-muted mt-0.5">Storage locations and outbound dispatch.</p>
        </div>
        {tab === 'storage' ? (
          <button
            onClick={() => setShowWarehouseModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Location
          </button>
        ) : (
          <button
            onClick={() => setShowPrepareModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Prepare Dispatch
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          ['storage', 'Storage Locations'],
          ['dispatch', 'Dispatch'],
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
        {tab === 'storage' ? (
          <WarehouseTable warehouses={warehouses} loading={loadingWarehouses} />
        ) : (
          <DispatchTable dispatches={dispatches} loading={loadingDispatches} onLoad={setLoadingDispatch} />
        )}
      </section>

      {showWarehouseModal && (
        <WarehouseFormModal onClose={() => setShowWarehouseModal(false)} onCreated={loadWarehouses} />
      )}
      {showPrepareModal && (
        <PrepareDispatchModal
          lots={lots}
          productLookup={productLookup}
          onClose={() => setShowPrepareModal(false)}
          onCreated={refreshDispatchSide}
        />
      )}
      {loadingDispatch && (
        <LoadDispatchModal
          dispatch={loadingDispatch}
          onClose={() => setLoadingDispatch(null)}
          onLoaded={refreshDispatchSide}
        />
      )}
    </div>
  )
}