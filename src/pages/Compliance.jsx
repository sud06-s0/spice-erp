import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import CertificationFormModal from '../components/compliance/CertificationFormModal'
import CertificationTable from '../components/compliance/CertificationTable'
import AuditFormModal from '../components/compliance/AuditFormModal'
import AuditTable from '../components/compliance/AuditTable'
import DocumentFormModal from '../components/compliance/DocumentFormModal'
import DocumentTable from '../components/compliance/DocumentTable'
import RiskFormModal from '../components/compliance/RiskFormModal'
import RiskTable from '../components/compliance/RiskTable'

export default function Compliance() {
  const [tab, setTab] = useState('certifications')

  const [certifications, setCertifications] = useState([])
  const [loadingCerts, setLoadingCerts] = useState(true)
  const [showCertModal, setShowCertModal] = useState(false)

  const [audits, setAudits] = useState([])
  const [loadingAudits, setLoadingAudits] = useState(true)
  const [showAuditModal, setShowAuditModal] = useState(false)

  const [documents, setDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const [risks, setRisks] = useState([])
  const [loadingRisks, setLoadingRisks] = useState(true)
  const [showRiskModal, setShowRiskModal] = useState(false)

  const loadCertifications = useCallback(async () => {
    setLoadingCerts(true)
    const { data } = await supabase.from('compliance_certifications').select('*').order('expiry_date')
    setCertifications(data ?? [])
    setLoadingCerts(false)
  }, [])

  const loadAudits = useCallback(async () => {
    setLoadingAudits(true)
    const { data } = await supabase
      .from('compliance_audits')
      .select('*, compliance_audit_findings(*)')
      .order('audit_date', { ascending: false })
    setAudits(data ?? [])
    setLoadingAudits(false)
  }, [])

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true)
    const { data } = await supabase.from('compliance_documents').select('*').order('review_due_date')
    setDocuments(data ?? [])
    setLoadingDocuments(false)
  }, [])

  const loadRisks = useCallback(async () => {
    setLoadingRisks(true)
    const { data } = await supabase
      .from('compliance_risk_register')
      .select('*')
      .order('risk_score', { ascending: false })
    setRisks(data ?? [])
    setLoadingRisks(false)
  }, [])

  useEffect(() => {
    loadCertifications()
    loadAudits()
    loadDocuments()
    loadRisks()
  }, [loadCertifications, loadAudits, loadDocuments, loadRisks])

  const tabs = [
    ['certifications', 'Certifications'],
    ['audits', 'Audits'],
    ['documents', 'Documents'],
    ['risk', 'Risk Register'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Compliance</h1>
          <p className="text-sm text-ink-muted mt-0.5">Certifications, audits, documents, and risk.</p>
        </div>
        {tab === 'certifications' && (
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Certification
          </button>
        )}
        {tab === 'audits' && (
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Log Audit
          </button>
        )}
        {tab === 'documents' && (
          <button
            onClick={() => setShowDocumentModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Document
          </button>
        )}
        {tab === 'risk' && (
          <button
            onClick={() => setShowRiskModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Plus size={16} /> Add Risk
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
        {tab === 'certifications' && <CertificationTable certifications={certifications} loading={loadingCerts} />}
        {tab === 'audits' && <AuditTable audits={audits} loading={loadingAudits} />}
        {tab === 'documents' && <DocumentTable documents={documents} loading={loadingDocuments} />}
        {tab === 'risk' && <RiskTable risks={risks} loading={loadingRisks} onChanged={loadRisks} />}
      </section>

      {showCertModal && (
        <CertificationFormModal onClose={() => setShowCertModal(false)} onCreated={loadCertifications} />
      )}
      {showAuditModal && <AuditFormModal onClose={() => setShowAuditModal(false)} onCreated={loadAudits} />}
      {showDocumentModal && (
        <DocumentFormModal onClose={() => setShowDocumentModal(false)} onCreated={loadDocuments} />
      )}
      {showRiskModal && <RiskFormModal onClose={() => setShowRiskModal(false)} onCreated={loadRisks} />}
    </div>
  )
}