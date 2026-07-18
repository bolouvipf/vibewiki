import type { HTMLAttributes } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "territory" | "premium"
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  const base = "rounded-xl bg-white shadow-sm transition-all duration-300"

  const variants = {
    default: "p-5",
    territory: "p-5 border-t-4 border-t-compass hover:shadow-md hover:-translate-y-0.5",
    premium: "p-6 border border-ink/5 hover:shadow-lg hover:border-compass/30 card-gradient",
  }

  return (
    <div
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  )
}
