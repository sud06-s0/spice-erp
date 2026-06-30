import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import EquipmentFormModal from '../components/maintenance/EquipmentFormModal'
import EquipmentTable from '../components/maintenance/EquipmentTable'
import ScheduleFormModal from '../components/maintenance/ScheduleFormModal'
import ScheduleTable from '../components/maintenance/ScheduleTable'
import BreakdownFormModal from '../components/maintenance/BreakdownFormModal'
import BreakdownTable from '../components/maintenance/BreakdownTable'
import ServiceFormModal from '../components/maintenance/ServiceFormModal'
import ServiceLogTable from '../components/maintenance/ServiceLogTable'
import SparePartFormModal from '../components/maintenance/SparePartFormModal'
import SparePartTable from '../components/maintenance/SparePartTable'

export default function Maintenance() {
  const [tab, setTab] = useState('equipment')

  const [equipment, setEquipment] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(true)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)

  const [schedules, setSchedules] = useState([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const [breakdowns, setBreakdowns] = useState([])
  const [loadingBreakdowns, setLoadingBreakdowns] = useState(true)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)

  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [showServiceModal, setShowServiceModal] = useState(false)

  const [spareParts, setSpareParts] = useState([])
  const [loadingSpareParts, setLoadingSpareParts] = useState(true)
  const [showSparePartModal, setShowSparePartModal] = useState(false)

  const loadEquipment = useCallback(async () => {
    setLoadingEquipment(true)
    const { data } = await supabase.from('maintenance_equipment').select('*').order('name')
    setEquipment(data ?? [])
    setLoadingEquipment(false)
  }, [])

  const loadSchedules = useCallback(async () => {
    setLoadingSchedules(true)
    const { data } = await supabase
      .from('maintenance_schedules')
      .select('*, maintenance_equipment(name)')
      .order('next_due_date')
    setSchedules(data ?? [])
    setLoadingSchedules(false)
  }, [])

  const loadBreakdowns = useCallback(async () => {
    setLoadingBreakdowns(true)
    const { data } = await supabase
      .from('maintenance_breakdowns')
      .select('*, maintenance_equipment(name)')
      .order('reported_at', { ascending: false })
    setBreakdowns(data ?? [])
    setLoadingBreakdowns(false)
  }, [])

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('maintenance_logs')
      .select('*, maintenance_equipment(name)')
      .order('performed_at', { ascending: false })
    setLogs(data ?? [])
    setLoadingLogs(false)
  }, [])

  const loadSpareParts = useCallback(async () => {
    setLoadingSpareParts(true)
    const { data } = await supabase.from('maintenance_spare_parts').select('*').order('name')
    setSpareParts(data ?? [])
    setLoadingSpareParts(false)
  }, [])

  useEffect(() => {
    loadEquipment()
    loadSchedules()
    loadBreakdowns()
    loadLogs()
    loadSpareParts()
  }, [loadEquipment, loadSchedules, loadBreakdowns, loadLogs, loadSpareParts])

  const refreshAfterService = () => {
    loadLogs()
    loadSchedules()
    loadSpareParts()
    loadEquipment()
  }

  const refreshAfterBreakdown = () => {
    loadBreakdowns()
    loadEquipment()
  }

  const openBreakdownCount = breakdowns.filter((b) => !b.resolved_at).length

  const tabs = [
    ['equipment', 'Equipment'],
    ['schedules', 'Schedules'],
    ['breakdowns', `Breakdowns${openBreakdownCount ? ` (${openBreakdownCount})` : ''}`],
    ['logs', 'Service Logs'],
    ['spareparts', 'Spare Parts'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Maintenance</h1>
          <p className="text-sm text-ink-muted mt-0.5">Equipment, schedules, breakdowns, and spare parts.</p>
        </div>
        {tab === 'equipment' && (
          <button
            onClick={() => setShowEquipmentModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Equipment
          </button>
        )}
        {tab === 'schedules' && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Schedule
          </button>
        )}
        {tab === 'breakdowns' && (
          <button
            onClick={() => setShowBreakdownModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Report Breakdown
          </button>
        )}
        {tab === 'logs' && (
          <button
            onClick={() => setShowServiceModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Log Service
          </button>
        )}
        {tab === 'spareparts' && (
          <button
            onClick={() => setShowSparePartModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Spare Part
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="bg-surface border border-border rounded-lg">
        {tab === 'equipment' && <EquipmentTable equipment={equipment} loading={loadingEquipment} />}
        {tab === 'schedules' && <ScheduleTable schedules={schedules} loading={loadingSchedules} />}
        {tab === 'breakdowns' && (
          <BreakdownTable breakdowns={breakdowns} loading={loadingBreakdowns} onRefresh={refreshAfterBreakdown} />
        )}
        {tab === 'logs' && <ServiceLogTable logs={logs} loading={loadingLogs} />}
        {tab === 'spareparts' && <SparePartTable spareParts={spareParts} loading={loadingSpareParts} />}
      </section>

      {showEquipmentModal && (
        <EquipmentFormModal onClose={() => setShowEquipmentModal(false)} onCreated={loadEquipment} />
      )}
      {showScheduleModal && (
        <ScheduleFormModal
          equipment={equipment}
          onClose={() => setShowScheduleModal(false)}
          onCreated={loadSchedules}
        />
      )}
      {showBreakdownModal && (
        <BreakdownFormModal
          equipment={equipment}
          onClose={() => setShowBreakdownModal(false)}
          onCreated={refreshAfterBreakdown}
        />
      )}
      {showServiceModal && (
        <ServiceFormModal
          equipment={equipment}
          schedules={schedules}
          spareParts={spareParts}
          onClose={() => setShowServiceModal(false)}
          onCreated={refreshAfterService}
        />
      )}
      {showSparePartModal && (
        <SparePartFormModal onClose={() => setShowSparePartModal(false)} onCreated={loadSpareParts} />
      )}
    </div>
  )
}