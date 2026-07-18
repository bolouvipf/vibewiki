import { describe, it, expect, beforeEach, mock } from "bun:test"
import { validateQCM, validateAssociation } from "@/lib/exercises/validators"

const fakeDb = {
  terms: new Map<string, Record<string, unknown>>(),
  progress: new Map<string, Record<string, unknown>>(),
}

function resetDb() {
  fakeDb.terms.clear()
  fakeDb.progress.clear()
  fakeDb.progress.set("local-user", {
    userId: "local-user",
    xp: 0,
    streakDays: 0,
    lastActiveDate: "",
    hearts: 5,
    completedNotionIds: [],
    validatedPillarIds: [],
  })
}

mock.module("dexie", () => {
  class FakeDexie {
    version() {
      return { stores() {} }
    }
  }
  return { default: FakeDexie }
})

mock.module("@/lib/db/queries", () => ({
  getProgress: async () => {
    const p = fakeDb.progress.get("local-user")!
    fakeDb.progress.set("local-user", { ...p })
    return { ...p }
  },
  updateProgress: async (update: Record<string, unknown>) => {
    const existing = fakeDb.progress.get("local-user")!
    Object.assign(existing, update)
  },
  addTerm: async (term: Record<string, unknown>) => {
    const existing = fakeDb.terms.get(term.id as string)
    if (existing) {
      Object.assign(existing, term)
      return
    }
    fakeDb.terms.set(term.id as string, {
      ...term,
      firstSeenAt: new Date().toISOString(),
      masteryLevel: "decouvert",
    })
  },
  getTerm: async (id: string) => fakeDb.terms.get(id) ?? null,
  advanceMastery: async (id: string) => {
    const term = fakeDb.terms.get(id)
    if (!term) return
    const next: Record<string, string | null> = { decouvert: "en_cours", en_cours: "maitrise", maitrise: null }
    const n = next[term.masteryLevel as string]
    if (n) Object.assign(term, { masteryLevel: n })
  },
  isNotionCompleted: async (notionId: string) => {
    const p = fakeDb.progress.get("local-user")!
    return (p.completedNotionIds as string[]).includes(notionId)
  },
  completeNotion: async (notionId: string, termIds: string[]) => {
    const p = fakeDb.progress.get("local-user")! as { completedNotionIds: string[] }
    if (!p.completedNotionIds.includes(notionId)) {
      p.completedNotionIds.push(notionId)
    }
    for (const tid of termIds) {
      const t = fakeDb.terms.get(tid)
      if (t && t.masteryLevel === "decouvert") {
        Object.assign(t, { masteryLevel: "en_cours" })
      }
    }
  },
  getDueReviews: async () => [],
  searchTerms: async () => [],
  getAllTerms: async () => [],
  getTermsByPillar: async () => [],
  getTermsByMastery: async () => [],
  isPillarValidated: async () => false,
  validatePillar: async () => {},
  scheduleReview: async () => {},
}))

describe("lesson flow: answer exercises, earn XP, complete lesson", () => {
  beforeEach(() => {
    resetDb()
  })

  it("answers qcm correctly and earns exercise XP", async () => {
    const payload = { options: ["Paris", "Lyon", "Marseille"], correctIndex: 0 }
    const result = validateQCM(payload, 0)
    expect(result.correct).toBe(true)

    const { addExerciseXp, getGamificationState } = await import("@/lib/gamification/engine")
    const xpResult = await addExerciseXp()
    expect(xpResult.xpGained).toBe(10)

    const state = await getGamificationState()
    expect(state.xp).toBe(10)
  })

  it("answers qcm incorrectly and does not earn XP", async () => {
    const payload = { options: ["Paris", "Lyon", "Marseille"], correctIndex: 0 }
    const result = validateQCM(payload, 1)
    expect(result.correct).toBe(false)

    const { getGamificationState } = await import("@/lib/gamification/engine")
    const state = await getGamificationState()
    expect(state.xp).toBe(0)
  })

  it("completes lesson: validates exercises, grants bonus XP, tracks completion", async () => {
    const exercises = [
      { type: "qcm", payload: { options: ["A", "B", "C"], correctIndex: 2 }, answer: 2 },
      { type: "association", payload: { term: "X", correctPlace: "Z", places: ["Y", "Z"] }, answer: "Z" },
    ]

    let correctCount = 0
    const qcmResult = validateQCM(exercises[0].payload, exercises[0].answer)
    if (qcmResult.correct) correctCount++
    const assocResult = validateAssociation(exercises[1].payload, exercises[1].answer)
    if (assocResult.correct) correctCount++
    expect(correctCount).toBe(2)

    for (let i = 0; i < correctCount; i++) {
      const { addExerciseXp } = await import("@/lib/gamification/engine")
      await addExerciseXp()
    }

    const { addNotionBonusXp, getGamificationState } = await import("@/lib/gamification/engine")
    await addNotionBonusXp()

    const state = await getGamificationState()
    expect(state.xp).toBe(10 * 2 + 25)

    const { isNotionCompleted, completeNotion, addTerm } = await import("@/lib/db/queries")
    const lessonId = "lesson-1"
    const termId = "term-1"
    const completed = await isNotionCompleted(lessonId)
    expect(completed).toBe(false)

    await addTerm({
      id: termId,
      term: "Préfet",
      shortDefinition: "Représentant de l'État",
      practicalMeaning: "Le chef dans le département",
      example: "Le préfet a visité l'école",
      pillar: "transversal",
      sourceNotionId: lessonId,
    })

    await completeNotion(lessonId, [termId])

    const done = await isNotionCompleted(lessonId)
    expect(done).toBe(true)

    const term = await (await import("@/lib/db/queries")).getTerm(termId)
    expect(term).not.toBeNull()
    expect(term?.masteryLevel).toBe("en_cours")
  })
})
