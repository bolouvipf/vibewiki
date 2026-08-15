import { BADGES } from "@/lib/gamification/engine"

export function BadgeGrid({ unlockedIds }: { unlockedIds: string[] }) {
  const unlocked = new Set(unlockedIds)
  return (
    <div className="grid grid-cols-2 gap-4">
      {BADGES.map((badge) => {
        const isUnlocked = unlocked.has(badge.id)
        return (
          <div
            key={badge.id}
            className={`rounded-xl border-2 p-4 transition-all ${
              isUnlocked
                ? "border-[#D9A441] bg-[#D9A441]/10"
                : "border-ink/5 opacity-50 grayscale"
            }`}
          >
            <div className="text-3xl">{badge.icon}</div>
            <div className="mt-1 font-heading text-sm font-bold text-marine">{badge.name}</div>
            <div className="mt-0.5 font-body text-xs text-ink/50">{badge.description}</div>
          </div>
        )
      })}
    </div>
  )
}
