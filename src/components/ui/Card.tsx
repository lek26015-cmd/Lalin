interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glass = false, onClick }: CardProps) {
  const base = glass
    ? 'glass rounded-2xl p-4'
    : 'bg-sand-100 rounded-2xl p-4 border border-sand-200/60';

  return (
    <div
      className={`${base} ${onClick ? 'touch-active cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
