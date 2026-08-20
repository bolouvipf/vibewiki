import { getProgress, updateProgress } from "@/lib/db/queries"
import type { Term, UserProgress } from "@/lib/db/schema"

const XP_PER_EXERCISE = 10
const XP_PER_LESSON_BONUS = 25
const XP_COMBO_BONUS = 5
const XP_PERFECT_BONUS = 15
const XP_STREAK_BONUS = 20
const XP_DAILY_CHALLENGE = 30
const XP_EMERGENCY_CORRECT = 25
const MAX_HEARTS = 5
const HEART_REGEN_HOURS = 4
const LEAGUES = ["Bronze", "Argent", "Or", "Saphir", "Diamant"]

// ============ XP & LIGUES ============

export async function addXp(amount: number, reason?: string) {
  const p = await getProgress()
  const newXp = p.xp + amount
  const oldLeague = getLeague(p.xp)
  const newLeague = getLeague(newXp)
  const leagueChanged = oldLeague !== newLeague
  await updateProgress({ xp: newXp, league: newLeague })
  return { xp: newXp, league: newLeague, xpGained: amount, leagueChanged, reason }
}

export function getLeague(xp: number): string {
  if (xp < 100) return LEAGUES[0]
  if (xp < 300) return LEAGUES[1]
  if (xp < 600) return LEAGUES[2]
  if (xp < 1000) return LEAGUES[3]
  if (xp < 1500) return LEAGUES[4]
  return "Légende"
}

export async function addExerciseXp(isCorrect: boolean, comboCount: number = 0) {
  if (!isCorrect) return addXp(0, "exercise_failed")
  let total = XP_PER_EXERCISE
  if (comboCount >= 3) total += XP_COMBO_BONUS * Math.min(comboCount - 2, 5)
  return addXp(total, `exercise_success${comboCount >= 3 ? `_combo_x${comboCount}` : ""}`)
}

export async function addNotionBonusXp(wasPerfect: boolean = false) {
  const bonus = wasPerfect ? XP_PER_LESSON_BONUS + XP_PERFECT_BONUS : XP_PER_LESSON_BONUS
  return addXp(bonus, wasPerfect ? "notion_perfect" : "notion_complete")
}

export async function addDailyChallengeXp() {
  return addXp(XP_DAILY_CHALLENGE, "daily_challenge")
}

export async function addEmergencyXp(isCorrect: boolean) {
  if (!isCorrect) return addXp(0, "emergency_failed")
  return addXp(XP_EMERGENCY_CORRECT, "emergency_success")
}

// ============ CŒURS ============

export async function loseHeart() {
  const p = await getProgress()
  const hearts = Math.max(0, p.hearts - 1)
  await updateProgress({ hearts })
  return { hearts, isEmpty: hearts === 0 }
}

export async function gainHeart() {
  const p = await getProgress()
  const hearts = Math.min(MAX_HEARTS, p.hearts + 1)
  await updateProgress({ hearts })
  return hearts
}

export async function regenHearts() {
  const p = await getProgress()
  if (p.hearts >= MAX_HEARTS) return p.hearts
  const now = new Date()
  const lastActive = p.lastActiveDate ? new Date(p.lastActiveDate) : now
  const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
  const regened = Math.floor(hoursSinceLastActive / HEART_REGEN_HOURS)
  const hearts = Math.min(MAX_HEARTS, p.hearts + regened)
  if (hearts > p.hearts) await updateProgress({ hearts })
  return hearts
}

// ============ STREAK ============

export async function updateStreak() {
  const p = await getProgress()
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  if (p.lastActiveDate?.slice(0, 10) === todayStr) return { streak: p.streakDays, isNew: false, bonusXp: 0 }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak = p.lastActiveDate?.slice(0, 10) === yesterdayStr ? p.streakDays + 1 : 1
  await updateProgress({ streakDays: newStreak, lastActiveDate: today.toISOString() })

  let bonusXp = 0
  if (newStreak % 7 === 0) {
    bonusXp = XP_STREAK_BONUS * (newStreak / 7)
    await addXp(bonusXp, `streak_x${newStreak}`)
  }

  return { streak: newStreak, isNew: true, bonusXp }
}

