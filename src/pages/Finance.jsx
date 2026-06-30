import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { apiClient } from '../lib/apiClient'
import InvoiceFormModal from '../components/finance/InvoiceFormModal'
import PaymentModal from '../components/finance/PaymentModal'
import InvoiceTable from '../components/finance/InvoiceTable'
import ProfitabilityTable from '../components/finance/ProfitabilityTable'
import ProductCostFormModal from '../components/finance/ProductCostFormModal'
import ProductCostTable from '../components/finance/ProductCostTable'
import ExpenseFormModal from '../components/finance/ExpenseFormModal'
import ExpenseTable from '../components/finance/ExpenseTable'

export default function Finance() {
  const [tab, setTab] = useState('invoices')

  const [invoices, setInvoices] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState(null)

  const [profitability, setProfitability] = useState([])
  const [loadingProfitability, setLoadingProfitability] = useState(true)

  const [finishedProducts, setFinishedProducts] = useState([])
  const [costs, setCosts] = useState([])
  const [loadingCosts, setLoadingCosts] = useState(true)
  const [showCostModal, setShowCostModal] = useState(false)

  const [expenses, setExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  const [error, setError] = useState('')

  const loadInvoices = useCallback(async () => {
    setLoadingInvoices(true)
    setError('')
    try {
      const data = await apiClient.get('/api/finance/invoices')
      setInvoices(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingInvoices(false)
    }
  }, [])

  const loadProfitability = useCallback(async () => {
    setLoadingProfitability(true)
    try {
      const data = await apiClient.get('/api/finance/profitability')
      setProfitability((data ?? []).filter((r) => Number(r.total_revenue) > 0 || Number(r.avg_unit_cost) > 0))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingProfitability(false)
    }
  }, [])

  const loadFinishedProducts = useCallback(async () => {
    const { data } = await supabase.from('finished_products').select('*').order('name')
    setFinishedProducts(data ?? [])
  }, [])

  const loadCosts = useCallback(async () => {
    setLoadingCosts(true)
    const { data } = await supabase
      .from('finance_product_costs')
      .select('*, finished_products(name)')
      .order('cost_date', { ascending: false })
    setCosts(data ?? [])
    setLoadingCosts(false)
  }, [])

  const loadExpenses = useCallback(async () => {
    setLoadingExpenses(true)
    const { data } = await supabase.from('finance_expenses').select('*').order('expense_date', { ascending: false })
    setExpenses(data ?? [])
    setLoadingExpenses(false)
  }, [])

  useEffect(() => {
    loadInvoices()
    loadProfitability()
    loadFinishedProducts()
    loadCosts()
    loadExpenses()
  }, [loadInvoices, loadProfitability, loadFinishedProducts, loadCosts, loadExpenses])

  const tabs = [
    ['invoices', 'Invoices'],
    ['profitability', 'Profitability'],
    ['costs', 'Product Costs'],
    ['expenses', 'Expenses'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Finance &amp; Cost Control</h1>
          <p className="text-sm text-ink-muted mt-0.5">Invoicing, profitability, and cost tracking.</p>
        </div>
        {tab === 'invoices' && (
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Create Invoice
          </button>
        )}
        {tab === 'costs' && (
          <button
            onClick={() => setShowCostModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Log Cost
          </button>
        )}
        {tab === 'expenses' && (
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Log Expense
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

      {error && <p className="text-sm text-danger">{error}</p>}

      <section className="bg-surface border border-border rounded-lg">
        {tab === 'invoices' && (
          <InvoiceTable invoices={invoices} loading={loadingInvoices} onRecordPayment={setPaymentInvoice} />
        )}
        {tab === 'profitability' && <ProfitabilityTable rows={profitability} loading={loadingProfitability} />}
        {tab === 'costs' && <ProductCostTable costs={costs} loading={loadingCosts} />}
        {tab === 'expenses' && <ExpenseTable expenses={expenses} loading={loadingExpenses} />}
      </section>

      {showInvoiceModal && <InvoiceFormModal onClose={() => setShowInvoiceModal(false)} onCreated={loadInvoices} />}
      {paymentInvoice && (
        <PaymentModal invoice={paymentInvoice} onClose={() => setPaymentInvoice(null)} onRecorded={loadInvoices} />
      )}
      {showCostModal && (
        <ProductCostFormModal
          finishedProducts={finishedProducts}
          onClose={() => setShowCostModal(false)}
          onCreated={loadCosts}
        />
      )}
      {showExpenseModal && (
        <ExpenseFormModal onClose={() => setShowExpenseModal(false)} onCreated={loadExpenses} />
      )}
    </div>
  )
}