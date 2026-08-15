"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hearts } from "@/components/ui/hearts"
import { BottomNav } from "@/components/ui/bottom-nav"
import { QcmContextualise } from "@/components/notions/qcm-contextualise"
import { VraiFaux } from "@/components/notions/vrai-faux"
import { ReperageSupposition } from "@/components/notions/reperage-supposition"
import { AssociationTerritoire } from "@/components/notions/association-territoire"
import { RemiseEnOrdre } from "@/components/notions/remise-en-ordre"
import { QuestionVerification } from "@/components/notions/question-verification"
import {
  validateQCM,
  validateVraiFaux,
  validateReperage,
  validateAssociation,
  validateRemiseEnOrdre,
  validateQuestionVerification,
} from "@/lib/exercises/validators"
import { getProgress, isPillarValidated, updateProgress, validatePillar } from "@/lib/db/queries"
import {
  addExerciseXp,
  addNotionBonusXp,
  checkBadges,
  loseHeart,
  trackSessionTimes,
  updateCombo,
  updateStreak,
  getGamificationState,
} from "@/lib/gamification/engine"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"

const pillars = [pillar1, pillar2, pillar3, pillar4]

const pillarAccents: Record<string, { primary: string; light: string; text: string }> = {
  transversal: { primary: "bg-marine", light: "bg-marine/10", text: "text-marine" },
  front: { primary: "bg-compass", light: "bg-compass/10", text: "text-compass" },
  back: { primary: "bg-alert", light: "bg-alert/10", text: "text-alert" },
  database: { primary: "bg-moss", light: "bg-moss/10", text: "text-moss" },
}

