"use client"

import { useState } from "react"

export interface VraiFauxProps {
  affirmation: string
  onAnswer: (answer: "vrai" | "faux" | "pas_verifiable") => void
  correctAnswer?: string
  disabled?: boolean
}

type Answer = "vrai" | "faux" | "pas_verifiable"

const labels: Record<Answer, string> = {
  vrai: "Vrai",
  faux: "Faux",
  pas_verifiable: "Pas vérifiable en l'état",
}

export function VraiFaux({
  affirmation,
  onAnswer,
  correctAnswer,
  disabled = false,
}: VraiFauxProps) {
  const [selected, setSelected] = useState<Answer | null>(null)
  const [revealed, setRevealed] = useState(false)

  function handleSelect(answer: Answer) {
    if (disabled || revealed) return
    setSelected(answer)
    setRevealed(true)
    onAnswer(answer)
  }

  function getButtonStyle(answer: Answer) {
    if (!revealed || correctAnswer === undefined) {
      return selected === answer
        ? "ring-2 ring-marine bg-marine/5"
        : "bg-white hover:bg-marine/5"
    }

    if (answer === correctAnswer) {
      return "bg-moss/10 ring-2 ring-moss text-moss"
    }

    if (answer === selected && answer !== correctAnswer) {
      return "bg-alert/10 ring-2 ring-alert text-alert"
    }

    return "bg-white opacity-50"
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="mb-6 font-body leading-relaxed text-ink">{affirmation}</p>

      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Choix de réponse">
        {(Object.keys(labels) as Answer[]).map((answer) => (
          <button
            key={answer}
            onClick={() => handleSelect(answer)}
            disabled={disabled || revealed}
            role="radio"
            aria-checked={selected === answer}
            aria-label={labels[answer]}
            className={`rounded-lg border border-ink/10 px-6 py-3 font-body text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:cursor-default ${getButtonStyle(answer)}`}
          >
            {labels[answer]}
          </button>
        ))}
      </div>

      {revealed && correctAnswer !== undefined && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 font-body text-sm font-medium ${
            selected === correctAnswer
              ? "bg-moss/10 text-moss"
              : "bg-alert/10 text-alert"
          }`}
          role="alert"
        >
          {selected === correctAnswer
            ? "Bonne réponse !"
            : `Pas tout à fait. La réponse correcte est "${labels[correctAnswer as Answer]}".`}
        </p>
      )}
    </div>
  )
}
