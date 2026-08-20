"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Hearts } from "@/components/ui/hearts"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { TerritoryMap } from "@/components/territoire/map"
import { getGamificationState, type DailyChallenge } from "@/lib/gamification/engine"
import { getProgress, isPillarValidated, isParcoursUnlocked, migrateProgress, passParcours } from "@/lib/db/queries"
import pillar0 from "@/content/piliers/00-parcours.json"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"
import pillar5 from "@/content/piliers/05-ia.json"

const pillars = [pillar0, pillar1, pillar2, pillar3, pillar4, pillar5]

export default function HomePage() {
  const [state, setState] = useState({ xp: 0, streakDays: 0, hearts: 5, league: "", completedNotions: 0 })
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [completedIds, setCompletedIds] = useState<readonly string[]>([])
  const [validatedPillars, setValidatedPillars] = useState<readonly string[]>([])
  const [parcoursUnlocked, setParcoursUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    migrateProgress()
    isParcoursUnlocked().then(setParcoursUnlocked)
    getGamificationState()
      .then((s) => {
        setState({ xp: s.xp, streakDays: s.streakDays, hearts: s.hearts, league: s.league, completedNotions: s.completedNotions })
        setDailyChallenge(s.dailyChallenge)
      })
      .catch((e) => setError(String(e)))
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
      const locked =
        pillar.pillarId !== "parcours" &&
        !parcoursUnlocked &&
        !(validated ? validated.includes(pillar.pillarId) : false)
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
        locked,
      }
    })
  }, [completedIds, validatedPillars, parcoursUnlocked])

  async function handlePassParcours() {
    await passParcours()
    setParcoursUnlocked(true)
  }

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

      {/* Défi du jour */}
      {dailyChallenge && (
        <div className="mb-6 rounded-xl border-2 border-[#D9A441] bg-white p-4 animate-slide-up">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D9A441]">
            🔥 Défi du jour
          </div>
          <div className="mt-1 font-heading text-lg font-bold text-marine">{dailyChallenge.title}</div>
          <p className="font-body text-sm text-ink/50">{dailyChallenge.description}</p>
          <p className="mt-1 font-body text-xs font-semibold text-moss">Récompense : +{dailyChallenge.reward} XP</p>
        </div>
      )}

      {/* Carte du territoire */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px flex-1 bg-gradient-to-r from-ink/10 to-transparent" />
          <span className="font-heading text-xs uppercase tracking-widest text-ink/30">Carte des zones</span>
          <span className="h-px flex-1 bg-gradient-to-l from-ink/10 to-transparent" />
        </div>
        {!parcoursUnlocked && (
          <div className="mb-5 rounded-2xl border-2 border-[#1E2D4F]/30 bg-gradient-to-br from-[#1E2D4F]/10 via-white to-[#D9A441]/10 p-5 animate-slide-up">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1E2D4F] text-xl text-white shadow-sm">🧭</span>
              <div className="flex-1">
                <p className="font-heading text-base font-bold text-marine">Bienvenue ! Commençons par la carte du territoire</p>
                <p className="mt-1 font-body text-sm text-ink/60">
                  3 notions courtes pour savoir où vivent les choses, vérifier ton IA et comprendre le vocabulaire des devs.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href="/piliers/parcours">
                    <Button size="sm" className="bg-[#1E2D4F] text-white hover:bg-[#1E2D4F]/90">Commencer le parcours</Button>
                  </Link>
                  <button
                    onClick={handlePassParcours}
                    className="rounded-lg border border-ink/10 bg-white px-3 py-2 font-body text-xs font-medium text-ink/50 transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    Je connais déjà, passer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <TerritoryMap zones={zones} />
      </div>

      {/* Liens utiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
        <Link
          href="/formations"
          className="group rounded-xl border-2 border-dashed border-compass/30 bg-compass/5 p-4 transition-all duration-200 hover:border-compass/60 hover:bg-compass/10"
        >
          <p className="font-heading text-base font-bold text-marine group-hover:text-compass transition-colors">
            🎓 Formations
          </p>
          <p className="mt-1 font-body text-xs text-ink/50">
            Des vidéos animées par des devs, pour aller plus loin. Bientôt.
          </p>
        </Link>
        <Link
          href="/retour"
          className="group rounded-xl border-2 border-dashed border-moss/30 bg-moss/5 p-4 transition-all duration-200 hover:border-moss/60 hover:bg-moss/10"
        >
          <p className="font-heading text-base font-bold text-marine group-hover:text-moss transition-colors">
            💬 Faire un retour
          </p>
          <p className="mt-1 font-body text-xs text-ink/50">
            Testeur ? Un bug, une idée, un avis — on t'écoute.
          </p>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
