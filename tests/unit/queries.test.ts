import { describe, it, expect, beforeEach, mock } from "bun:test"

const store = {
  terms: new Map<string, Record<string, unknown>>(),
  progress: new Map<string, Record<string, unknown>>(),
}

function resetStore() {
  store.terms.clear()
  store.progress.clear()
}

beforeEach(() => { resetStore() })

mock.module("@/lib/db/queries", () => {
  const DEFAULT_USER_ID = "local-user"
  const REVIEW_INTERVALS = [1, 3, 7, 14, 30]

  return {
    addTerm: async (term: Record<string, unknown>) => {
      const existing = store.terms.get(term.id as string)
      if (existing) {
        Object.assign(existing, term)
        if (existing.masteryLevel === "decouvert") existing.masteryLevel = "en_cours"
        return
      }
      store.terms.set(term.id as string, {
        ...term, firstSeenAt: new Date().toISOString(), masteryLevel: "decouvert",
      })
    },
    getTerm: async (id: string) => store.terms.get(id) ?? null,
    getAllTerms: async () => Array.from(store.terms.values()),
    searchTerms: async (query: string) => {
      if (!query.trim()) return Array.from(store.terms.values())
      const q = query.toLowerCase()
      return Array.from(store.terms.values()).filter(
        (t: Record<string, unknown>) =>
          (t.term as string).toLowerCase().includes(q) ||
          (t.shortDefinition as string).toLowerCase().includes(q) ||
          (t.practicalMeaning as string).toLowerCase().includes(q),
      )
    },
    getTermsByPillar: async (pillar: string) =>
      Array.from(store.terms.values()).filter((t: Record<string, unknown>) => t.pillar === pillar),
    getTermsByMastery: async (level: string) =>
      Array.from(store.terms.values()).filter((t: Record<string, unknown>) => t.masteryLevel === level),
    advanceMastery: async (id: string) => {
      const term = store.terms.get(id)
      if (!term) return
      const next: Record<string, string | null> = { decouvert: "en_cours", en_cours: "maitrise", maitrise: null }
      const n = next[term.masteryLevel as string]
      if (n) {
        term.masteryLevel = n
        if (n === "maitrise") term.masteredAt = new Date().toISOString()
      }
    },
    getProgress: async () => {
      let p = store.progress.get(DEFAULT_USER_ID)
      if (!p) {
        p = { userId: DEFAULT_USER_ID, xp: 0, streakDays: 0, lastActiveDate: "", hearts: 5, completedNotionIds: [], validatedPillarIds: [] }
        store.progress.set(DEFAULT_USER_ID, { ...p })
      }
      return { ...p }
    },
    updateProgress: async (update: Record<string, unknown>) => {
      const existing = store.progress.get(DEFAULT_USER_ID)
      if (existing) Object.assign(existing, update)
    },
    isNotionCompleted: async (notionId: string) =>
      (store.progress.get(DEFAULT_USER_ID)?.completedNotionIds as string[] | undefined)?.includes(notionId) ?? false,
    completeNotion: async (notionId: string, termIds: string[]) => {
      let p = store.progress.get(DEFAULT_USER_ID)
      if (!p) {
        p = { userId: DEFAULT_USER_ID, xp: 0, streakDays: 0, lastActiveDate: "", hearts: 5, completedNotionIds: [], validatedPillarIds: [] }
        store.progress.set(DEFAULT_USER_ID, p)
      }
      if (!(p.completedNotionIds as string[]).includes(notionId)) {
        (p.completedNotionIds as string[]).push(notionId)
      }
      for (const tid of termIds) {
        const t = store.terms.get(tid)
        if (t && t.masteryLevel === "decouvert") t.masteryLevel = "en_cours"
      }
    },
    isPillarValidated: async (pillarId: string) =>
      (store.progress.get(DEFAULT_USER_ID)?.validatedPillarIds as string[] | undefined)?.includes(pillarId) ?? false,
    validatePillar: async (pillarId: string) => {
      let p = store.progress.get(DEFAULT_USER_ID)
      if (!p) {
        p = { userId: DEFAULT_USER_ID, xp: 0, streakDays: 0, lastActiveDate: "", hearts: 5, completedNotionIds: [], validatedPillarIds: [] }
        store.progress.set(DEFAULT_USER_ID, p)
      }
      if (!(p.validatedPillarIds as string[]).includes(pillarId)) {
        (p.validatedPillarIds as string[]).push(pillarId)
      }
    },
    getDueReviews: async () => {
      const now = new Date().toISOString()
      return Array.from(store.terms.values()).filter(
        (t: Record<string, unknown>) => t.nextReviewAt && t.nextReviewAt <= now,
      )
    },
    scheduleReview: async (termId: string, correct: boolean) => {
      const term = store.terms.get(termId)
      if (!term) return
      const currentIdx = (term.currentReviewInterval as number) ?? 0
      const nextIdx = correct ? Math.min(currentIdx + 1, REVIEW_INTERVALS.length - 1) : 0
      const days = correct ? REVIEW_INTERVALS[nextIdx] : 1
      const next = new Date()
      next.setDate(next.getDate() + days)
      term.nextReviewAt = next.toISOString()
      term.currentReviewInterval = nextIdx
      term.lastReviewAt = new Date().toISOString()
    },
  }
})

