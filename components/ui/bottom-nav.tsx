"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { label: "Territoire", href: "/", icon: "\uD83E\uDE9C" },
  { label: "Piliers", href: "/piliers/transversal", icon: "\uD83D\uDCD6" },
  { label: "Dictionnaire", href: "/dictionnaire", icon: "\uD83D\uDCDD" },
  { label: "Assistant", href: "/assistant", icon: "\u2728" },
  { label: "Profil", href: "/profil", icon: "\uD83D\uDC64" },
] as const

export interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/"
    if (href === "/piliers/transversal") return pathname.startsWith("/piliers")
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-ink/5 bg-white/80 backdrop-blur-lg px-2 pb-safe-area-bottom pt-2 font-body text-xs ${className ?? ""}`}
    >
      {tabs.map(({ label, href, icon }) => {
        const active = isActive(href)

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 ${
              active ? "text-marine scale-105" : "text-ink/30 hover:text-ink/50"
            }`}
          >
            <span className={`text-lg transition-transform duration-200 ${active ? "scale-110" : ""}`}>
              {icon}
            </span>
            <span className={`text-[10px] font-medium tracking-tight ${active ? "opacity-100" : "opacity-60"}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
