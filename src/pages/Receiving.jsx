import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { apiClient } from '../lib/apiClient'
import ReceiveMaterialModal from '../components/receiving/ReceiveMaterialModal'
import GRNTable from '../components/receiving/GRNTable'

export default function Receiving() {
  const [eligiblePos, setEligiblePos] = useState([])
  const [grns, setGrns] = useState([])
  const [loadingGrns, setLoadingGrns] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  // Direct Supabase read with a client-side "remaining" calc — simple
  // enough to not need the API, same pattern as the Dashboard.
  const loadEligiblePos = useCallback(async () => {
    const { data } = await supabase
      .from('procurement_purchase_orders')
      .select(
        'id, po_no, procurement_suppliers(name), procurement_purchase_order_items(id, commodity_id, qty_ordered, qty_received, procurement_commodities(name))'
      )
      .in('status', ['approved', 'partially_received'])

    const mapped = (data ?? [])
      .map((po) => ({
        id: po.id,
        po_no: po.po_no,
        supplierName: po.procurement_suppliers?.name ?? '—',
        items: po.procurement_purchase_order_items.map((i) => ({
          id: i.id,
          commodity_id: i.commodity_id,
          commodity_name: i.procurement_commodities?.name ?? '—',
          qty_ordered: Number(i.qty_ordered),
          remaining: Number(i.qty_ordered) - Number(i.qty_received ?? 0),
        })),
      }))
      .filter((po) => po.items.some((i) => i.remaining > 0))

    setEligiblePos(mapped)
  }, [])

  const loadGrns = useCallback(async () => {
    setLoadingGrns(true)
    setError('')
    try {
      const data = await apiClient.get('/api/receiving/grn')
      setGrns(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingGrns(false)
    }
  }, [])

  useEffect(() => {
    loadEligiblePos()
    loadGrns()
  }, [loadEligiblePos, loadGrns])

  const refreshAll = () => {
    loadEligiblePos()
    loadGrns()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Raw Material Receiving</h1>
          <p className="text-sm text-ink-muted mt-0.5">Record what arrives against open purchase orders.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          <Plus size={16} /> Receive Material
        </button>
      </div>

      <section className="bg-surface border border-border rounded-lg">
        {error && <p className="px-5 py-3 text-sm text-danger border-b border-border">{error}</p>}
        <GRNTable grns={grns} loading={loadingGrns} onRefresh={refreshAll} />
      </section>

      {showModal && (
        <ReceiveMaterialModal pos={eligiblePos} onClose={() => setShowModal(false)} onCreated={refreshAll} />
      )}
    </div>
  )
}