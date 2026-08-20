import Link from "next/link"

export interface ZoneProps {
  pillarId: string
  title: string
  subtitle: string
  icon: string
  progress: number
  notionCount: number
  completedCount: number
  validated: boolean
  color: string
  index: number
  locked?: boolean
}

const colorConfig: Record<string, { gradient: string; border: string; badge: string; fill: string; glow: string }> = {
  parcours: {
    gradient: "from-[#1E2D4F]/25 via-[#D9A441]/10 to-transparent",
    border: "border-[#1E2D4F]/40",
    badge: "bg-gradient-to-br from-[#1E2D4F] to-[#3d4f7d] text-white",
    fill: "bg-[#1E2D4F]",
    glow: "shadow-[#1E2D4F]/10",
  },
  transversal: {
    gradient: "from-[#1E2D4F]/20 via-[#1E2D4F]/5 to-transparent",
    border: "border-[#1E2D4F]/30",
    badge: "bg-[#1E2D4F] text-white",
    fill: "bg-[#1E2D4F]",
    glow: "shadow-[#1E2D4F]/10",
  },
  front: {
    gradient: "from-[#D9A441]/20 via-[#D9A441]/5 to-transparent",
    border: "border-[#D9A441]/30",
    badge: "bg-[#D9A441] text-white",
    fill: "bg-[#D9A441]",
    glow: "shadow-[#D9A441]/10",
  },
  back: {
    gradient: "from-[#B5502F]/20 via-[#B5502F]/5 to-transparent",
    border: "border-[#B5502F]/30",
    badge: "bg-[#B5502F] text-white",
    fill: "bg-[#B5502F]",
    glow: "shadow-[#B5502F]/10",
  },
  database: {
    gradient: "from-[#5B7A5E]/20 via-[#5B7A5E]/5 to-transparent",
    border: "border-[#5B7A5E]/30",
    badge: "bg-[#5B7A5E] text-white",
    fill: "bg-[#5B7A5E]",
    glow: "shadow-[#5B7A5E]/10",
  },
  ia: {
    gradient: "from-[#202A22]/20 via-[#202A22]/5 to-transparent",
    border: "border-[#202A22]/30",
    badge: "bg-[#202A22] text-white",
    fill: "bg-[#202A22]",
    glow: "shadow-[#202A22]/10",
  },
}

export function TerritoryZone({
  pillarId,
  title,
  subtitle,
  icon,
  progress,
  notionCount,
  completedCount,
  validated,
  index,
  locked = false,
}: ZoneProps) {
  const c = colorConfig[pillarId] ?? colorConfig.transversal

  return (
    <Link
      href={locked ? "/piliers/parcours" : `/piliers/${pillarId}`}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`group relative animate-slide-up block rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${c.border} ${c.glow} ${locked ? "opacity-90" : ""}`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${c.badge} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-body text-[10px] uppercase tracking-widest text-ink/30">
                Zone {index + 1}
              </span>
              {validated && (
                <span className="rounded-full bg-moss/10 px-2 py-0.5 font-mono text-[9px] text-moss">
                  Validé
                </span>
              )}
              {locked && (
                <span className="rounded-full bg-compass/10 px-2 py-0.5 font-mono text-[9px] text-compass">
                  🔒 via le parcours
                </span>
              )}
            </div>
            <h2 className="font-heading text-lg font-semibold text-marine group-hover:text-ink transition-colors">
              {title}
            </h2>
            <p className="font-body text-sm text-ink/50 line-clamp-2 mt-1">{subtitle}</p>
          </div>

          <svg className="size-5 shrink-0 text-ink/20 group-hover:text-marine/40 transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Progress bar with fill color */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-xs text-ink/40">{completedCount}/{notionCount} notions</span>
            <span className="font-heading text-sm font-bold text-marine">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${c.fill}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* La zone se remplit visuellement avec la couleur */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-700 ease-out opacity-20 ${c.fill}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
