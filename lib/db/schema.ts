import Dexie, { type EntityTable } from "dexie"

export type PillarId = "parcours" | "transversal" | "front" | "back" | "database" | "ia"

export interface Term {
  id: string
  term: string
  shortDefinition: string
  practicalMeaning: string
  example: string
  pillar: PillarId
  masteryLevel: "decouvert" | "en_cours" | "maitrise"
  firstSeenAt: string
  masteredAt?: string
  sourceNotionId: string
  nextReviewAt?: string
  lastReviewAt?: string
  currentReviewInterval?: number
  cumulativeExercisesPassed?: boolean
}

export interface UserProgress {
  userId: string
  xp: number
  streakDays: number
  lastActiveDate: string
  hearts: number
  league?: string
  completedNotionIds: string[]
  validatedPillarIds: string[]
  // NOUVEAU : Gamification enrichie
  currentCombo: number
  unlockedBadgeIds: string[]
  suppositionsSpotted: number
  rescueCount: number
  perfectExercises: number
  lateNightSessions: number
  earlySessions: number
  emergencySuccess: number
  masteredTerms: { pillar: string; termId: string }[]
  // NOUVEAU : Défi du jour
  dailyChallengeCompleted: boolean
  dailyChallengeDate: string
  dailyChallengeProgress: number
  // Parcours d'arrivée
  parcoursPassed: boolean
}

export interface CachedNotion {
  id: string
  pillarId: PillarId
  title: string
  order: number
  exercises: unknown[]
  cachedAt: string
}

export class VibewikiDB extends Dexie {
  terms!: EntityTable<Term, "id">
  progress!: EntityTable<UserProgress, "userId">
  notionsCache!: EntityTable<CachedNotion, "id">

  constructor() {
    super("vibewiki")
    this.version(3).stores({
      terms: "id, pillar, masteryLevel",
      progress: "userId",
      notionsCache: "id, pillarId",
    })
  }
}

export const db = new VibewikiDB()
