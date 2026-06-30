import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import CustomerFormModal from '../components/sales/CustomerFormModal'
import CustomerTable from '../components/sales/CustomerTable'
import LeadFormModal from '../components/sales/LeadFormModal'
import LeadTable from '../components/sales/LeadTable'
import QuotationFormModal from '../components/sales/QuotationFormModal'
import QuotationTable from '../components/sales/QuotationTable'
import OrderTable from '../components/sales/OrderTable'

export default function Sales() {
  const [tab, setTab] = useState('customers')

  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const [commodities, setCommodities] = useState([])
  const [finishedProducts, setFinishedProducts] = useState([])

  const [leads, setLeads] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const [quotations, setQuotations] = useState([])
  const [loadingQuotations, setLoadingQuotations] = useState(true)
  const [showQuotationModal, setShowQuotationModal] = useState(false)

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true)
    const { data } = await supabase.from('customers').select('*').order('name')
    setCustomers(data ?? [])
    setLoadingCustomers(false)
  }, [])

  const loadCommodities = useCallback(async () => {
    const { data } = await supabase.from('procurement_commodities').select('*').order('name')
    setCommodities(data ?? [])
  }, [])

  const loadFinishedProducts = useCallback(async () => {
    const { data } = await supabase.from('finished_products').select('*').order('name')
    setFinishedProducts(data ?? [])
  }, [])

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true)
    const { data } = await supabase
      .from('sales_leads')
      .select('*, customers(name)')
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoadingLeads(false)
  }, [])

  const loadQuotations = useCallback(async () => {
    setLoadingQuotations(true)
    const { data } = await supabase
      .from('sales_quotations')
      .select('*, customers(name), sales_quotation_items(*)')
      .order('created_at', { ascending: false })
    setQuotations(data ?? [])
    setLoadingQuotations(false)
  }, [])

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    const { data } = await supabase
      .from('sales_orders')
      .select('*, customers(name)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoadingOrders(false)
  }, [])

  useEffect(() => {
    loadCustomers()
    loadCommodities()
    loadFinishedProducts()
    loadLeads()
    loadQuotations()
    loadOrders()
  }, [loadCustomers, loadCommodities, loadFinishedProducts, loadLeads, loadQuotations, loadOrders])

  const refreshQuotationsAndOrders = () => {
    loadQuotations()
    loadOrders()
  }

  const tabs = [
    ['customers', 'Customers'],
    ['pipeline', 'Pipeline'],
    ['quotations', 'Quotations'],
    ['orders', 'Orders'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Sales &amp; Customers</h1>
          <p className="text-sm text-ink-muted mt-0.5">Customers, pipeline, quotations, and orders.</p>
        </div>
        {tab === 'customers' && (
          <button
            onClick={() => {
              setEditingCustomer(null)
              setShowCustomerModal(true)
            }}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Customer
          </button>
        )}
        {tab === 'pipeline' && (
          <button
            onClick={() => setShowLeadModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Lead
          </button>
        )}
        {tab === 'quotations' && (
          <button
            onClick={() => setShowQuotationModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Create Quotation
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
        {tab === 'customers' && (
          <CustomerTable
            customers={customers}
            loading={loadingCustomers}
            onEdit={(c) => {
              setEditingCustomer(c)
              setShowCustomerModal(true)
            }}
          />
        )}
        {tab === 'pipeline' && <LeadTable leads={leads} loading={loadingLeads} onChanged={loadLeads} />}
        {tab === 'quotations' && (
          <QuotationTable quotations={quotations} loading={loadingQuotations} onRefresh={refreshQuotationsAndOrders} />
        )}
        {tab === 'orders' && <OrderTable orders={orders} loading={loadingOrders} />}
      </section>

      {showCustomerModal && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowCustomerModal(false)}
          onSaved={loadCustomers}
        />
      )}
      {showLeadModal && (
        <LeadFormModal
          customers={customers}
          commodities={commodities}
          onClose={() => setShowLeadModal(false)}
          onCreated={loadLeads}
        />
      )}
      {showQuotationModal && (
        <QuotationFormModal
          customers={customers}
          finishedProducts={finishedProducts}
          onClose={() => setShowQuotationModal(false)}
          onCreated={loadQuotations}
        />
      )}
    </div>
  )
}