// ============ SESSIONS ============

export async function trackSessionTimes() {
  const hour = new Date().getHours()
  const p = await getProgress()
  const updates: Partial<{ lateNightSessions: number; earlySessions: number }> = {}
  if (hour >= 22) updates.lateNightSessions = (p.lateNightSessions || 0) + 1
  if (hour < 8) updates.earlySessions = (p.earlySessions || 0) + 1
  if (Object.keys(updates).length > 0) await updateProgress(updates)
}

// ============ COMBOS ============

export async function updateCombo(isCorrect: boolean) {
  const p = await getProgress()
  const currentCombo = p.currentCombo || 0
  const newCombo = isCorrect ? currentCombo + 1 : 0
  await updateProgress({ currentCombo: newCombo })
  if (newCombo === 10) await gainHeart()
  return { combo: newCombo, heartGained: newCombo === 10 }
}

// ============ BADGES ============

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: (progress: UserProgress) => boolean
}

export const BADGES: Badge[] = [
  {
    id: "welcome",
    name: "🤝 Bienvenue",
    description: "Valider le parcours d'arrivée",
    icon: "🤝",
    condition: (p) => (p.validatedPillarIds || []).includes("parcours")
  },
  {
    id: "detective",
    name: "🕵️ Détective",
    description: "Repérer 10 suppositions dans les réponses IA",
    icon: "🕵️",
    condition: (p) => (p.suppositionsSpotted || 0) >= 10
  },
  {
    id: "unstoppable",
    name: "🔥 Inarrêtable",
    description: "Streak de 7 jours consécutifs",
    icon: "🔥",
    condition: (p) => p.streakDays >= 7
  },
  {
    id: "polyglot",
    name: "🧠 Polyglotte",
    description: "Maîtriser 3 termes dans chaque pilier",
    icon: "🧠",
    condition: (p) => {
      const byPillar = (p.masteredTerms || []).reduce<Record<string, number>>((acc, t) => {
        acc[t.pillar] = (acc[t.pillar] || 0) + 1
        return acc
      }, {})
      return Object.values(byPillar).every((c) => c >= 3)
    }
  },
  {
    id: "rescue",
    name: "⚡ Sauvetage",
    description: "Réussir un exercice après avoir perdu tous ses cœurs",
    icon: "⚡",
    condition: (p) => (p.rescueCount || 0) >= 1
  },
  {
    id: "cartographer",
    name: "🗺️ Cartographe",
    description: "Valider les 4 piliers",
    icon: "🗺️",
    condition: (p) => (p.validatedPillarIds || []).length >= 4
  },
  {
    id: "sniper",
    name: "🎯 Snipper",
    description: "10 exercices réussis du premier coup",
    icon: "🎯",
    condition: (p) => (p.perfectExercises || 0) >= 10
  },
  {
    id: "night_owl",
    name: "🦉 Noctambule",
    description: "Apprendre après 22h",
    icon: "🦉",
    condition: (p) => (p.lateNightSessions || 0) >= 1
  },
  {
    id: "early_bird",
    name: "🐣 Matinal",
    description: "Apprendre avant 8h",
    icon: "🐣",
    condition: (p) => (p.earlySessions || 0) >= 1
  },
  {
    id: "dictionary_master",
    name: "📖 Lexicographe",
    description: "Posséder 20 termes dans le dictionnaire",
    icon: "📖",
    condition: (p) => (p.masteredTerms || []).length >= 20
  },
  {
    id: "emergency_responder",
    name: "🚨 Pompier",
    description: "Réussir 3 scénarios d'urgence",
    icon: "🚨",
    condition: (p) => (p.emergencySuccess || 0) >= 3
  }
]

