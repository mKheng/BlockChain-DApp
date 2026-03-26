import clsx from 'clsx'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 gap-4 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-400 flex items-center justify-center">
          <Icon className="w-6 h-6 text-text-muted" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        {description && (
          <p className="text-text-muted text-xs max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
