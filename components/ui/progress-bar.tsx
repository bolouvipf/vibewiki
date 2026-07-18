export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  const barColor =
    pct < 40
      ? "bg-alert"
      : pct < 75
        ? "bg-compass"
        : "bg-moss"

  return (
    <div className={`w-full ${className ?? ""}`}>
      {label && (
        <div className="mb-1 flex items-center justify-between font-body text-sm text-ink">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-terrain">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
