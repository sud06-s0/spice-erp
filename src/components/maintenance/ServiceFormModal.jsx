import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../Modal'
import { apiClient } from '../../lib/apiClient'

const emptyPart = () => ({ spare_part_id: '', qty_used: '' })

export default function ServiceFormModal({ equipment, schedules, spareParts, onClose, onCreated }) {
  const [equipmentId, setEquipmentId] = useState('')
  const [scheduleId, setScheduleId] = useState('')
  const [workDone, setWorkDone] = useState('')
  const [cost, setCost] = useState('')
  const [downtimeMinutes, setDowntimeMinutes] = useState('')
  const [parts, setParts] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const relevantSchedules = schedules.filter((s) => s.equipment_id === equipmentId)

  const updatePart = (i, field, value) =>
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  const addPart = () => setParts((prev) => [...prev, emptyPart()])
  const removePart = (i) => setParts((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!equipmentId) {
      setError('Select equipment')
      return
    }
    const validParts = parts.filter((p) => p.spare_part_id && p.qty_used)
    setSubmitting(true)
    try {
      await apiClient.post('/api/maintenance/service', {
        equipment_id: equipmentId,
        schedule_id: scheduleId || null,
        work_done: workDone || null,
        cost: cost ? Number(cost) : null,
        downtime_minutes: downtimeMinutes ? Number(downtimeMinutes) : null,
        parts_used: validParts.map((p) => ({ spare_part_id: p.spare_part_id, qty_used: Number(p.qty_used) })),
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Log Maintenance Service" onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Equipment *
            </label>
            <select
              required
              value={equipmentId}
              onChange={(e) => {
                setEquipmentId(e.target.value)
                setScheduleId('')
              }}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">Select equipment…</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Against Schedule (optional)
            </label>
            <select
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">Unscheduled / ad-hoc</option>
              {relevantSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.maintenance_type} (every {s.frequency_days}d)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
            Work Done
          </label>
          <textarea
            value={workDone}
            onChange={(e) => setWorkDone(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">
              Downtime (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={downtimeMinutes}
              onChange={(e) => setDowntimeMinutes(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">Spare Parts Used</label>
            <button
              type="button"
              onClick={addPart}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add part
            </button>
          </div>
          <div className="space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={p.spare_part_id}
                  onChange={(e) => updatePart(i, 'spare_part_id', e.target.value)}
                  className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                >
                  <option value="">Spare part…</option>
                  {spareParts.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.current_stock} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={p.qty_used}
                  onChange={(e) => updatePart(i, 'qty_used', e.target.value)}
                  className="w-24 rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
                />
                <button type="button" onClick={() => removePart(i)} className="text-ink-muted hover:text-danger p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? 'Logging…' : 'Log Service'}
          </button>
        </div>
      </form>
    </Modal>
  )
}