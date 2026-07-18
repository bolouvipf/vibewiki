export interface HeartsProps {
  current: number
  max?: number
  className?: string
}

export function Hearts({ current, max = 5, className }: HeartsProps) {
  const filled = Math.min(current, max)
  const empty = max - filled

  return (
    <span className={`inline-flex gap-0.5 ${className ?? ""}`} aria-label={`${filled} cœur(s) sur ${max}`}>
      {Array.from({ length: filled }).map((_, i) => (
        <span key={`filled-${i}`} className="text-alert text-lg">
          ♥
        </span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300 text-lg">
          ♥
        </span>
      ))}
    </span>
  )
}
