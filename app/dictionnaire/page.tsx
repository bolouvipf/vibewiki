"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/ui/bottom-nav"
import { getAllTerms, searchTerms } from "@/lib/db/queries"
import { getMasteryEmoji, getMasteryStage } from "@/lib/gamification/engine"
import type { Term } from "@/lib/db/schema"

const PILLARS: { label: string; value: Term["pillar"] | null }[] = [
  { label: "Tous", value: null },
  { label: "Transversal", value: "transversal" },
  { label: "Frontend", value: "front" },
  { label: "Backend", value: "back" },
  { label: "Database", value: "database" },
]

const MASTERY_LABELS: Record<string, string> = {
  decouvert: "D\u00E9couvert",
  en_cours: "En cours",
  maitrise: "Ma\u00EEtrise",
}

export default function DictionnairePage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [query, setQuery] = useState("")
  const [pillar, setPillar] = useState<string | null>(null)
  const [mastery, setMastery] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const results = query ? await searchTerms(query) : await getAllTerms()
      setTerms(results)
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => { getAllTerms().then(setTerms) }, [])

  const filtered = useMemo(() => {
    let result = terms
    if (pillar) result = result.filter((t) => t.pillar === pillar)
    if (mastery) result = result.filter((t) => t.masteryLevel === mastery)
    return result
  }, [terms, pillar, mastery])

  return (
    <main className="mx-auto min-h-screen max-w-lg md:max-w-2xl lg:max-w-4xl px-4 pb-24 pt-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-marine tracking-tight mb-1">Dictionnaire</h1>
        <p className="font-body text-sm text-ink/50">Votre carnet de bord personnel</p>
      </header>

      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Rechercher un terme..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-ink/10 bg-white pl-11 pr-4 py-3.5 font-body text-sm text-ink placeholder-ink/30 shadow-sm outline-none transition-all duration-200 focus:border-compass/50 focus:ring-2 focus:ring-compass/10"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PILLARS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPillar(p.value)}
            className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition-all duration-200 ${
              pillar === p.value
                ? "bg-marine text-white shadow-sm"
                : "bg-white text-ink/40 border border-ink/10 hover:border-marine/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { label: "Tous", value: null },
          { label: "D\u00E9couvert", value: "decouvert" },
          { label: "En cours", value: "en_cours" },
          { label: "Ma\u00EEtrise", value: "maitrise" },
        ].map((m) => (
          <button
            key={m.label}
            onClick={() => setMastery(m.value)}
            className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition-all duration-200 ${
              mastery === m.value
                ? "bg-moss text-white shadow-sm"
                : "bg-white text-ink/40 border border-ink/10 hover:border-moss/30"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((term) => (
          <Link key={term.id} href={`/dictionnaire/${term.id}`}>
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-sm font-medium text-marine truncate">
                    <span className="mr-2 text-base">{getMasteryEmoji(getMasteryStage(term))}</span>
                    {term.term}
                  </h3>
                  <p className="mt-1 font-body text-xs text-ink/50 leading-relaxed line-clamp-2">
                    {term.shortDefinition}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="pillar" pillar={term.pillar}>
                  {term.pillar}
                </Badge>
                <Badge variant="mastery" level={term.masteryLevel}>
                  {MASTERY_LABELS[term.masteryLevel]}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="pt-12 text-center">
            <span className="text-4xl block mb-3">\uD83D\uDCDD</span>
            <p className="font-body text-sm text-ink/30">Aucun terme trouv\u00E9</p>
            <p className="font-body text-xs text-ink/20 mt-1">Les termes apparaissent apr\u00E8s avoir compl\u00E9t\u00E9 des le\u00E7ons</p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
