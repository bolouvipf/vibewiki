"use client"

import { useState } from "react"

export interface QcmContextualiseProps {
  prompt: string
  options: string[]
  onAnswer: (index: number) => void
  disabled?: boolean
  correctIndex?: number
}

export function QcmContextualise({
  prompt,
  options,
  onAnswer,
  disabled = false,
  correctIndex,
}: QcmContextualiseProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  function handleSelect(index: number) {
    if (disabled || revealed) return
    setSelected(index)
    setRevealed(true)
    onAnswer(index)
  }

  function getOptionStyle(index: number) {
    if (!revealed || correctIndex === undefined) {
      return selected === index
        ? "ring-2 ring-marine bg-marine/5"
        : "bg-white hover:bg-marine/5"
    }

    if (index === correctIndex) {
      return "bg-moss/10 ring-2 ring-moss text-moss"
    }

    if (index === selected && index !== correctIndex) {
      return "bg-alert/10 ring-2 ring-alert text-alert"
    }

    return "bg-white opacity-50"
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="mb-6 font-body italic leading-relaxed text-ink/80">"{prompt}"</p>

      <div className="space-y-3">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={disabled || revealed}
            aria-pressed={selected === i}
            aria-label={`Option ${i + 1}: ${option}${revealed && i === correctIndex ? " (correcte)" : ""}`}
            className={`w-full rounded-lg border border-ink/10 px-5 py-3 text-left font-body text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:cursor-default ${getOptionStyle(i)}`}
          >
            <span className="mr-3 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-terrain text-xs font-bold text-ink/60">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {revealed && correctIndex !== undefined && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 font-body text-sm font-medium ${
            selected === correctIndex
              ? "bg-moss/10 text-moss"
              : "bg-alert/10 text-alert"
          }`}
          role="alert"
        >
          {selected === correctIndex
            ? "Bonne réponse !"
            : `Pas tout à fait. La bonne réponse était "${options[correctIndex]}".`}
        </p>
      )}
    </div>
  )
}
