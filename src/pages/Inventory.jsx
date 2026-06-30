import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import StockTable from '../components/inventory/StockTable'
import SlowMovingTable from '../components/inventory/SlowMovingTable'

export default function Inventory() {
  const [tab, setTab] = useState('stock')
  const [stockRows, setStockRows] = useState([])
  const [slowRows, setSlowRows] = useState([])
  const [locationLookup, setLocationLookup] = useState({})
  const [loadingStock, setLoadingStock] = useState(true)
  const [loadingSlow, setLoadingSlow] = useState(true)

  const loadLocations = useCallback(async () => {
    const { data } = await supabase.from('inventory_locations').select('id, name')
    setLocationLookup(Object.fromEntries((data ?? []).map((l) => [l.id, l.name])))
  }, [])

  // inventory_ageing and slow_moving_stock are views from 07_bi_views_and_rls.sql —
  // security_invoker means they respect the same 'inventory' role RLS as the
  // underlying tables, so these are safe to read straight from the browser.
  const loadStock = useCallback(async () => {
    setLoadingStock(true)
    const { data } = await supabase.from('inventory_ageing').select('*').order('item_name')
    setStockRows(data ?? [])
    setLoadingStock(false)
  }, [])

  const loadSlow = useCallback(async () => {
    setLoadingSlow(true)
    const { data } = await supabase.from('slow_moving_stock').select('*')
    setSlowRows(data ?? [])
    setLoadingSlow(false)
  }, [])

  useEffect(() => {
    loadLocations()
    loadStock()
    loadSlow()
  }, [loadLocations, loadStock, loadSlow])

  const totalQty = stockRows.reduce((sum, r) => sum + Number(r.qty || 0), 0)
  const agingCount = stockRows.filter((r) => r.age_days > 60).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Inventory</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          {stockRows.length} lot{stockRows.length === 1 ? '' : 's'} on hand · {totalQty.toLocaleString()} kg total
          {agingCount > 0 && ` · ${agingCount} ageing past 60 days`}
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          ['stock', 'Stock & Ageing'],
          ['slow', `Slow-Moving${slowRows.length ? ` (${slowRows.length})` : ''}`],
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

      <section className="bg-surface border border-border rounded-lg">
        {tab === 'stock' ? (
          <StockTable rows={stockRows} loading={loadingStock} locationLookup={locationLookup} />
        ) : (
          <SlowMovingTable rows={slowRows} loading={loadingSlow} locationLookup={locationLookup} />
        )}
      </section>
    </div>
  )
}