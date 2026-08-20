import { describe, it, expect } from "bun:test"
import pillar0 from "@/content/piliers/00-parcours.json"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"
import pillar5 from "@/content/piliers/05-ia.json"

const pillars = [pillar0, pillar1, pillar2, pillar3, pillar4, pillar5]

describe("content des piliers", () => {
  for (const p of pillars) {
    describe(`pilier ${p.pillarId}`, () => {
      it("a une fiche technique complète", () => {
        expect(p.technicalSheet.explanation.length).toBeGreaterThan(20)
        expect(p.technicalSheet.utility.length).toBeGreaterThan(20)
      })

      it("a des notions ordonnées avec des ids uniques", () => {
        expect(p.notions.length).toBeGreaterThan(0)
        const ids = new Set<string>()
        p.notions.forEach((n, i) => {
          expect(n.order).toBe(i + 1)
          expect(ids.has(n.id)).toBe(false)
          ids.add(n.id)
          expect(n.course.explanation.length).toBeGreaterThan(20)
          expect(n.course.practicalMeaning.length).toBeGreaterThan(20)
          expect(n.course.example.length).toBeGreaterThan(20)
          expect(n.exercises.length).toBeGreaterThan(0)
        })
      })

      it("contient un exercice cumulatif dès la 2e notion", () => {
        const termsByNotion = p.notions.map((n) => new Set(n.exercises.flatMap((e) => e.relatedTermIds ?? [])))
        p.notions.forEach((n, i) => {
          if (i === 0) return
          const previousTerms = new Set<string>()
          for (let j = 0; j < i; j++) {
            for (const t of termsByNotion[j]) previousTerms.add(t)
          }
          const cumulative = n.exercises.some((e) =>
            (e.relatedTermIds ?? []).some((id) => previousTerms.has(id)),
          )
          expect(cumulative, `notion ${n.id} devrait avoir un exercice cumulatif`).toBe(true)
        })
      })

      it("a exactement 3 exercices de validation", () => {
        expect(p.validationExercises.length).toBe(3)
      })

      it("a des relatedTermIds valides dans les notions", () => {
        const knownIds = new Set(p.terms.map((t) => t.id))
        const all = p.notions.flatMap((n) => n.exercises).flatMap((e) => e.relatedTermIds ?? [])
        for (const id of all) {
          expect(knownIds.has(id), `term inconnu: ${id}`).toBe(true)
        }
      })

      it("a des relatedTermIds valides dans la validation", () => {
        const knownIds = new Set(p.terms.map((t) => t.id))
        const all = p.validationExercises.flatMap((e) => e.relatedTermIds ?? [])
        for (const id of all) {
          expect(knownIds.has(id), `term inconnu: ${id}`).toBe(true)
        }
      })

      it("a des termes complets", () => {
        for (const t of p.terms) {
          expect(t.id.length).toBeGreaterThan(0)
          expect(t.term.length).toBeGreaterThan(0)
          expect(t.shortDefinition.length).toBeGreaterThan(0)
          expect(t.practicalMeaning.length).toBeGreaterThan(0)
          expect(t.example.length).toBeGreaterThan(0)
        }
      })

      it("a des payloads d'exercices cohérents", () => {
        const all = [
          ...p.notions.flatMap((n) => n.exercises),
          ...p.validationExercises,
        ]
        for (const e of all) {
          const payload = e.payload as Record<string, unknown>
          if (e.type === "qcm_contextualise" || e.type === "question_de_verification") {
            const options = payload.options as string[]
            const correctIndex = payload.correctIndex as number
            expect(options.length, e.id).toBeGreaterThan(1)
            expect(correctIndex, e.id).toBeGreaterThanOrEqual(0)
            expect(correctIndex, e.id).toBeLessThan(options.length)
          }
          if (e.type === "vrai_faux_pas_verifiable") {
            expect(["vrai", "faux", "pas_verifiable"]).toContain(payload.correctAnswer)
          }
          if (e.type === "reperage_supposition") {
            const text = payload.text as string
            const start = payload.suppositionStart as number
            const end = payload.suppositionEnd as number
            expect(start, e.id).toBeGreaterThanOrEqual(0)
            expect(end, e.id).toBeGreaterThan(start)
            expect(end, e.id).toBeLessThanOrEqual(text.length)
            expect(text.slice(start, end).trim().length, e.id).toBeGreaterThan(0)
          }
          if (e.type === "association_territoire") {
            expect((payload.places as string[]).includes(payload.correctPlace as string), e.id).toBe(true)
          }
          if (e.type === "remise_en_ordre") {
            const steps = payload.steps as string[]
            const order = payload.correctOrder as number[]
            expect(order.length, e.id).toBe(steps.length)
            expect([...order].sort((a, b) => a - b), e.id).toEqual(steps.map((_, i) => i))
          }
        }
      })
    })
  }
})