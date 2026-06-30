import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'
import { apiClient } from '../../lib/apiClient'

export default function InspectionModal({ grn, onClose, onCompleted }) {
  const [parameters, setParameters] = useState([])
  const [loadingParams, setLoadingParams] = useState(true)
  const [measured, setMeasured] = useState({})
  const [remarks, setRemarks] = useState('')
  const [newParam, setNewParam] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const commodities = [...new Map(grn.items.map((i) => [i.commodity_id, i.commodity_name])).entries()]

  const loadParameters = async () => {
    setLoadingParams(true)
    const commodityIds = commodities.map(([id]) => id)
    const { data } = await supabase.from('quality_parameters').select('*').in('commodity_id', commodityIds)
    setParameters(data ?? [])
    setLoadingParams(false)
  }

  useEffect(() => {
    loadParameters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grn])

  const handleAddParameter = async (commodityId) => {
    const draft = newParam[commodityId]
    if (!draft?.name) return
    const { data, error: insertError } = await supabase
      .from('quality_parameters')
      .insert({
        commodity_id: commodityId,
        parameter_name: draft.name,
        unit: draft.unit || null,
        min_acceptable: draft.min ? Number(draft.min) : null,
        max_acceptable: draft.max ? Number(draft.max) : null,
      })
      .select()
      .single()
    if (insertError) {
      setError(insertError.message)
      return
    }
    setParameters((prev) => [...prev, data])
    setNewParam((prev) => ({ ...prev, [commodityId]: { name: '', unit: '', min: '', max: '' } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const results = parameters
      .filter((p) => measured[p.id] !== undefined && measured[p.id] !== '')
      .map((p) => ({ parameter_id: p.id, measured_value: Number(measured[p.id]) }))

    if (results.length === 0) {
      setError('Record at least one measured value')
      return
    }

    setSubmitting(true)
    try {
      const data = await apiClient.post('/api/quality/inspections', {
        reference_type: 'grn',
        reference_id: grn.id,
        results,
        remarks,
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const passed = result.overall_result === 'pass'
    const finish = () => {
      onCompleted()
      onClose()
    }
    return (
      <Modal title="Inspection Recorded" onClose={finish}>
        <div className="text-center py-4">
          <p className={`font-display text-2xl ${passed ? 'text-success' : 'text-danger'}`}>
            {passed ? 'Passed' : 'Failed'}
          </p>
          <p className="text-sm text-ink-muted mt-2">
            {passed
              ? `GRN ${grn.grn_no} has been accepted.`
              : `GRN ${grn.grn_no} has been rejected. A non-conformance was opened automatically.`}
          </p>
          <button onClick={finish} className="mt-5 px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover">
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`Inspect ${grn.grn_no}`} onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-ink-muted">
          {grn.supplierName} · PO {grn.po_no}
        </p>

        {loadingParams && <p className="text-sm text-ink-muted">Loading quality parameters…</p>}

        {!loadingParams &&
          commodities.map(([commodityId, commodityName]) => {
            const commodityParams = parameters.filter((p) => p.commodity_id === commodityId)
            return (
              <div key={commodityId}>
                <p className="text-sm font-medium text-ink mb-2">{commodityName}</p>

                {commodityParams.length === 0 && (
                  <p className="text-xs text-ink-muted mb-2">
                    No quality parameters defined yet for {commodityName} — add one below.
                  </p>
                )}

                <div className="space-y-2">
                  {commodityParams.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-surface-muted rounded-md px-3 py-2">
                      <span className="flex-1 text-sm text-ink">{p.parameter_name}</span>
                      <span className="text-xs text-ink-muted whitespace-nowrap">
                        {p.min_acceptable ?? '—'}–{p.max_acceptable ?? '—'} {p.unit}
                      </span>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Measured"
                        value={measured[p.id] ?? ''}
                        onChange={(e) => setMeasured((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-24 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-ink"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    placeholder="Parameter name (e.g. Moisture %)"
                    value={newParam[commodityId]?.name ?? ''}
                    onChange={(e) =>
                      setNewParam((prev) => ({ ...prev, [commodityId]: { ...prev[commodityId], name: e.target.value } }))
                    }
                    className="flex-1 rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-ink"
                  />
                  <input
                    placeholder="Min"
                    value={newParam[commodityId]?.min ?? ''}
                    onChange={(e) =>
                      setNewParam((prev) => ({ ...prev, [commodityId]: { ...prev[commodityId], min: e.target.value } }))
                    }
                    className="w-16 rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-ink"
                  />
                  <input
                    placeholder="Max"
                    value={newParam[commodityId]?.max ?? ''}
                    onChange={(e) =>
                      setNewParam((prev) => ({ ...prev, [commodityId]: { ...prev[commodityId], max: e.target.value } }))
                    }
                    className="w-16 rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddParameter(commodityId)}
                    className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            )
          })}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted mb-1.5">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink"
          />
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
            {submitting ? 'Submitting…' : 'Submit Inspection'}
          </button>
        </div>
      </form>
    </Modal>
  )
}