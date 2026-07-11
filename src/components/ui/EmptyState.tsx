interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-base font-medium text-ink-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-sand-400 text-center max-w-[240px]">{description}</p>
      )}
    </div>
  );
}
