import { describe, it, expect, beforeEach, mock } from "bun:test"
import { getLeague } from "@/lib/gamification/engine"

const defaultProgress = {
  userId: "local-user",
  xp: 50,
  streakDays: 3,
  lastActiveDate: "2026-07-15T12:00:00.000Z",
  hearts: 5,
  completedNotionIds: [],
  validatedPillarIds: [],
}

let progressData = { ...defaultProgress }

mock.module("@/lib/db/queries", () => ({
  getProgress: async () => ({ ...progressData }),
  updateProgress: async (update: Record<string, unknown>) => {
    Object.assign(progressData, update)
  },
  isNotionCompleted: async () => false,
}))

describe("getLeague", () => {
  it('returns "Bronze" for xp < 100', () => {
    expect(getLeague(0)).toBe("Bronze")
    expect(getLeague(50)).toBe("Bronze")
    expect(getLeague(99)).toBe("Bronze")
  })

  it('returns "Argent" for xp between 100 and 299', () => {
    expect(getLeague(100)).toBe("Argent")
    expect(getLeague(200)).toBe("Argent")
    expect(getLeague(299)).toBe("Argent")
  })

  it('returns "Or" for xp between 300 and 599', () => {
    expect(getLeague(300)).toBe("Or")
    expect(getLeague(450)).toBe("Or")
    expect(getLeague(599)).toBe("Or")
  })

  it('returns "Saphir" for xp between 600 and 999', () => {
    expect(getLeague(600)).toBe("Saphir")
    expect(getLeague(800)).toBe("Saphir")
    expect(getLeague(999)).toBe("Saphir")
  })

  it('returns "Diamant" for xp >= 1000', () => {
    expect(getLeague(1000)).toBe("Diamant")
    expect(getLeague(5000)).toBe("Diamant")
  })
})

describe("addXp", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress }
  })

  it("adds XP and returns updated state", async () => {
    const { addXp } = await import("@/lib/gamification/engine")
    const r = await addXp(25)
    expect(r.xp).toBe(75)
    expect(r.xpGained).toBe(25)
    expect(r.league).toBe("Bronze")
  })

  it("promotes league when crossing threshold", async () => {
    progressData.xp = 90
    const { addXp } = await import("@/lib/gamification/engine")
    const r = await addXp(20)
    expect(r.xp).toBe(110)
    expect(r.league).toBe("Argent")
  })
})

describe("addExerciseXp and addNotionBonusXp", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress }
  })

  it("addExerciseXp grants 10 XP", async () => {
    const { addExerciseXp } = await import("@/lib/gamification/engine")
    const r = await addExerciseXp()
    expect(r.xpGained).toBe(10)
    expect(r.xp).toBe(60)
  })

  it("addNotionBonusXp grants 25 XP", async () => {
    const { addNotionBonusXp } = await import("@/lib/gamification/engine")
    const r = await addNotionBonusXp()
    expect(r.xpGained).toBe(25)
    expect(r.xp).toBe(75)
  })
})

describe("loseHeart", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress }
  })

  it("decrements hearts", async () => {
    const { loseHeart } = await import("@/lib/gamification/engine")
    const hearts = await loseHeart()
    expect(hearts).toBe(4)
  })

  it("does not go below 0", async () => {
    progressData.hearts = 0
    const { loseHeart } = await import("@/lib/gamification/engine")
    const hearts = await loseHeart()
    expect(hearts).toBe(0)
  })
})

describe("regenHearts", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress, hearts: 2 }
  })

  it("regens hearts based on time since last active", async () => {
    const oldDate = new Date()
    oldDate.setHours(oldDate.getHours() - 10)
    progressData.lastActiveDate = oldDate.toISOString()
    progressData.hearts = 1
    const { regenHearts } = await import("@/lib/gamification/engine")
    const hearts = await regenHearts()
    expect(hearts).toBeGreaterThan(1)
  })

  it("caps hearts at MAX_HEARTS (5)", async () => {
    progressData.lastActiveDate = new Date(0).toISOString()
    const { regenHearts } = await import("@/lib/gamification/engine")
    const hearts = await regenHearts()
    expect(hearts).toBe(5)
  })
})

describe("updateStreak", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress, streakDays: 5 }
  })

  it("continues streak if last active yesterday", async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    progressData.lastActiveDate = yesterday.toISOString()
    const { updateStreak } = await import("@/lib/gamification/engine")
    const streak = await updateStreak()
    expect(streak).toBe(6)
  })

  it("resets to 1 if last active is older than yesterday", async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 3)
    progressData.lastActiveDate = twoDaysAgo.toISOString()
    const { updateStreak } = await import("@/lib/gamification/engine")
    const streak = await updateStreak()
    expect(streak).toBe(1)
  })

  it("does not change streak if already active today", async () => {
    progressData.lastActiveDate = new Date().toISOString()
    const { updateStreak } = await import("@/lib/gamification/engine")
    const streak = await updateStreak()
    expect(streak).toBe(5)
  })
})
