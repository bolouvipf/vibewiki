"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"

const variants = {
  primary: "bg-marine text-white hover:bg-marine/90 shadow-sm hover:shadow-md active:scale-[0.98]",
  secondary: "bg-transparent border-2 border-marine/20 text-marine hover:bg-marine/5 hover:border-marine/40",
  accent: "bg-compass text-white hover:bg-compass/90 shadow-sm hover:shadow-md active:scale-[0.98]",
  ghost: "bg-transparent text-ink/50 hover:text-marine hover:bg-marine/5",
  danger: "bg-alert text-white hover:bg-alert/90 active:scale-[0.98]",
  glass: "glass text-marine hover:bg-white/90 active:scale-[0.98]",
} as const

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3.5 text-lg rounded-xl",
  xl: "px-8 py-4 text-base rounded-2xl w-full",
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-body font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-compass/40 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"
