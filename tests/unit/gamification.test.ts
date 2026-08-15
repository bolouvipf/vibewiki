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
  currentCombo: 0,
  unlockedBadgeIds: [] as string[],
  suppositionsSpotted: 0,
  rescueCount: 0,
  perfectExercises: 0,
  lateNightSessions: 0,
  earlySessions: 0,
  emergencySuccess: 0,
  masteredTerms: [] as { pillar: string; termId: string }[],
  dailyChallengeCompleted: false,
  dailyChallengeDate: "",
  dailyChallengeProgress: 0,
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

  it('returns "Diamant" for xp between 1000 and 1499', () => {
    expect(getLeague(1000)).toBe("Diamant")
    expect(getLeague(1499)).toBe("Diamant")
  })

  it('returns "Légende" for xp >= 1500', () => {
    expect(getLeague(1500)).toBe("Légende")
    expect(getLeague(5000)).toBe("Légende")
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
    const r = await addExerciseXp(true)
    expect(r.xpGained).toBe(10)
    expect(r.xp).toBe(60)
  })

  it("addExerciseXp grants 0 XP when wrong", async () => {
    const { addExerciseXp } = await import("@/lib/gamification/engine")
    const r = await addExerciseXp(false)
    expect(r.xpGained).toBe(0)
    expect(r.xp).toBe(50)
  })

  it("addExerciseXp grants combo bonus from combo 3", async () => {
    progressData.currentCombo = 3
    const { addExerciseXp } = await import("@/lib/gamification/engine")
    const r = await addExerciseXp(true, 3)
    expect(r.xpGained).toBe(15)
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
    const { hearts } = await loseHeart()
    expect(hearts).toBe(4)
  })

  it("does not go below 0 and reports empty", async () => {
    progressData.hearts = 0
    const { loseHeart } = await import("@/lib/gamification/engine")
    const { hearts, isEmpty } = await loseHeart()
    expect(hearts).toBe(0)
    expect(isEmpty).toBe(true)
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
    const { streak } = await updateStreak()
    expect(streak).toBe(6)
  })

  it("resets to 1 if last active is older than yesterday", async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 3)
    progressData.lastActiveDate = twoDaysAgo.toISOString()
    const { updateStreak } = await import("@/lib/gamification/engine")
    const { streak } = await updateStreak()
    expect(streak).toBe(1)
  })

  it("does not change streak if already active today", async () => {
    progressData.lastActiveDate = new Date().toISOString()
    const { updateStreak } = await import("@/lib/gamification/engine")
    const { streak, isNew } = await updateStreak()
    expect(streak).toBe(5)
    expect(isNew).toBe(false)
  })
})

describe("Gamification enrichie", () => {
  beforeEach(() => {
    progressData = { ...defaultProgress }
  })

  it("updateCombo increments on correct and resets on wrong", async () => {
    const { updateCombo } = await import("@/lib/gamification/engine")
    await updateCombo(true)
    await updateCombo(true)
    const r = await updateCombo(true)
    expect(r.combo).toBe(3)
    expect(r.heartGained).toBe(false)
    const reset = await updateCombo(false)
    expect(reset.combo).toBe(0)
  })

  it("updateCombo grants a heart at combo 10", async () => {
    progressData.currentCombo = 9
    progressData.hearts = 3
    const { updateCombo } = await import("@/lib/gamification/engine")
    const r = await updateCombo(true)
    expect(r.combo).toBe(10)
    expect(r.heartGained).toBe(true)
    expect(progressData.hearts).toBe(4)
  })

  it("checkBadges unlocks badges when conditions are met", async () => {
    progressData.streakDays = 7
    progressData.emergencySuccess = 3
    const { checkBadges } = await import("@/lib/gamification/engine")
    const newBadges = await checkBadges()
    expect(newBadges.map((b) => b.id)).toEqual(expect.arrayContaining(["unstoppable", "emergency_responder"]))
    expect(progressData.unlockedBadgeIds).toContain("unstoppable")
  })

  it("checkBadges does not re-unlock already unlocked badges", async () => {
    progressData.streakDays = 7
    progressData.unlockedBadgeIds = ["unstoppable"]
    const { checkBadges } = await import("@/lib/gamification/engine")
    const newBadges = await checkBadges()
    expect(newBadges.map((b) => b.id)).not.toContain("unstoppable")
  })

  it("getMasteryStage returns the 4 stages correctly", () => {
    const { getMasteryStage } = require("@/lib/gamification/engine")
    expect(getMasteryStage({ masteryLevel: "decouvert" })).toBe("graine")
    expect(getMasteryStage({ masteryLevel: "en_cours", cumulativeExercisesPassed: false })).toBe("pousse")
    expect(getMasteryStage({ masteryLevel: "en_cours", cumulativeExercisesPassed: true })).toBe("arbre")
    expect(getMasteryStage({ masteryLevel: "maitrise" })).toBe("etoile")
  })

  it("all badges have a valid condition", () => {
    const { BADGES } = require("@/lib/gamification/engine")
    BADGES.forEach((badge: any) => {
      expect(typeof badge.condition).toBe("function")
      expect(badge.condition({})).toBeTypeOf("boolean")
    })
  })
})
