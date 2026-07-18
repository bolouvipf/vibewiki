"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/ui/bottom-nav"
import { getProgress, isPillarValidated } from "@/lib/db/queries"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"

const pillars = [pillar1, pillar2, pillar3, pillar4]

const pillarColors: Record<string, { primary: string; light: string; text: string }> = {
  transversal: { primary: "bg-marine", light: "bg-marine/10", text: "text-marine" },
  front: { primary: "bg-compass", light: "bg-compass/10", text: "text-compass" },
  back: { primary: "bg-alert", light: "bg-alert/10", text: "text-alert" },
  database: { primary: "bg-moss", light: "bg-moss/10", text: "text-moss" },
}

export default function PillarPage() {
  const params = useParams()
  const pillarId = params.pillarId as string
  const pillar = pillars.find((p) => p.pillarId === pillarId)

  const [completedIds, setCompletedIds] = useState<readonly string[]>([])
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    getProgress().then((p) => setCompletedIds(p.completedNotionIds))
    isPillarValidated(pillarId).then(setValidated)
  }, [pillarId])

  if (!pillar) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <p className="font-body text-ink/50">Pilier introuvable.</p>
        <Link href="/">
          <Button variant="secondary" size="sm" className="mt-4">Retour</Button>
        </Link>
        <BottomNav />
      </div>
    )
  }

  const sorted = useMemo(() => [...pillar.notions].sort((a, b) => a.order - b.order), [pillar])
  const colors = pillarColors[pillar.pillarId]
  const ids = completedIds
  const completedCount = ids ? sorted.filter((n) => ids.includes(n.id)).length : 0
  const totalCount = sorted.length

  return (
    <div className="mx-auto min-h-screen max-w-lg md:max-w-2xl lg:max-w-6xl px-4 pb-24 pt-8 animate-fade-in">
      <header className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mon territoire
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="flex size-12 items-center justify-center rounded-2xl text-2xl shadow-sm" style={{ backgroundColor: colors.light }}>
            {pillar.icon}
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-marine tracking-tight">{pillar.title}</h1>
            <p className="font-body text-sm text-ink/50">{pillar.subtitle}</p>
          </div>
        </div>

        {/* Progression */}
        <div className="mt-5 flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-ink/5">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-body text-xs text-ink/40 uppercase tracking-wider">Notions</span>
              <span className="font-heading text-sm font-semibold text-marine">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ease-out ${colors.primary}`}
                style={{ width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%` }} />
            </div>
          </div>
        </div>

        {validated && (
          <div className="mt-3 rounded-xl bg-moss/10 p-3 text-center">
            <p className="font-body text-sm font-medium text-moss">Pilier validé !</p>
          </div>
        )}
      </header>

      {/* Fiche technique */}
      <Card variant="premium" className="mb-6">
        <div className={`-mx-6 -mt-6 mb-4 px-6 pt-4 pb-3 ${colors.light}`}>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-ink/40">Fiche technique</p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1">Qu'est-ce que c'est ?</p>
            <p className="font-body text-sm leading-relaxed text-ink/70">{pillar.technicalSheet.explanation}</p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1">Pourquoi c'est utile ?</p>
            <p className="font-body text-sm leading-relaxed text-ink/70">{pillar.technicalSheet.utility}</p>
          </div>
        </div>
      </Card>

      {/* Liste des notions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-px flex-1 bg-gradient-to-r from-ink/10 to-transparent" />
          <span className="font-heading text-xs uppercase tracking-widest text-ink/30">Notions</span>
          <span className="h-px flex-1 bg-gradient-to-l from-ink/10 to-transparent" />
        </div>

        {sorted.map((notion, i) => {
          const done = ids ? ids.includes(notion.id) : false
          return (
            <Link
              key={notion.id}
              href={`/piliers/${pillarId}/notions/${notion.id}`}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`animate-slide-up block rounded-xl border border-ink/5 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${done ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${done ? "bg-moss/10 text-moss" : `${colors.light} ${colors.text}`}`}>
                  {done ? "\u2713" : notion.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-base font-semibold ${done ? "text-ink/40" : "text-ink"}`}>{notion.title}</h3>
                  <p className="font-body text-xs text-ink/40 mt-0.5">{notion.exercises.length} exercice{notion.exercises.length > 1 ? "s" : ""}</p>
                </div>
                <svg className={`size-4 shrink-0 transition-colors ${done ? "text-ink/20" : "text-ink/30"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Validation finale */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px flex-1 bg-gradient-to-r from-ink/10 to-transparent" />
            <span className="font-heading text-xs uppercase tracking-widest text-ink/30">Validation du pilier</span>
            <span className="h-px flex-1 bg-gradient-to-l from-ink/10 to-transparent" />
          </div>
          <Link href={`/piliers/${pillarId}/validation`}>
            <Button variant="accent" size="lg" className="w-full">
              {validated ? "Revoir la validation" : "Passer la validation finale"}
            </Button>
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
