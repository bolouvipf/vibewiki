"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hearts } from "@/components/ui/hearts"
import { BottomNav } from "@/components/ui/bottom-nav"
import { QcmContextualise } from "@/components/notions/qcm-contextualise"
import { VraiFaux } from "@/components/notions/vrai-faux"
import { ReperageSupposition } from "@/components/notions/reperage-supposition"
import { AssociationTerritoire } from "@/components/notions/association-territoire"
import { RemiseEnOrdre } from "@/components/notions/remise-en-ordre"
import { QuestionVerification } from "@/components/notions/question-verification"
import { DiscoveryCard } from "@/components/notions/discovery-card"
import {
  validateQCM,
  validateVraiFaux,
  validateReperage,
  validateAssociation,
  validateRemiseEnOrdre,
  validateQuestionVerification,
  getQcmPayload,
  getVraiFauxPayload,
  getReperagePayload,
  getAssociationPayload,
  getRemiseEnOrdrePayload,
  getQuestionVerificationPayload,
} from "@/lib/exercises/validators"
import { getProgress, addTerm, completeNotion, isNotionCompleted, updateProgress } from "@/lib/db/queries"
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
import pillar0 from "@/content/piliers/00-parcours.json"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"
import pillar5 from "@/content/piliers/05-ia.json"
import fiches from "@/content/ressources/fiches-reference.json"

const pillars = [pillar0, pillar1, pillar2, pillar3, pillar4, pillar5]

const pillarAccents: Record<string, { primary: string; light: string; text: string }> = {
  parcours: { primary: "bg-marine", light: "bg-marine/10", text: "text-marine" },
  transversal: { primary: "bg-marine", light: "bg-marine/10", text: "text-marine" },
  front: { primary: "bg-compass", light: "bg-compass/10", text: "text-compass" },
  back: { primary: "bg-alert", light: "bg-alert/10", text: "text-alert" },
  database: { primary: "bg-moss", light: "bg-moss/10", text: "text-moss" },
  ia: { primary: "bg-ink", light: "bg-ink/10", text: "text-ink" },
}

