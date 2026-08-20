import type { JargonResponse } from "@/lib/assistant/schema"

const sections: { key: keyof JargonResponse; label: string; color: string; emoji: string }[] = [
  { key: "explication", label: "Ce que ça veut dire", color: "text-marine bg-marine/10 border-marine/20", emoji: "🧭" },
  { key: "aQuoiCaSert", label: "À quoi ça sert", color: "text-compass bg-compass/10 border-compass/20", emoji: "🛠️" },
  { key: "exemple", label: "Exemple concret", color: "text-moss bg-moss/10 border-moss/20", emoji: "💡" },
  { key: "commentVerifier", label: "Comment vérifier", color: "text-alert bg-alert/10 border-alert/20", emoji: "🔍" },
]

export function JargonAnswer({ answer }: { answer: JargonResponse }) {
  return (
    <div className="mt-5 space-y-3 animate-scale-in">
      {sections.map(({ key, label, color, emoji }) => (
        <div key={key} className={`rounded-2xl border p-4 ${color}`}>
          <p className="font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            {emoji} {label}
          </p>
          <p className="font-body text-sm leading-relaxed text-ink/80">{answer[key]}</p>
        </div>
      ))}
    </div>
  )
}