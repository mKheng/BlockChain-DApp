import clsx from 'clsx'

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  subtitleColor,
  className,
}) {
  return (
    <div className={clsx('bg-surface-600 border border-border rounded-xl p-5 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-text-muted text-xs font-medium">{title}</p>
          <p className="text-text-primary font-bold text-2xl leading-none tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-brand-dim flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-brand" />
          </div>
        )}
      </div>
      {subtitle && (
        <p className={clsx('text-xs', subtitleColor ?? 'text-text-muted')}>{subtitle}</p>
      )}
    </div>
  )
}
