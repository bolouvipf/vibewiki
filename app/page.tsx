"use client"

import { useEffect, useMemo, useState } from "react"
import { Hearts } from "@/components/ui/hearts"
import { BottomNav } from "@/components/ui/bottom-nav"
import { TerritoryMap } from "@/components/territoire/map"
import { getGamificationState } from "@/lib/gamification/engine"
import { getProgress, isPillarValidated } from "@/lib/db/queries"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"

const pillars = [pillar1, pillar2, pillar3, pillar4]

export default function HomePage() {
  const [state, setState] = useState({ xp: 0, streakDays: 0, hearts: 5, league: "", completedNotions: 0 })
  const [completedIds, setCompletedIds] = useState<readonly string[]>([])
  const [validatedPillars, setValidatedPillars] = useState<readonly string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGamificationState().then(setState).catch((e) => setError(String(e)))
    getProgress().then((p) => setCompletedIds(p.completedNotionIds)).catch((e) => setError(String(e)))
    Promise.all(pillars.map((p) => isPillarValidated(p.pillarId).then((v) => v ? p.pillarId : null)))
      .then((results) => setValidatedPillars(results.filter(Boolean) as string[]))
      .catch((e) => setError(String(e)))
  }, [])

  const zones = useMemo(() => {
    const ids = completedIds
    const validated = validatedPillars
    return pillars.map((pillar, i) => {
      const total = pillar.notions.length
      const completedCount = ids ? pillar.notions.filter((n) => ids.includes(n.id)).length : 0
      const progress = total > 0 ? (completedCount / total) * 100 : 0
      return {
        pillarId: pillar.pillarId,
        title: pillar.title,
        subtitle: pillar.subtitle,
        icon: pillar.icon,
        progress,
        notionCount: total,
        completedCount,
        validated: validated ? validated.includes(pillar.pillarId) : false,
        color: pillar.color,
        index: i,
      }
    })
  }, [completedIds, validatedPillars])

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-8 animate-fade-in">
      {/* En-tête */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl animate-float" role="img" aria-label="vibewiki">{"\uD83E\uDE9C"}</span>
          <div>
            <h1 className="font-heading text-3xl font-bold text-marine tracking-tight">
              Mon Territoire
            </h1>
            <p className="font-body text-sm text-ink/50">
              Explorez chaque zone pour progresser
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-xl bg-alert/10 border border-alert/30 p-3 font-mono text-xs text-alert">
          {error}
        </div>
      )}

      {/* Barre de stats glassmorphique */}
      <div className="glass-strong rounded-2xl p-5 mb-8 animate-slide-up">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-marine">{state.xp}</p>
            <p className="font-body text-[10px] uppercase tracking-wider text-ink/40">XP</p>
          </div>
          <div className="text-center border-l border-ink/5">
            <p className="font-heading text-2xl font-bold text-compass">{state.streakDays}</p>
            <p className="font-body text-[10px] uppercase tracking-wider text-ink/40">Streak</p>
          </div>
          <div className="text-center border-l border-ink/5">
            <div className="flex justify-center">
              <Hearts current={state.hearts} />
            </div>
            <p className="font-body text-[10px] uppercase tracking-wider text-ink/40">Cœurs</p>
          </div>
          <div className="text-center border-l border-ink/5">
            <p className="font-heading text-2xl font-bold text-moss">{state.league || "Bronze"}</p>
            <p className="font-body text-[10px] uppercase tracking-wider text-ink/40">Ligue</p>
          </div>
        </div>
      </div>

      {/* Carte du territoire */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px flex-1 bg-gradient-to-r from-ink/10 to-transparent" />
          <span className="font-heading text-xs uppercase tracking-widest text-ink/30">Carte des zones</span>
          <span className="h-px flex-1 bg-gradient-to-l from-ink/10 to-transparent" />
        </div>
        <TerritoryMap zones={zones} />
      </div>

      <BottomNav />
    </div>
  )
}
