// Accent options map to the same vocabulary as the rest of the app:
// primary = core operations, accent = revenue/highlight, danger = needs attention.
const accentClasses = {
  primary: 'border-l-primary',
  accent: 'border-l-accent',
  danger: 'border-l-danger',
  success: 'border-l-success',
}

export default function KPITile({ label, value, sublabel, accent = 'primary' }) {
  return (
    <div
      className={`bg-surface border border-border ${accentClasses[accent]} border-l-4 rounded-lg px-5 py-4`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="font-display text-3xl text-ink mt-1.5 leading-none">{value}</p>
      {sublabel && <p className="text-sm text-ink-muted mt-1.5">{sublabel}</p>}
    </div>
  )
}
