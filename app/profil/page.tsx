"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Hearts } from "@/components/ui/hearts"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/ui/bottom-nav"
import { getGamificationState } from "@/lib/gamification/engine"
import { getDueReviews } from "@/lib/db/queries"
import { BadgeGrid } from "@/components/profil/BadgeGrid"

const LEAGUES = [
  { name: "Bronze", minXp: 0, color: "text-amber-700", bar: "bg-amber-600", icon: "\uD83E\uDD47" },
  { name: "Argent", minXp: 100, color: "text-gray-500", bar: "bg-gray-400", icon: "\uD83E\uDD48" },
  { name: "Or", minXp: 300, color: "text-yellow-600", bar: "bg-yellow-500", icon: "\uD83E\uDD49" },
  { name: "Saphir", minXp: 600, color: "text-blue-600", bar: "bg-blue-500", icon: "\uD83D\uDC8E" },
  { name: "Diamant", minXp: 1000, color: "text-cyan-600", bar: "bg-cyan-400", icon: "\uD83D\uDC8E" },
]

function leagueProgress(xp: number) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXp) {
      if (i === LEAGUES.length - 1) return { current: LEAGUES[i], next: null, progress: 1 }
      const current = LEAGUES[i]
      const next = LEAGUES[i + 1]
      const range = next.minXp - current.minXp
      const progress = (xp - current.minXp) / range
      return { current, next, progress }
    }
  }
  return { current: LEAGUES[0], next: LEAGUES[1], progress: 0 }
}

export default function ProfilPage() {
  const [state, setState] = useState<Awaited<ReturnType<typeof getGamificationState>> | null>(null)
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    getGamificationState().then(setState)
    getDueReviews().then((reviews) => setDueCount(reviews.length))
  }, [])

  if (!state) {
    return (
    <main className="mx-auto min-h-screen max-w-lg md:max-w-2xl lg:max-w-4xl px-4 pb-24 pt-8 animate-fade-in">
        <p className="pt-20 text-center font-body text-sm text-ink/30">Chargement...</p>
      </main>
    )
  }

  const { current, next, progress } = leagueProgress(state.xp)

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-marine tracking-tight">Profil</h1>
        <p className="font-body text-sm text-ink/50">Votre progression et statistiques</p>
      </header>

      {/* Carte XP / Ligue */}
      <Card variant="premium" className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <p className="font-heading text-lg font-semibold text-marine">{state.league}</p>
              <p className="font-body text-xs text-ink/40">Ligue actuelle</p>
            </div>
          </div>
          <Badge variant="pillar" pillar="transversal">{current.name}</Badge>
        </div>

        <div className="text-center py-2">
          <p className="font-heading text-5xl font-bold text-marine">{state.xp.toLocaleString()}</p>
          <p className="font-body text-xs text-ink/40 uppercase tracking-wider mt-1">XP total</p>
        </div>

        {next ? (
          <div className="mt-5">
            <div className="flex justify-between font-body text-xs text-ink/40 mb-1.5">
              <span className="flex items-center gap-1">{current.icon} {current.name}</span>
              <span className="flex items-center gap-1">{next.icon} {next.name}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/5">
              <div
                className={`h-full rounded-full ${current.bar} transition-all duration-700 ease-out`}
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 font-body text-xs text-ink/30 text-right">
              {next.minXp - state.xp} XP jusqu&apos;\u00E0 {next.name}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-center font-body text-sm text-compass">\uD83C\uDF1F Ligue maximale atteinte !</p>
        )}
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-white border border-ink/5 p-4 text-center shadow-sm">
          <span className="text-3xl">\uD83D\uDD25</span>
          <p className="mt-2 font-heading text-xl font-bold text-marine">{state.streakDays}</p>
          <p className="font-body text-[10px] text-ink/40 uppercase tracking-wider">jours</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink/5 p-4 text-center shadow-sm">
          <div className="flex justify-center">
            <Hearts current={state.hearts} />
          </div>
          <p className="mt-2 font-heading text-xl font-bold text-marine">{state.hearts}</p>
          <p className="font-body text-[10px] text-ink/40 uppercase tracking-wider">c\u0153urs</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink/5 p-4 text-center shadow-sm">
          <span className="text-3xl">\uD83D\uDCD6</span>
          <p className="mt-2 font-heading text-xl font-bold text-marine">{state.completedNotions}</p>
          <p className="font-body text-[10px] text-ink/40 uppercase tracking-wider">notions</p>
        </div>
        <div className="rounded-2xl bg-white border border-ink/5 p-4 text-center shadow-sm">
          <span className="text-3xl">\uD83D\uDD04</span>
          <p className="mt-2 font-heading text-xl font-bold text-marine">{dueCount}</p>
          <p className="font-body text-[10px] text-ink/40 uppercase tracking-wider">{"\u00E0 r\u00E9viser"}</p>
        </div>
      </div>

      {/* Liste des ligues */}
      <h2 className="font-heading text-sm font-semibold text-ink/60 mb-3 uppercase tracking-wider">Ligues</h2>
      <div className="space-y-2">
        {LEAGUES.map((league) => {
          const isCurrent = league.name === current.name
          return (
            <div
              key={league.name}
              className={`flex items-center justify-between rounded-xl bg-white border px-4 py-3 shadow-sm transition-all duration-200 ${
                isCurrent ? "border-compass/30 ring-1 ring-compass/10" : "border-ink/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{league.icon}</span>
                <span className={`font-heading text-sm ${league.color} ${isCurrent ? "font-bold" : ""}`}>
                  {league.name}
                </span>
              </div>
              <span className="font-body text-xs text-ink/30">
                {league.minXp === 0 ? "D\u00E9part" : `${league.minXp} XP`}
                {isCurrent && next && (
                  <span className="ml-1 text-compass font-medium">{Math.round(progress * 100)}%</span>
                )}
                {isCurrent && !next && <span className="ml-1 text-moss">\u2705</span>}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mode Urgence */}
      <Link href="/urgence" className="block mb-6">
        <div className="rounded-2xl border-2 border-alert/20 bg-alert/5 p-4 transition-all duration-200 hover:border-alert/40 hover:shadow-md">
          <p className="font-heading text-sm font-bold text-alert">🚨 Mode Urgence</p>
          <p className="font-body text-xs text-ink/50 mt-1">
            Votre site est en panne ? Entraînez-vous à réagir face aux crises.
          </p>
        </div>
      </Link>

      {/* Combo du jour */}
      {state.currentCombo > 0 && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-compass/10 to-moss/10 border border-compass/20 p-4">
          <p className="font-heading text-sm font-bold text-marine">
            🔥 Combo actuel : x{state.currentCombo}
          </p>
          <p className="font-body text-xs text-ink/50 mt-1">
            Enchaînez 10 bonnes réponses pour gagner un cœur bonus.
          </p>
        </div>
      )}

      {/* Badges */}
      <h2 className="font-heading text-sm font-semibold text-ink/60 mb-3 uppercase tracking-wider">
        Badges {state.badges.length > 0 && <span className="text-compass">· {state.badges.length}/{10}</span>}
      </h2>
      <div className="mb-8">
        <BadgeGrid unlockedIds={state.badges} />
      </div>

      <BottomNav />
    </main>
  )
}
