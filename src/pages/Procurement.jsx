import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { apiClient } from '../lib/apiClient'
import SupplierTable from '../components/procurement/SupplierTable'
import SupplierFormModal from '../components/procurement/SupplierFormModal'
import PurchaseOrderTable from '../components/procurement/PurchaseOrderTable'
import PurchaseOrderFormModal from '../components/procurement/PurchaseOrderFormModal'

export default function Procurement() {
  const [tab, setTab] = useState('suppliers')

  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [showSupplierModal, setShowSupplierModal] = useState(false)

  const [commodities, setCommodities] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [showPOModal, setShowPOModal] = useState(false)
  const [poError, setPoError] = useState('')

  const loadSuppliers = useCallback(async () => {
    setLoadingSuppliers(true)
    const { data } = await supabase
      .from('procurement_suppliers')
      .select('*')
      .order('created_at', { ascending: false })
    setSuppliers(data ?? [])
    setLoadingSuppliers(false)
  }, [])

  const loadCommodities = useCallback(async () => {
    const { data } = await supabase.from('procurement_commodities').select('*').order('name')
    setCommodities(data ?? [])
  }, [])

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    setPoError('')
    try {
      const data = await apiClient.get('/api/procurement/purchase-orders')
      setOrders(data ?? [])
    } catch (err) {
      setPoError(err.message)
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    loadSuppliers()
    loadCommodities()
    loadOrders()
  }, [loadSuppliers, loadCommodities, loadOrders])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Procurement</h1>
          <p className="text-sm text-ink-muted mt-0.5">Suppliers and purchase orders.</p>
        </div>
        {tab === 'suppliers' ? (
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Supplier
          </button>
        ) : (
          <button
            onClick={() => setShowPOModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Create PO
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          ['suppliers', 'Suppliers'],
          ['orders', 'Purchase Orders'],
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

      {tab === 'suppliers' ? (
        <section className="bg-surface border border-border rounded-lg">
          <SupplierTable suppliers={suppliers} loading={loadingSuppliers} />
        </section>
      ) : (
        <section className="bg-surface border border-border rounded-lg">
          {poError && <p className="px-5 py-3 text-sm text-danger border-b border-border">{poError}</p>}
          <PurchaseOrderTable orders={orders} loading={loadingOrders} onRefresh={loadOrders} />
        </section>
      )}

      {showSupplierModal && (
        <SupplierFormModal onClose={() => setShowSupplierModal(false)} onCreated={loadSuppliers} />
      )}
      {showPOModal && (
        <PurchaseOrderFormModal
          suppliers={suppliers.filter((s) => s.status === 'active' || s.status === 'pending')}
          commodities={commodities}
          onClose={() => setShowPOModal(false)}
          onCreated={loadOrders}
          onCommodityAdded={(c) =>
            setCommodities((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))
          }
        />
      )}
    </div>
  )
}
