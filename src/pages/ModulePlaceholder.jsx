export default function ModulePlaceholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="text-sm text-ink-muted mt-2 max-w-sm">
        This module's screens haven't been built yet — the database and routing are ready for it.
      </p>
    </div>
  )
}