export default function ValidationPage() {
  const params = useParams()
  const pillarId = params.pillarId as string
  const pillar = pillars.find((p) => p.pillarId === pillarId)

  const [currentEx, setCurrentEx] = useState(0)
  const [hearts, setHearts] = useState(5)
  const [xp, setXp] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [alreadyValidated, setAlreadyValidated] = useState(false)
  const [lastHeartLost, setLastHeartLost] = useState(false)
  const [sessionTracked, setSessionTracked] = useState(false)

  useEffect(() => {
    getGamificationState().then((s) => setHearts(s.hearts))
    isPillarValidated(pillarId).then(setAlreadyValidated)
  }, [pillarId])

  const handleAnswer = useCallback(
    async (result: { correct: boolean } | { correct: boolean; correctIndex?: number; correctAnswer?: string }) => {
      if (!pillar) return

      setAnswers((prev) => [...prev, result.correct])

      if (result.correct) {
        const comboResult = await updateCombo(true)
        const r = await addExerciseXp(true, comboResult.combo)
        setXp(r.xp)

        if (pillar.validationExercises[currentEx]?.type === "reperage_supposition") {
          const p = await getProgress()
          await updateProgress({ suppositionsSpotted: (p.suppositionsSpotted || 0) + 1 })
        }
        if (lastHeartLost) {
          setLastHeartLost(false)
          const p = await getProgress()
          await updateProgress({ rescueCount: (p.rescueCount || 0) + 1 })
        }
        if (!sessionTracked) {
          setSessionTracked(true)
          await trackSessionTimes()
        }
      } else {
        await updateCombo(false)
        const h = await loseHeart()
        setHearts(h.hearts)
        if (h.isEmpty) setLastHeartLost(true)
      }

      if (currentEx < pillar.validationExercises.length - 1) {
        setCurrentEx((prev) => prev + 1)
      } else {
        const correctCount = [...answers, result.correct].filter(Boolean).length
        const wasPerfect = correctCount === pillar.validationExercises.length

        if (correctCount >= Math.ceil(pillar.validationExercises.length / 2)) {
          await addNotionBonusXp(wasPerfect)
          await validatePillar(pillarId)
        }
        if (wasPerfect) {
          const p = await getProgress()
          await updateProgress({ perfectExercises: (p.perfectExercises || 0) + 1 })
        }

        await updateStreak()
        await checkBadges()
        const finalState = await getGamificationState()
        setXp(finalState.xp)
        setHearts(finalState.hearts)
        setFinished(true)
      }
    },
    [currentEx, pillar, pillarId, answers, lastHeartLost, sessionTracked],
  )

  if (!pillar) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <p className="font-body text-ink/50">Pilier introuvable.</p>
        <Link href="/">
          <Button variant="secondary" size="sm" className="mt-4">Retour</Button>
        </Link>
        <BottomNav />
      </div>
    )
  }

  const colors = pillarAccents[pillar.pillarId]
  const exercises = pillar.validationExercises
  const exercise = exercises[currentEx]
  const totalEx = exercises.length
  const correctCount = answers.filter(Boolean).length
  const passed = correctCount >= Math.ceil(totalEx / 2)

  if (finished) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center pt-16 text-center">
          <span className="text-7xl mb-6 animate-float">{passed ? "\uD83C\uDF1F" : "\uD83D\uDCAF"}</span>
          <h1 className="font-heading text-2xl font-bold text-marine mb-2">
            {passed ? "Pilier validé !" : "Validation non réussie"}
          </h1>
          <p className="font-body text-sm text-ink/50 mb-2">{correctCount}/{totalEx} bonnes réponses</p>
          {passed && (
            <p className="font-body text-sm text-moss mb-4">Ce pilier est maintenant marqué comme validé.</p>
          )}
          <div className="glass-strong rounded-2xl p-5 mt-4 mb-8 w-full max-w-xs">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-marine">{xp}</p>
                <p className="font-body text-[10px] uppercase tracking-wider text-ink/40">XP Total</p>
              </div>
              <div className="text-center">
                <Hearts current={hearts} />
                <p className="font-body text-[10px] uppercase tracking-wider text-ink/40 mt-1">Cœurs</p>
              </div>
            </div>
          </div>
          <Link href={`/piliers/${pillarId}`}>
            <Button variant="primary" size="lg">Retour au pilier</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <div className="mb-6">
        <Link href={`/piliers/${pillarId}`} className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {pillar.title}
        </Link>

        <div className="flex items-center justify-between mb-3">
          <h1 className="font-heading text-lg font-bold text-marine">Validation finale</h1>
          <div className="flex items-center gap-2">
            <Hearts current={hearts} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-ink/5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ease-out ${colors.primary}`}
              style={{ width: `${(currentEx / totalEx) * 100}%` }} />
          </div>
          <span className="font-body text-xs text-ink/30 w-12 text-right">{currentEx + 1}/{totalEx}</span>
        </div>

        <p className="font-body text-xs text-ink/40 mt-3">Réussissez ces 3 exercices pour valider le pilier.</p>
      </div>

      <div className="animate-scale-in" key={currentEx}>
        {exercise.type === "qcm_contextualise" && (
          <QcmContextualise
            prompt={exercise.prompt}
            options={(exercise.payload as { options: string[]; correctIndex: number }).options}
            correctIndex={(exercise.payload as { options: string[]; correctIndex: number }).correctIndex}
            onAnswer={(i) => handleAnswer(validateQCM(exercise.payload, i))}
            disabled={false}
          />
        )}
        {exercise.type === "vrai_faux_pas_verifiable" && (
          <VraiFaux
            affirmation={(exercise.payload as { affirmation: string; correctAnswer: string }).affirmation}
            correctAnswer={(exercise.payload as { affirmation: string; correctAnswer: "vrai" | "faux" | "pas_verifiable" }).correctAnswer}
            onAnswer={(a) => handleAnswer(validateVraiFaux(exercise.payload, a))}
            disabled={false}
          />
        )}
        {exercise.type === "reperage_supposition" && (
          <ReperageSupposition
            text={(exercise.payload as { text: string; suppositionStart: number; suppositionEnd: number }).text}
            suppositionStart={(exercise.payload as { text: string; suppositionStart: number; suppositionEnd: number }).suppositionStart}
            suppositionEnd={(exercise.payload as { text: string; suppositionStart: number; suppositionEnd: number }).suppositionEnd}
            onAnswer={(s, e) => handleAnswer(validateReperage(exercise.payload, s, e))}
            disabled={false}
          />
        )}
        {exercise.type === "association_territoire" && (
          <AssociationTerritoire
            term={(exercise.payload as { term: string; correctPlace: string; places: string[] }).term}
            correctPlace={(exercise.payload as { term: string; correctPlace: string; places: string[] }).correctPlace}
            onAnswer={(p) => handleAnswer(validateAssociation(exercise.payload, p))}
            disabled={false}
          />
        )}
        {exercise.type === "remise_en_ordre" && (
          <RemiseEnOrdre
            steps={(exercise.payload as { steps: string[]; correctOrder: number[] }).steps}
            correctOrder={(exercise.payload as { steps: string[]; correctOrder: number[] }).correctOrder}
            onAnswer={(o) => handleAnswer(validateRemiseEnOrdre(exercise.payload, o))}
            disabled={false}
          />
        )}
        {exercise.type === "question_de_verification" && (
          <QuestionVerification
            affirmation={exercise.prompt}
            options={(exercise.payload as { affirmation: string; options: string[]; correctIndex: number }).options}
            correctIndex={(exercise.payload as { affirmation: string; options: string[]; correctIndex: number }).correctIndex}
            onAnswer={(i) => handleAnswer(validateQuestionVerification(exercise.payload, i))}
            disabled={false}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
