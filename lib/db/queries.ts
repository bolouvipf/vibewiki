import { db, type Term, type UserProgress } from "./schema"

const DEFAULT_USER_ID = "local-user"

export async function addTerm(term: Omit<Term, "firstSeenAt" | "masteryLevel">) {
  const existing = await db.terms.get(term.id)
  if (existing) {
    await db.terms.update(term.id, {
      term: term.term,
      shortDefinition: term.shortDefinition,
      practicalMeaning: term.practicalMeaning,
      example: term.example,
      pillar: term.pillar,
      sourceNotionId: term.sourceNotionId,
    })
    if (existing.masteryLevel === "decouvert") {
      await db.terms.update(term.id, { masteryLevel: "en_cours" })
    }
    return
  }
  await db.terms.put({
    ...term,
    firstSeenAt: new Date().toISOString(),
    masteryLevel: "decouvert",
  } as Term)
}

export async function getTerm(id: string) {
  return db.terms.get(id)
}

export async function getAllTerms() {
  return db.terms.toArray()
}

export async function searchTerms(query: string) {
  if (!query.trim()) return db.terms.toArray()
  const q = query.toLowerCase()
  const all = await db.terms.toArray()
  return all.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.shortDefinition.toLowerCase().includes(q) ||
      t.practicalMeaning.toLowerCase().includes(q),
  )
}

export async function getTermsByPillar(pillar: Term["pillar"]) {
  return db.terms.where("pillar").equals(pillar).toArray()
}

export async function getTermsByMastery(level: Term["masteryLevel"]) {
  return db.terms.where("masteryLevel").equals(level).toArray()
}

export async function advanceMastery(id: string) {
  const term = await db.terms.get(id)
  if (!term) return
  const next: Record<Term["masteryLevel"], Term["masteryLevel"] | null> = {
    decouvert: "en_cours",
    en_cours: "maitrise",
    maitrise: null,
  }
  const n = next[term.masteryLevel]
  if (n) {
    await db.terms.update(id, {
      masteryLevel: n,
      masteredAt: n === "maitrise" ? new Date().toISOString() : undefined,
    })
  }
}

export async function getProgress() {
  let p = await db.progress.get(DEFAULT_USER_ID)
  if (!p) {
    p = {
      userId: DEFAULT_USER_ID,
      xp: 0,
      streakDays: 0,
      lastActiveDate: "",
      hearts: 5,
      completedNotionIds: [],
      validatedPillarIds: [],
      currentCombo: 0,
      unlockedBadgeIds: [],
      suppositionsSpotted: 0,
      rescueCount: 0,
      perfectExercises: 0,
      lateNightSessions: 0,
      earlySessions: 0,
      emergencySuccess: 0,
      masteredTerms: [],
      dailyChallengeCompleted: false,
      dailyChallengeDate: "",
      dailyChallengeProgress: 0,
      parcoursPassed: false,
    } as UserProgress
    // put (upsert) plutôt qu'add : plusieurs appels concurrents au premier
    // chargement (page d'accueil) ne doivent jamais lever ConstraintError.
    await db.progress.put(p)
  }
  return p
}

export async function migrateProgress() {
  const p = await getProgress()
  const updates: Partial<UserProgress> = {}
  if (p.currentCombo === undefined) updates.currentCombo = 0
  if (p.unlockedBadgeIds === undefined) updates.unlockedBadgeIds = []
  if (p.suppositionsSpotted === undefined) updates.suppositionsSpotted = 0
  if (p.rescueCount === undefined) updates.rescueCount = 0
  if (p.perfectExercises === undefined) updates.perfectExercises = 0
  if (p.lateNightSessions === undefined) updates.lateNightSessions = 0
  if (p.earlySessions === undefined) updates.earlySessions = 0
  if (p.emergencySuccess === undefined) updates.emergencySuccess = 0
  if (p.masteredTerms === undefined) updates.masteredTerms = []
  if (p.dailyChallengeCompleted === undefined) updates.dailyChallengeCompleted = false
  if (p.dailyChallengeDate === undefined) updates.dailyChallengeDate = ""
  if (p.dailyChallengeProgress === undefined) updates.dailyChallengeProgress = 0
  if (p.parcoursPassed === undefined) updates.parcoursPassed = false
  if (Object.keys(updates).length > 0) await updateProgress(updates)
}

export async function updateProgress(update: Partial<UserProgress>) {
  const p = await getProgress()
  await db.progress.update(DEFAULT_USER_ID, { ...p, ...update })
}

export async function isNotionCompleted(notionId: string) {
  const p = await getProgress()
  return p.completedNotionIds.includes(notionId)
}

export async function completeNotion(notionId: string, termIds: string[]) {
  const p = await getProgress()
  if (!p.completedNotionIds.includes(notionId)) {
    p.completedNotionIds.push(notionId)
  }
  await db.progress.update(DEFAULT_USER_ID, {
    completedNotionIds: p.completedNotionIds,
  })
  for (const tid of termIds) {
    const t = await db.terms.get(tid)
    if (t && t.masteryLevel === "decouvert") {
      await db.terms.update(tid, { masteryLevel: "en_cours" })
    }
  }
}

export async function isPillarValidated(pillarId: string) {
  const p = await getProgress()
  return p.validatedPillarIds.includes(pillarId)
}

export async function validatePillar(pillarId: string) {
  const p = await getProgress()
  if (!p.validatedPillarIds.includes(pillarId)) {
    p.validatedPillarIds.push(pillarId)
  }
  await db.progress.update(DEFAULT_USER_ID, {
    validatedPillarIds: p.validatedPillarIds,
  })
}

export async function passParcours() {
  await updateProgress({ parcoursPassed: true })
}

export async function isParcoursUnlocked() {
  const p = await getProgress()
  return p.parcoursPassed || p.validatedPillarIds.includes("parcours")
}

export async function getDueReviews() {
  const now = new Date().toISOString()
  const all = await db.terms.toArray()
  return all.filter((t) => t.nextReviewAt && t.nextReviewAt <= now)
}

const REVIEW_INTERVALS = [1, 3, 7, 14, 30]

export async function scheduleReview(termId: string, correct: boolean) {
  const term = await db.terms.get(termId)
  if (!term) return
  const currentIdx = term.currentReviewInterval ?? 0
  const nextIdx = correct
    ? Math.min(currentIdx + 1, REVIEW_INTERVALS.length - 1)
    : 0
  const days = correct ? REVIEW_INTERVALS[nextIdx] : 1
  const next = new Date()
  next.setDate(next.getDate() + days)
  await db.terms.update(termId, {
    nextReviewAt: correct ? next.toISOString() : next.toISOString(),
    currentReviewInterval: nextIdx,
    lastReviewAt: new Date().toISOString(),
  })
}