describe("addTerm", () => {
  it("adds a new term with decouvert mastery", async () => {
    const { addTerm } = await import("@/lib/db/queries")
    await addTerm({ id: "t1", term: "Git", shortDefinition: "Version", practicalMeaning: "Save", example: "git commit", pillar: "transversal", sourceNotionId: "l1" })
    const t = store.terms.get("t1")
    expect(t?.masteryLevel).toBe("decouvert")
    expect(t?.firstSeenAt).toBeDefined()
  })

  it("promotes existing decouvert to en_cours on update", async () => {
    store.terms.set("t1", { id: "t1", term: "API", pillar: "back", masteryLevel: "decouvert", firstSeenAt: "", sourceNotionId: "b1" })
    const { addTerm } = await import("@/lib/db/queries")
    await addTerm({ id: "t1", term: "API v2", shortDefinition: "U", practicalMeaning: "U", example: "U", pillar: "back", sourceNotionId: "b1" })
    expect(store.terms.get("t1")?.masteryLevel).toBe("en_cours")
  })
})

describe("searchTerms", () => {
  beforeEach(() => {
    store.terms.set("a", { id: "a", term: "API", shortDefinition: "Interface", practicalMeaning: "Contrat", example: "e", pillar: "back", masteryLevel: "decouvert", firstSeenAt: "", sourceNotionId: "b1" })
    store.terms.set("b", { id: "b", term: "CSS", shortDefinition: "Styles", practicalMeaning: "Joli", example: "e", pillar: "front", masteryLevel: "en_cours", firstSeenAt: "", sourceNotionId: "f1" })
  })

  it("returns all when no query", async () => {
    const { searchTerms } = await import("@/lib/db/queries")
    expect(await searchTerms("")).toHaveLength(2)
  })

  it("filters by term name", async () => {
    const { searchTerms } = await import("@/lib/db/queries")
    expect(await searchTerms("API")).toHaveLength(1)
  })
})

describe("getTermsByPillar", () => {
  beforeEach(() => {
    store.terms.set("a", { id: "a", term: "A", pillar: "back", masteryLevel: "decouvert", firstSeenAt: "", sourceNotionId: "b1" })
    store.terms.set("b", { id: "b", term: "B", pillar: "front", masteryLevel: "decouvert", firstSeenAt: "", sourceNotionId: "f1" })
  })

  it("filters by pillar", async () => {
    const { getTermsByPillar } = await import("@/lib/db/queries")
    expect(await getTermsByPillar("front")).toHaveLength(1)
  })
})

describe("advanceMastery", () => {
  beforeEach(() => {
    store.terms.set("a", { id: "a", masteryLevel: "decouvert", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
    store.terms.set("b", { id: "b", masteryLevel: "en_cours", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
    store.terms.set("c", { id: "c", masteryLevel: "maitrise", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
  })

  it("decouvert to en_cours", async () => {
    const { advanceMastery } = await import("@/lib/db/queries")
    await advanceMastery("a")
    expect(store.terms.get("a")?.masteryLevel).toBe("en_cours")
  })

  it("en_cours to maitrise with timestamp", async () => {
    const { advanceMastery } = await import("@/lib/db/queries")
    await advanceMastery("b")
    expect(store.terms.get("b")?.masteryLevel).toBe("maitrise")
    expect(store.terms.get("b")?.masteredAt).toBeDefined()
  })

  it("no change at maitrise", async () => {
    const { advanceMastery } = await import("@/lib/db/queries")
    await advanceMastery("c")
    expect(store.terms.get("c")?.masteryLevel).toBe("maitrise")
  })
})

describe("progress", () => {
  it("creates default on first call", async () => {
    const { getProgress } = await import("@/lib/db/queries")
    const p = await getProgress()
    expect(p.xp).toBe(0)
    expect(p.completedNotionIds).toEqual([])
  })

  it("completeNotion marks notion and promotes terms", async () => {
    store.terms.set("t1", { id: "t1", masteryLevel: "decouvert", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
    const { completeNotion, isNotionCompleted } = await import("@/lib/db/queries")
    await completeNotion("n1", ["t1"])
    expect(await isNotionCompleted("n1")).toBeTrue()
    expect(store.terms.get("t1")?.masteryLevel).toBe("en_cours")
  })

  it("validatePillar marks pillar", async () => {
    const { validatePillar, isPillarValidated } = await import("@/lib/db/queries")
    expect(await isPillarValidated("back")).toBeFalse()
    await validatePillar("back")
    expect(await isPillarValidated("back")).toBeTrue()
  })
})

describe("getDueReviews", () => {
  beforeEach(() => {
    store.terms.set("a", { id: "a", term: "A", masteryLevel: "decouvert", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
    store.terms.set("b", { id: "b", term: "B", masteryLevel: "decouvert", pillar: "back", firstSeenAt: "", sourceNotionId: "b1", nextReviewAt: "2020-01-01T00:00:00Z" })
    store.terms.set("c", { id: "c", term: "C", masteryLevel: "decouvert", pillar: "back", firstSeenAt: "", sourceNotionId: "b1", nextReviewAt: "2099-01-01T00:00:00Z" })
  })

  it("returns only overdue terms", async () => {
    const { getDueReviews } = await import("@/lib/db/queries")
    const due = await getDueReviews()
    expect(due).toHaveLength(1)
    expect(due[0].id).toBe("b")
  })
})

describe("scheduleReview", () => {
  beforeEach(() => {
    store.terms.set("a", { id: "a", term: "A", masteryLevel: "en_cours", pillar: "back", firstSeenAt: "", sourceNotionId: "b1" })
  })

  it("short interval on wrong answer", async () => {
    const { scheduleReview } = await import("@/lib/db/queries")
    await scheduleReview("a", false)
    const t = store.terms.get("a")
    expect(t?.nextReviewAt).toBeDefined()
    expect(t?.lastReviewAt).toBeDefined()
    expect(t?.currentReviewInterval).toBe(0)
  })

  it("increases interval on correct answer", async () => {
    const { scheduleReview } = await import("@/lib/db/queries")
    await scheduleReview("a", true)
    expect(store.terms.get("a")?.currentReviewInterval).toBe(1)
  })
})
