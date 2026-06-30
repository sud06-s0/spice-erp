import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import ExportOrderFormModal from '../components/export/ExportOrderFormModal'
import ExportOrderTable from '../components/export/ExportOrderTable'
import ShipmentFormModal from '../components/export/ShipmentFormModal'
import DocumentsModal from '../components/export/DocumentsModal'

export default function Export() {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [customers, setCustomers] = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [shipmentForOrderId, setShipmentForOrderId] = useState(null)
  const [documentsForShipmentId, setDocumentsForShipmentId] = useState(null)

  // All of these tables (export_orders, export_order_items, export_shipments)
  // belong to the 'export' role's own RLS group, and customers/finished_products
  // are cross-read for any staff — so this whole read is a direct Supabase call.
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    const { data } = await supabase
      .from('export_orders')
      .select('*, customers(name), export_order_items(*, finished_products(name)), export_shipments(*)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoadingOrders(false)
  }, [])

  const loadCustomers = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').order('name')
    setCustomers(data ?? [])
  }, [])

  const loadFinishedProducts = useCallback(async () => {
    const { data } = await supabase.from('finished_products').select('*').order('name')
    setFinishedProducts(data ?? [])
  }, [])

  useEffect(() => {
    loadOrders()
    loadCustomers()
    loadFinishedProducts()
  }, [loadOrders, loadCustomers, loadFinishedProducts])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Export</h1>
          <p className="text-sm text-ink-muted mt-0.5">Export orders, shipments, and documentation.</p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          <Plus size={16} /> Create Export Order
        </button>
      </div>

      <section className="bg-surface border border-border rounded-lg">
        <ExportOrderTable
          orders={orders}
          loading={loadingOrders}
          onAddShipment={setShipmentForOrderId}
          onManageDocuments={setDocumentsForShipmentId}
        />
      </section>

      {showOrderModal && (
        <ExportOrderFormModal
          customers={customers}
          finishedProducts={finishedProducts}
          onClose={() => setShowOrderModal(false)}
          onCreated={loadOrders}
          onCustomerAdded={(c) => setCustomers((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))}
        />
      )}
      {shipmentForOrderId && (
        <ShipmentFormModal
          exportOrderId={shipmentForOrderId}
          onClose={() => setShipmentForOrderId(null)}
          onCreated={loadOrders}
        />
      )}
      {documentsForShipmentId && (
        <DocumentsModal shipmentId={documentsForShipmentId} onClose={() => setDocumentsForShipmentId(null)} />
      )}
    </div>
  )
}