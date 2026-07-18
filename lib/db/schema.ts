import Dexie, { type EntityTable } from "dexie"

export interface Term {
  id: string
  term: string
  shortDefinition: string
  practicalMeaning: string
  example: string
  pillar: "transversal" | "front" | "back" | "database"
  masteryLevel: "decouvert" | "en_cours" | "maitrise"
  firstSeenAt: string
  masteredAt?: string
  sourceNotionId: string
  nextReviewAt?: string
  lastReviewAt?: string
  currentReviewInterval?: number
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
}

export interface CachedNotion {
  id: string
  pillarId: "transversal" | "front" | "back" | "database"
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
