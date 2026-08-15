"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/ui/bottom-nav"
import {
  getRandomEmergencyScenario,
  validateEmergencyAnswer,
  type EmergencyScenario,
} from "@/lib/exercises/emergency-scenarios"
import { addEmergencyXp } from "@/lib/gamification/engine"
import { getProgress, updateProgress } from "@/lib/db/queries"

export default function UrgencePage() {
  const [scenario, setScenario] = useState<EmergencyScenario>(() => getRandomEmergencyScenario())
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof validateEmergencyAnswer> | null>(null)

  const handleAnswer = async (index: number) => {
    if (answered) return
    const res = validateEmergencyAnswer(scenario.id, index)
    setSelected(index)
    setResult(res)
    setAnswered(true)
    if (res.correct) {
      await addEmergencyXp(true)
      const p = await getProgress()
      await updateProgress({ emergencySuccess: (p.emergencySuccess || 0) + 1 })
    }
  }

  const nextScenario = () => {
    setScenario(getRandomEmergencyScenario())
    setSelected(null)
    setResult(null)
    setAnswered(false)
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <div className="mb-6">
        <Link href="/profil" className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Profil
        </Link>

        <h1 className="font-heading text-2xl font-bold text-marine">🚨 Mode Urgence</h1>
        <p className="font-body text-sm text-ink/50 mt-1">
          Votre site est en panne, vos données fuient. Que faites-vous ?
        </p>
      </div>

      <div className="animate-scale-in" key={scenario.id}>
        <div className="rounded-2xl border-2 border-alert/20 bg-alert/5 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-alert mb-2">
            {scenario.title}
          </p>
          <p className="font-body text-sm leading-relaxed text-ink/80">{scenario.context}</p>
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-5 shadow-sm">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-2">
            L&apos;assistant IA propose
          </p>
          <p className="font-body text-sm italic leading-relaxed text-ink/70">&ldquo;{scenario.iaMessage}&rdquo;</p>
        </div>

        <div className="mt-5 space-y-3">
          {scenario.options.map((option, i) => {
            const isSelected = selected === i
            let style = "border-ink/10 bg-white hover:border-marine/40 hover:shadow-md"
            if (answered) {
              if (option.isCorrect) style = "border-moss/40 bg-moss/10"
              else if (isSelected) style = "border-alert/40 bg-alert/10"
              else style = "border-ink/5 bg-white opacity-50"
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`w-full rounded-2xl border-2 p-4 text-left font-body text-sm text-ink/80 transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none ${style}`}
              >
                {option.text}
              </button>
            )
          })}
        </div>

        {result && (
          <div className={`mt-5 rounded-2xl border p-4 animate-scale-in ${
            result.correct ? "border-moss/30 bg-moss/10" : "border-alert/30 bg-alert/10"
          }`}>
            <p className="font-body text-sm leading-relaxed text-ink/80">{result.consequence}</p>
            <p className="mt-2 font-body text-xs font-semibold text-ink/50">
              {result.correct ? `+${result.xpReward} XP` : `${result.xpReward} XP`}
            </p>
          </div>
        )}

        {answered && (
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={nextScenario}>
            Scénario suivant
          </Button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
