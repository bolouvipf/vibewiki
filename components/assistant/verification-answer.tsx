import type { VerificationResponse } from "@/lib/assistant/schema"

export function VerificationAnswer({ answer }: { answer: VerificationResponse }) {
  return (
    <div className="mt-5 space-y-3 animate-scale-in">
      <div className="rounded-2xl border border-alert/20 bg-alert/5 p-4">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-alert mb-1.5">⚠️ À vérifier</p>
        <p className="font-body text-sm leading-relaxed text-ink/80">{answer.rappel}</p>
      </div>
      <div className="space-y-3">
        {answer.questions.map((q, i) => (
          <div key={i} className="rounded-2xl border border-marine/15 bg-white p-4 shadow-sm">
            <p className="font-body text-sm font-semibold text-marine mb-1.5">
              {i + 1}. {q.question}
            </p>
            <p className="font-body text-xs leading-relaxed text-ink/50">{q.pourquoi}</p>
          </div>
        ))}
      </div>
    </div>
  )
}