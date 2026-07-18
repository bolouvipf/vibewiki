"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/ui/bottom-nav"
import { getTerm } from "@/lib/db/queries"
import type { Term } from "@/lib/db/schema"

const pillarLabels: Record<Term["pillar"], string> = {
  transversal: "Outils transversaux",
  front: "Frontend",
  back: "Backend",
  database: "Base de donn\u00E9es",
}

const masteryLabels: Record<Term["masteryLevel"], string> = {
  decouvert: "D\u00E9couvert",
  en_cours: "En cours",
  maitrise: "Ma\u00EEtris\u00E9",
}

const pillarIcons: Record<string, string> = {
  transversal: "\u2699\uFE0F",
  front: "\uD83C\uDFA8",
  back: "\u2699\uFE0F",
  database: "\uD83D\uDCC4",
}

export default function TermPage() {
  const params = useParams()
  const termId = params.termId as string
  const [term, setTerm] = useState<Term | null | undefined>(undefined)

  useEffect(() => {
    getTerm(termId).then(setTerm)
  }, [termId])

  if (term === undefined) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <p className="font-body text-ink/40">Chargement...</p>
        <BottomNav />
      </div>
    )
  }

  if (term === null) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <div className="flex flex-col items-center pt-20">
          <span className="text-5xl mb-4">\uD83D\uDD0D</span>
          <p className="font-body text-ink/50 mb-6">Terme non trouv\u00E9</p>
          <Link href="/dictionnaire">
            <Button variant="secondary" size="sm">Retour au dictionnaire</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <header className="mb-6">
        <Link href="/dictionnaire" className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au dictionnaire
        </Link>
      </header>

      <Card variant="premium">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="pillar" pillar={term.pillar}>
                {pillarIcons[term.pillar]} {pillarLabels[term.pillar]}
              </Badge>
              <Badge variant="mastery" level={term.masteryLevel}>
                {masteryLabels[term.masteryLevel]}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold text-marine mt-2">{term.term}</h1>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-terrain/50 rounded-xl p-4">
            <h2 className="font-heading text-xs uppercase tracking-widest text-ink/30 mb-2">D\u00E9finition</h2>
            <p className="font-body text-sm leading-relaxed text-ink">{term.shortDefinition}</p>
          </div>

          <div>
            <h2 className="font-heading text-xs uppercase tracking-widest text-ink/30 mb-2">\u00C0 quoi \u00E7a sert concr\u00E8tement</h2>
            <p className="font-body text-sm leading-relaxed text-ink/70">{term.practicalMeaning}</p>
          </div>

          {term.example && (
            <div className="bg-marine/5 rounded-xl border border-marine/10 p-4">
              <h2 className="font-heading text-xs uppercase tracking-widest text-ink/30 mb-2">Exemple</h2>
              <p className="font-body text-sm italic leading-relaxed text-ink/80">
                &ldquo;{term.example}&rdquo;
              </p>
            </div>
          )}

          {term.firstSeenAt && (
            <div className="pt-2 border-t border-ink/5 flex items-center justify-between text-[10px] text-ink/30 font-body">
              <span>D\u00E9couvert le {new Date(term.firstSeenAt).toLocaleDateString("fr-FR")}</span>
              {term.masteredAt && (
                <span>Ma\u00EEtris\u00E9 le {new Date(term.masteredAt).toLocaleDateString("fr-FR")}</span>
              )}
            </div>
          )}
        </div>
      </Card>

      <BottomNav />
    </div>
  )
}