export default function NotionPage() {
  const params = useParams()
  const pillarId = params.pillarId as string
  const notionId = params.notionId as string

  const pillar = pillars.find((p) => p.pillarId === pillarId)
  const notion = pillar?.notions.find((n) => n.id === notionId)

  const matchingFiche = fiches.fiches.find((f) => {
    const ficheWords = new Set(
      f.term.toLowerCase().replace(/[^a-z\u00e0-\u00ff\s]/g, "").split(/\s+/).filter(Boolean),
    )
    const notionWords =
      notion?.term.toLowerCase().replace(/[^a-z\u00e0-\u00ff\s]/g, "").split(/\s+/).filter(Boolean) ?? []
    return notionWords.some((w) => w.length > 2 && ficheWords.has(w))
  })

  const [currentEx, setCurrentEx] = useState(0)
  const [hearts, setHearts] = useState(5)
  const [xp, setXp] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [discoveredTerms, setDiscoveredTerms] = useState<Set<string>>(new Set())
  const [showCourse, setShowCourse] = useState(true)
  const [lastHeartLost, setLastHeartLost] = useState(false)
  const [sessionTracked, setSessionTracked] = useState(false)

  const colors = pillarAccents[pillarId]

  useEffect(() => {
    getGamificationState().then((s) => setHearts(s.hearts))
    if (notionId) {
      isNotionCompleted(notionId).then(setAlreadyDone)
    }
  }, [notionId])

  const handleAnswer = useCallback(
    async (result: { correct: boolean } | { correct: boolean; correctIndex?: number; correctAnswer?: string }) => {
      if (!notion) return

      setAnswers((prev) => [...prev, result.correct])

      if (result.correct) {
        const comboResult = await updateCombo(true)
        const r = await addExerciseXp(true, comboResult.combo)
        setXp(r.xp)

        if (notion.exercises[currentEx]?.type === "reperage_supposition") {
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

      if (currentEx < notion.exercises.length - 1) {
        setCurrentEx((prev) => prev + 1)
      } else {
        const correctCount = [...answers, result.correct].filter(Boolean).length
        const wasPerfect = correctCount === notion.exercises.length

        if (correctCount >= Math.ceil(notion.exercises.length / 2)) {
          await addNotionBonusXp(wasPerfect)
          const relatedTerms = notion.exercises.flatMap((ex) => ex.relatedTermIds)
          await completeNotion(notionId, relatedTerms)

          const pillarTerms = pillar?.terms.filter((t) => relatedTerms.includes(t.id)) || []
          for (const term of pillarTerms) {
            await addTerm({
              id: term.id,
              term: term.term,
              shortDefinition: term.shortDefinition,
              practicalMeaning: term.practicalMeaning,
              example: term.example,
              pillar: pillarId as "parcours" | "transversal" | "front" | "back" | "database" | "ia",
              sourceNotionId: notionId,
            })
          }
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
    [currentEx, notion, notionId, answers, pillarId, pillar, lastHeartLost, sessionTracked],
  )

  if (!pillar || !notion) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <p className="font-body text-ink/50">Notion introuvable.</p>
        <Link href={`/piliers/${pillarId}`}>
          <Button variant="secondary" size="sm" className="mt-4">Retour</Button>
        </Link>
        <BottomNav />
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <span className="text-6xl mb-6">{"\u2705"}</span>
          <h1 className="font-heading text-2xl font-bold text-marine mb-2">Notion déjà complétée</h1>
          <p className="font-body text-sm text-ink/50 mb-8">Vous avez déjà terminé cette notion. Bravo !</p>
          <Link href={`/piliers/${pillarId}`}>
            <Button variant="primary">Continuer</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  const exercise = notion.exercises[currentEx]
  const totalEx = notion.exercises.length
  const correctCount = answers.filter(Boolean).length
  const passed = correctCount >= Math.ceil(totalEx / 2)

  const undiscoveredTermIds = exercise?.relatedTermIds.filter((id) => !discoveredTerms.has(id)) ?? []
  const nextTermToDiscover = undiscoveredTermIds.length > 0
    ? pillar?.terms.find((t) => t.id === undiscoveredTermIds[0]) ?? null
    : null

  const pillarAccentLight = `bg-${pillarId === "parcours" || pillarId === "transversal" ? "marine" : pillarId === "front" ? "compass" : pillarId === "back" ? "alert" : pillarId === "database" ? "moss" : "ink"}/10`

  if (finished) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center pt-16 text-center">
          <span className="text-7xl mb-6 animate-float">{passed ? "\uD83C\uDF1F" : "\uD83D\uDCAF"}</span>
          <h1 className="font-heading text-2xl font-bold text-marine mb-2">
            {passed ? "Notion complétée !" : "Notion terminée"}
          </h1>
          <p className="font-body text-sm text-ink/50 mb-2">{correctCount}/{totalEx} bonnes réponses</p>
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
          <h1 className="font-heading text-lg font-bold text-marine">{notion.title}</h1>
          <div className="flex items-center gap-2">
            <Hearts current={hearts} />
          </div>
        </div>

        {!showCourse && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-ink/5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${colors.primary}`}
                style={{ width: `${(currentEx / totalEx) * 100}%` }} />
            </div>
            <span className="font-body text-xs text-ink/30 w-12 text-right">{currentEx + 1}/{totalEx}</span>
          </div>
        )}
      </div>

      {showCourse ? (
        <div className="animate-scale-in">
          <Card variant="premium" className="mb-6 overflow-hidden">
            <div className={`-mx-6 -mt-6 mb-5 px-6 pt-5 pb-4 ${pillarAccentLight}`}>
              <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                {notion.term}
              </p>
              <p className="font-heading text-lg font-bold text-marine mt-1">Cours</p>
            </div>

            <div className="mb-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">Explication</p>
              <p className="font-body text-sm leading-relaxed text-ink/80">{notion.course.explanation}</p>
            </div>

            <div className="mb-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">Utilité concrète</p>
              <p className="font-body text-sm leading-relaxed text-ink/80">{notion.course.practicalMeaning}</p>
            </div>

            <div className="mb-6 rounded-lg bg-terrain/60 p-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-2">Exemple</p>
              <p className="font-body text-sm leading-relaxed italic text-ink/70">&ldquo;{notion.course.example}&rdquo;</p>
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={() => setShowCourse(false)}>
              Commencer les exercices
            </Button>
          </Card>

          {matchingFiche && (
            <Card className="mb-6 overflow-hidden">
              <div className={`-mx-6 -mt-6 mb-5 px-6 pt-5 pb-4 ${pillarAccentLight}`}>
                <p className="font-heading text-lg font-bold text-marine mt-1">📋 Fiche de référence</p>
              </div>
              <div className="mb-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">Analogie</p>
                <p className="font-body text-sm leading-relaxed text-ink/80">{matchingFiche.analogie}</p>
              </div>
              <div className="mb-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">Où ça vit</p>
                <p className="font-body text-sm leading-relaxed text-ink/80">{matchingFiche.ou_ca_vit}</p>
              </div>
              <div className="mb-4 rounded-lg bg-alert/5 p-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-alert mb-1.5">Red flag IA</p>
                <p className="font-body text-sm leading-relaxed text-ink/70">{matchingFiche.red_flag_ia}</p>
              </div>
              <div className="mb-4 rounded-lg bg-compass/5 p-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-compass mb-1.5">Prompt de vérification</p>
                <p className="font-body text-sm leading-relaxed italic text-ink/70">&ldquo;{matchingFiche.prompt_verification}&rdquo;</p>
              </div>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">Question clé</p>
                <p className="font-body text-sm leading-relaxed text-ink/80">{matchingFiche.question_cle}</p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="animate-scale-in" key={currentEx}>
          {nextTermToDiscover ? (
            <DiscoveryCard
              term={nextTermToDiscover.term}
              shortDefinition={nextTermToDiscover.shortDefinition}
              practicalMeaning={nextTermToDiscover.practicalMeaning}
              example={nextTermToDiscover.example}
              onDismiss={() => {
                setDiscoveredTerms((prev) => new Set(prev).add(nextTermToDiscover.id))
              }}
              pillarAccent={pillarAccentLight}
            />
          ) : (
            <>
              {exercise.type === "qcm_contextualise" && (
                <QcmContextualise
                  prompt={exercise.prompt}
                  options={getQcmPayload(exercise.payload).options}
                  correctIndex={getQcmPayload(exercise.payload).correctIndex}
                  onAnswer={(i) => handleAnswer(validateQCM(exercise.payload, i))}
                  disabled={false}
                />
              )}
              {exercise.type === "vrai_faux_pas_verifiable" && (
                <VraiFaux
                  affirmation={getVraiFauxPayload(exercise.payload).affirmation}
                  correctAnswer={getVraiFauxPayload(exercise.payload).correctAnswer}
                  onAnswer={(a) => handleAnswer(validateVraiFaux(exercise.payload, a))}
                  disabled={false}
                />
              )}
              {exercise.type === "reperage_supposition" && (
                <ReperageSupposition
                  text={getReperagePayload(exercise.payload).text}
                  suppositionStart={getReperagePayload(exercise.payload).suppositionStart}
                  suppositionEnd={getReperagePayload(exercise.payload).suppositionEnd}
                  onAnswer={(s, e) => handleAnswer(validateReperage(exercise.payload, s, e))}
                  disabled={false}
                />
              )}
              {exercise.type === "association_territoire" && (
                <AssociationTerritoire
                  term={getAssociationPayload(exercise.payload).term}
                  correctPlace={getAssociationPayload(exercise.payload).correctPlace}
                  onAnswer={(p) => handleAnswer(validateAssociation(exercise.payload, p))}
                  disabled={false}
                />
              )}
              {exercise.type === "remise_en_ordre" && (
                <RemiseEnOrdre
                  steps={getRemiseEnOrdrePayload(exercise.payload).steps}
                  correctOrder={getRemiseEnOrdrePayload(exercise.payload).correctOrder}
                  onAnswer={(o) => handleAnswer(validateRemiseEnOrdre(exercise.payload, o))}
                  disabled={false}
                />
              )}
              {exercise.type === "question_de_verification" && (
                <QuestionVerification
                  affirmation={exercise.prompt}
                  options={getQuestionVerificationPayload(exercise.payload).options}
                  correctIndex={getQuestionVerificationPayload(exercise.payload).correctIndex}
                  onAnswer={(i) => handleAnswer(validateQuestionVerification(exercise.payload, i))}
                  disabled={false}
                />
              )}
            </>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
