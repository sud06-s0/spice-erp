import StatusBadge from '../StatusBadge'

const toneForExpiry = (expiryDate) => {
  if (!expiryDate) return 'neutral'
  const days = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'danger'
  if (days < 30) return 'warning'
  return 'success'
}

const labelForExpiry = (expiryDate) => {
  if (!expiryDate) return 'no expiry'
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'expired'
  if (days < 30) return `${days}d left`
  return expiryDate
}

export default function CertificationTable({ certifications, loading }) {
  if (loading) return <p className="px-5 py-6 text-sm text-ink-muted">Loading certifications…</p>
  if (certifications.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">No certifications tracked yet.</p>
  }

  return (
    <div className="divide-y divide-border">
      {certifications.map((c) => (
        <div key={c.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{c.cert_name}</p>
            <p className="text-xs text-ink-muted">
              {c.cert_number || 'No certificate number'}
              {c.issued_by && ` · ${c.issued_by}`}
            </p>
          </div>
          <StatusBadge tone={toneForExpiry(c.expiry_date)}>{labelForExpiry(c.expiry_date)}</StatusBadge>
        </div>
      ))}
    </div>
  )
}