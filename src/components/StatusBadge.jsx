const toneClasses = {
  success: 'text-success bg-success-tint',
  warning: 'text-warning bg-warning-tint',
  danger: 'text-danger bg-danger-tint',
  neutral: 'text-ink-muted bg-surface-muted',
}

// Styled like a stamp on an export document — rectangular, hairline border,
// small caps — rather than the generic rounded "pill" badge.
export default function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`stamp ${toneClasses[tone]}`}>{children}</span>
}
