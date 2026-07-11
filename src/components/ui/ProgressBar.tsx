interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'clay' | 'bronze' | 'ceramic' | 'success';
  showLabel?: boolean;
  animated?: boolean;
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorMap = {
  clay: 'from-clay-400 to-clay-600',
  bronze: 'from-bronze-400 to-bronze-500',
  ceramic: 'from-ceramic-400 to-ceramic-600',
  success: 'from-emerald-400 to-emerald-600',
};

export function ProgressBar({
  value,
  className = '',
  size = 'md',
  color = 'clay',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-ink-600">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-sand-200 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${sizeMap[size]} rounded-full bg-gradient-to-r ${colorMap[color]} ${animated ? 'progress-fill' : ''} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
