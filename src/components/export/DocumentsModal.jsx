import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

const docTypes = [
  ['invoice', 'Commercial Invoice'],
  ['packing_list', 'Packing List'],
  ['certificate_of_origin', 'Certificate of Origin'],
  ['phytosanitary', 'Phytosanitary Certificate'],
  ['fumigation', 'Fumigation Certificate'],
  ['bill_of_lading', 'Bill of Lading'],
]

export default function DocumentsModal({ shipmentId, onClose }) {
  const [docs, setDocs] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingType, setSavingType] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('export_documents').select('*').eq('shipment_id', shipmentId)
      const byType = {}
      ;(data ?? []).forEach((d) => {
        byType[d.doc_type] = d
      })
      setDocs(byType)
      setLoading(false)
    }
    load()
  }, [shipmentId])

  const updateField = (docType, field, value) => {
    setDocs((prev) => ({
      ...prev,
      [docType]: { ...(prev[docType] ?? { doc_type: docType, status: 'pending', file_url: '' }), [field]: value },
    }))
  }

  const handleSave = async (docType) => {
    setSavingType(docType)
    setError('')
    const draft = docs[docType]
    const payload = {
      shipment_id: shipmentId,
      doc_type: docType,
      file_url: draft?.file_url || null,
      status: draft?.status || 'pending',
      uploaded_at: draft?.file_url ? new Date().toISOString() : null,
    }

    let resultError
    if (draft?.id) {
      const { error: updateError } = await supabase.from('export_documents').update(payload).eq('id', draft.id)
      resultError = updateError
    } else {
      const { data, error: insertError } = await supabase.from('export_documents').insert(payload).select().single()
      resultError = insertError
      if (data) setDocs((prev) => ({ ...prev, [docType]: data }))
    }

    setSavingType(null)
    if (resultError) setError(resultError.message)
  }

  return (
    <Modal title="Shipment Documents" onClose={onClose} width="max-w-xl">
      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {docTypes.map(([key, label]) => {
            const doc = docs[key]
            return (
              <div key={key} className="bg-surface-muted rounded-md px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ink">{label}</span>
                  <select
                    value={doc?.status ?? 'pending'}
                    onChange={(e) => updateField(key, 'status', e.target.value)}
                    className="text-xs rounded-md border border-border bg-bg px-2 py-1 text-ink"
                  >
                    <option value="pending">Pending</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={doc?.file_url ?? ''}
                    onChange={(e) => updateField(key, 'file_url', e.target.value)}
                    placeholder="Link to document (Drive, Dropbox, etc.)"
                    className="flex-1 rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-ink"
                  />
                  <button
                    onClick={() => handleSave(key)}
                    disabled={savingType === key}
                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    {savingType === key ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
    </Modal>
  )
}