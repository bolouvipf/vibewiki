import { getProgress, updateProgress } from "@/lib/db/queries"

const XP_PER_EXERCISE = 10
const XP_PER_LESSON_BONUS = 25
const MAX_HEARTS = 5
const HEART_REGEN_HOURS = 4
const LEAGUES = ["Bronze", "Argent", "Or", "Saphir", "Diamant"]

export async function addXp(amount: number) {
  const p = await getProgress()
  const newXp = p.xp + amount
  const league = getLeague(newXp)
  await updateProgress({ xp: newXp, league })
  return { xp: newXp, league, xpGained: amount }
}

export function getLeague(xp: number): string {
  if (xp < 100) return LEAGUES[0]
  if (xp < 300) return LEAGUES[1]
  if (xp < 600) return LEAGUES[2]
  if (xp < 1000) return LEAGUES[3]
  return LEAGUES[4]
}

export async function addExerciseXp() {
  return addXp(XP_PER_EXERCISE)
}

export async function addNotionBonusXp() {
  return addXp(XP_PER_LESSON_BONUS)
}

export async function loseHeart() {
  const p = await getProgress()
  const hearts = Math.max(0, p.hearts - 1)
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
  if (hearts > p.hearts) {
    await updateProgress({ hearts })
  }
  return hearts
}

export async function updateStreak() {
  const p = await getProgress()
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  if (p.lastActiveDate?.slice(0, 10) === todayStr) return p.streakDays

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak = p.lastActiveDate?.slice(0, 10) === yesterdayStr ? p.streakDays + 1 : 1
  await updateProgress({ streakDays: newStreak, lastActiveDate: today.toISOString() })
  return newStreak
}

export async function getGamificationState() {
  const p = await getProgress()
  const hearts = await regenHearts()
  return {
    xp: p.xp,
    streakDays: p.streakDays,
    hearts,
    league: p.league || getLeague(p.xp),
    completedNotions: p.completedNotionIds.length,
  }
}
