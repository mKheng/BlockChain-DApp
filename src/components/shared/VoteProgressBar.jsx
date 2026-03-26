import clsx from 'clsx'

export default function VoteProgressBar({ value, total, className, showLabel = false }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0

  return (
    <div className={clsx('flex items-center gap-2.5', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-text-muted text-xs font-mono tabular-nums w-9 text-right">{pct}%</span>
      )}
    </div>
  )
}
