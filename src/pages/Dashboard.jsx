import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import KPITile from '../components/KPITile'
import StatusBadge from '../components/StatusBadge'

const toneForSeverity = (severity) =>
  severity === 'critical' ? 'danger' : severity === 'major' ? 'warning' : 'neutral'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [production, setProduction] = useState([])
  const [dispatch, setDispatch] = useState([])
  const [inventory, setInventory] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [qualityAlerts, setQualityAlerts] = useState([])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      const [
        { data: productionData },
        { data: dispatchData },
        { data: inventoryData },
        { data: pendingData },
        { data: alertsData },
      ] = await Promise.all([
        supabase.from('dashboard_today_production').select('*'),
        supabase.from('dashboard_today_dispatch').select('*'),
        supabase.from('dashboard_inventory_position').select('*'),
        supabase.from('dashboard_pending_orders').select('*'),
        supabase.from('dashboard_quality_alerts').select('*').order('alert_date', { ascending: false }).limit(6),
      ])
      setProduction(productionData ?? [])
      setDispatch(dispatchData ?? [])
      setInventory(inventoryData ?? [])
      setPendingOrders(pendingData ?? [])
      setQualityAlerts(alertsData ?? [])
      setLoading(false)
    }
    loadDashboard()
  }, [])

  const totalOutputToday = production.reduce((sum, b) => sum + (b.output_qty ?? 0), 0)
  const dispatchToday = dispatch.length
  const totalInventoryQty = inventory.reduce((sum, r) => sum + (r.total_qty ?? 0), 0)
  const openAlerts = qualityAlerts.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Good morning</h1>
        <p className="text-ink-muted text-sm mt-0.5">Here's where things stand across the factory today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          label="Output Today"
          value={loading ? '—' : `${totalOutputToday.toLocaleString()} kg`}
          sublabel={`${production.length} batch${production.length === 1 ? '' : 'es'} running`}
          accent="primary"
        />
        <KPITile
          label="Dispatch Today"
          value={loading ? '—' : dispatchToday}
          sublabel="Scheduled for today"
          accent="accent"
        />
        <KPITile
          label="Inventory On Hand"
          value={loading ? '—' : `${totalInventoryQty.toLocaleString()} kg`}
          sublabel="Across raw, WIP & finished goods"
          accent="success"
        />
        <KPITile
          label="Quality Alerts"
          value={loading ? '—' : openAlerts}
          sublabel="Open non-conformances & complaints"
          accent="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Quality Alerts</h2>
            <StatusBadge tone="danger">{openAlerts} open</StatusBadge>
          </div>
          <div className="divide-y divide-border">
            {!loading && qualityAlerts.length === 0 && (
              <p className="px-5 py-6 text-sm text-ink-muted">No open quality alerts. Clean board.</p>
            )}
            {qualityAlerts.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium font-mono">{a.reference_no}</p>
                  <p className="text-xs text-ink-muted capitalize">{a.alert_type.replace('_', ' ')}</p>
                </div>
                <StatusBadge tone={toneForSeverity(a.severity)}>{a.severity}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Pending Orders</h2>
            <StatusBadge tone="neutral">{pendingOrders.length} total</StatusBadge>
          </div>
          <div className="divide-y divide-border">
            {!loading && pendingOrders.length === 0 && (
              <p className="px-5 py-6 text-sm text-ink-muted">No pending orders right now.</p>
            )}
            {pendingOrders.slice(0, 6).map((o) => (
              <div key={`${o.order_type}-${o.id}`} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink font-medium font-mono">{o.order_no}</p>
                  <p className="text-xs text-ink-muted capitalize">{o.order_type} order</p>
                </div>
                <StatusBadge tone="warning">{o.status.replace('_', ' ')}</StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
