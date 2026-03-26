import clsx from 'clsx'

const VARIANTS = {
  active: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    wrapper: 'bg-emerald-500/10 border-emerald-500/20',
    pulse: true,
  },
  closed: {
    dot: 'bg-zinc-500',
    text: 'text-zinc-400',
    wrapper: 'bg-zinc-500/10 border-zinc-500/20',
    pulse: false,
  },
  pending: {
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    wrapper: 'bg-amber-500/10 border-amber-500/20',
    pulse: true,
  },
  success: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    wrapper: 'bg-emerald-500/10 border-emerald-500/20',
    pulse: false,
  },
  failed: {
    dot: 'bg-red-400',
    text: 'text-red-400',
    wrapper: 'bg-red-500/10 border-red-500/20',
    pulse: false,
  },
}

export default function StatusBadge({ status = 'active', label, className }) {
  const v = VARIANTS[status] ?? VARIANTS.active
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        v.wrapper, v.text, className,
      )}
    >
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full shrink-0',
        v.dot,
        v.pulse && 'animate-pulse',
      )} />
      {displayLabel}
    </span>
  )
}
