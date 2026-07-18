import type { HTMLAttributes } from "react"

const masteryStyles = {
  decouvert: "bg-ink/5 text-ink/50 border-ink/10",
  en_cours: "bg-compass/10 text-compass border-compass/20",
  maitrise: "bg-moss/10 text-moss border-moss/20",
} as const

const pillarStyles: Record<string, string> = {
  transversal: "bg-marine/5 text-marine border-marine/10",
  front: "bg-compass/5 text-compass border-compass/10",
  back: "bg-alert/5 text-alert border-alert/10",
  database: "bg-moss/5 text-moss border-moss/10",
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "mastery" | "pillar"
  level?: keyof typeof masteryStyles
  pillar?: string
}

export function Badge({
  variant = "mastery",
  level = "decouvert",
  pillar,
  className,
  children,
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border"

  const color = variant === "pillar" && pillar
    ? pillarStyles[pillar] || "bg-ink/5 text-ink/50 border-ink/10"
    : masteryStyles[level]

  return (
    <span className={`${base} ${color} ${className ?? ""}`} {...props}>
      {children}
    </span>
  )
}