export async function checkBadges(): Promise<Badge[]> {
  const p = await getProgress()
  const unlocked = p.unlockedBadgeIds || []
  const newBadges = BADGES.filter(b => !unlocked.includes(b.id) && b.condition(p))
  if (newBadges.length > 0) {
    await updateProgress({ unlockedBadgeIds: [...unlocked, ...newBadges.map(b => b.id)] })
  }
  return newBadges
}

// ============ DÉFIS ============

export interface DailyChallenge {
  id: string
  type: "pillar_focus" | "notion_count" | "exercise_streak" | "review_session"
  title: string
  description: string
  target: number
  reward: number
  pillarId?: string
}

export function generateDailyChallenge(): DailyChallenge {
  const challenges: DailyChallenge[] = [
    {
      id: "daily-git",
      type: "pillar_focus",
      title: "Journée Git",
      description: "Réussir 3 exercices dans le pilier Outils transversaux",
      target: 3,
      reward: XP_DAILY_CHALLENGE,
      pillarId: "transversal"
    },
    {
      id: "daily-front",
      type: "pillar_focus",
      title: "Journée Front",
      description: "Réussir 3 exercices dans le pilier Front",
      target: 3,
      reward: XP_DAILY_CHALLENGE,
      pillarId: "front"
    },
    {
      id: "daily-ia",
      type: "pillar_focus",
      title: "Journée IA",
      description: "Réussir 3 exercices dans le pilier Piloter son IA",
      target: 3,
      reward: XP_DAILY_CHALLENGE,
      pillarId: "ia"
    },
    {
      id: "daily-explorer",
      type: "notion_count",
      title: "Explorateur",
      description: "Terminer 2 nouvelles notions aujourd'hui",
      target: 2,
      reward: XP_DAILY_CHALLENGE
    },
    {
      id: "daily-perfection",
      type: "exercise_streak",
      title: "Sans faute",
      description: "Réussir 5 exercices consécutifs sans erreur",
      target: 5,
      reward: XP_DAILY_CHALLENGE
    },
    {
      id: "daily-revision",
      type: "review_session",
      title: "Révision express",
      description: "Réviser 3 termes du dictionnaire",
      target: 3,
      reward: XP_DAILY_CHALLENGE
    }
  ]
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  return challenges[dayOfYear % challenges.length]
}

// ============ MAÎTRISE VISUELLE ============

export type MasteryStage = "graine" | "pousse" | "arbre" | "etoile"

export function getMasteryStage(term: Partial<Pick<Term, "masteryLevel" | "cumulativeExercisesPassed">>): MasteryStage {
  if (term.masteryLevel === "maitrise") return "etoile"
  if (term.masteryLevel === "en_cours") {
    return term.cumulativeExercisesPassed ? "arbre" : "pousse"
  }
  return "graine"
}

export function getMasteryEmoji(stage: MasteryStage): string {
  const map: Record<MasteryStage, string> = {
    graine: "🌱",
    pousse: "🌿",
    arbre: "🌳",
    etoile: "⭐"
  }
  return map[stage]
}

// ============ ÉTAT GLOBAL ============

export async function getGamificationState() {
  const p = await getProgress()
  const hearts = await regenHearts()
  const badges = await checkBadges()
  const challenge = generateDailyChallenge()

  return {
    xp: p.xp,
    streakDays: p.streakDays,
    hearts,
    league: p.league || getLeague(p.xp),
    completedNotions: (p.completedNotionIds || []).length,
    currentCombo: p.currentCombo || 0,
    badges: p.unlockedBadgeIds || [],
    newBadges: badges.map(b => ({ id: b.id, name: b.name, icon: b.icon })),
    dailyChallenge: challenge,
    masteryStats: {
      totalTerms: (p.masteredTerms || []).length,
      mastered: (p.masteredTerms || []).length,
      byStage: {
        graine: 0,
        pousse: 0,
        arbre: 0,
        etoile: 0
      }
    }
  }
}
