"use client"

import { useState, useCallback } from "react"

export interface ReperageSuppositionProps {
  text: string
  suppositionStart: number
  suppositionEnd: number
  onAnswer: (start: number, end: number) => void
  disabled?: boolean
}

export function ReperageSupposition({
  text,
  suppositionStart,
  suppositionEnd,
  onAnswer,
  disabled = false,
}: ReperageSuppositionProps) {
  const words = text.split(/\s+/)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleWordClick = useCallback(
    (index: number) => {
      if (disabled || revealed) return

      if (selectionStart === null) {
        setSelectionStart(index)
        setSelectionEnd(index)
        return
      }

      const lo = Math.min(selectionStart, index)
      const hi = Math.max(selectionStart, index)
      setSelectionEnd(hi)
      setSelectionStart(lo)
      setRevealed(true)
      onAnswer(lo, hi + 1)
    },
    [disabled, revealed, selectionStart, onAnswer],
  )

  function isSelected(i: number) {
    if (selectionStart === null || selectionEnd === null) return false
    return i >= selectionStart && i <= selectionEnd
  }

  function isCorrectSegment(i: number) {
    return i >= suppositionStart && i < suppositionEnd
  }

  function getWordStyle(index: number) {
    if (!revealed) {
      if (isSelected(index)) return "bg-alert/20 text-alert ring-alert"
      return "bg-white hover:bg-alert/10 cursor-pointer"
    }

    const inCorrect = isCorrectSegment(index)
    const inSelection = isSelected(index)
    const isCorrectGuess =
      inCorrect && inSelection
    const isWrongSelection =
      inSelection && !inCorrect
    const isMissed = inCorrect && !inSelection

    if (isCorrectGuess) return "bg-moss/20 text-moss ring-moss"
    if (isWrongSelection) return "bg-alert/20 text-alert ring-alert"
    if (isMissed) return "bg-compass/20 text-compass ring-compass"

    return "bg-white opacity-50"
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="mb-4 font-body text-sm font-medium text-ink/60">
        Cliquez sur le premier mot de la phrase qui contient une supposition, puis sur le dernier.
      </p>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Texte à analyser"
      >
        {words.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => handleWordClick(i)}
            disabled={disabled || revealed}
            aria-pressed={isSelected(i)}
            aria-label={`Mot ${i + 1}: ${word}${revealed && isCorrectSegment(i) ? " (supposition)" : ""}`}
            className={`rounded-md border border-ink/10 px-2 py-1 font-body text-sm leading-relaxed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:cursor-default ${getWordStyle(i)}`}
          >
            {word}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="mt-4 space-y-1">
          <p
            className={`rounded-lg px-4 py-2 font-body text-sm font-medium ${
              selectionStart === suppositionStart && selectionEnd === suppositionEnd - 1
                ? "bg-moss/10 text-moss"
                : "bg-alert/10 text-alert"
            }`}
            role="alert"
          >
            {selectionStart === suppositionStart && selectionEnd === suppositionEnd - 1
              ? "Vous avez repéré la supposition."
              : "Ce n'est pas exactement la bonne zone."}
          </p>
          <p className="font-body text-xs text-ink/50">
            La supposition se trouve dans l'extrait : "{words.slice(suppositionStart, suppositionEnd).join(" ")}"
          </p>
        </div>
      )}
    </div>
  )
}
