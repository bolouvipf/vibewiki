"use client"

import { useState, useCallback } from "react"

export interface RemiseEnOrdreProps {
  steps: string[]
  onAnswer: (order: number[]) => void
  disabled?: boolean
  correctOrder?: number[]
}

export function RemiseEnOrdre({
  steps,
  onAnswer,
  disabled = false,
  correctOrder,
}: RemiseEnOrdreProps) {
  const [order, setOrder] = useState<number[]>(() =>
    steps.map((_, i) => i).sort(() => Math.random() - 0.5),
  )
  const [revealed, setRevealed] = useState(false)

  const moveUp = useCallback(
    (index: number) => {
      if (disabled || revealed || index === 0) return
      const next = [...order]
      const tmp = next[index - 1]
      next[index - 1] = next[index]
      next[index] = tmp
      setOrder(next)
    },
    [disabled, revealed, order],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (disabled || revealed || index === order.length - 1) return
      const next = [...order]
      const tmp = next[index + 1]
      next[index + 1] = next[index]
      next[index] = tmp
      setOrder(next)
    },
    [disabled, revealed, order],
  )

  function handleSubmit() {
    if (disabled || revealed) return
    setRevealed(true)
    onAnswer(order)
  }

  function getStepStyle(originalIndex: number) {
    if (!revealed || correctOrder === undefined) return "bg-white"
    const currentPosition = order.indexOf(originalIndex)
    const correctPosition = correctOrder.indexOf(originalIndex)

    if (currentPosition === correctPosition) return "bg-moss/10 ring-1 ring-moss"
    return "bg-alert/5 ring-1 ring-alert"
  }

  function isCorrect() {
    if (!revealed || !correctOrder) return false
    return order.every((val, idx) => val === correctOrder[idx])
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="mb-4 font-body text-sm font-medium text-ink/60">
        Remettez les étapes dans l'ordre à l'aide des flèches.
      </p>

      <ol className="space-y-2" aria-label="Étapes à ordonner">
        {order.map((originalIndex, pos) => (
          <li
            key={originalIndex}
            className={`flex items-center gap-2 rounded-lg border border-ink/10 px-4 py-3 transition-colors ${getStepStyle(originalIndex)}`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-terrain font-body text-xs font-bold text-ink/50">
              {pos + 1}
            </span>

            <span className="flex-1 font-body text-sm text-ink">
              {steps[originalIndex]}
            </span>

            <div className="flex shrink-0 flex-col gap-0.5" role="group" aria-label={`Déplacer l'étape ${pos + 1}`}>
              <button
                onClick={() => moveUp(pos)}
                disabled={disabled || revealed || pos === 0}
                aria-label="Monter"
                className="rounded p-0.5 text-ink/40 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:opacity-20"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(pos)}
                disabled={disabled || revealed || pos === order.length - 1}
                aria-label="Descendre"
                className="rounded p-0.5 text-ink/40 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:opacity-20"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        onClick={handleSubmit}
        disabled={disabled || revealed}
        className="mt-4 w-full rounded-lg bg-marine px-5 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-marine/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:opacity-50"
      >
        Valider l'ordre
      </button>

      {revealed && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 font-body text-sm font-medium ${
            isCorrect() ? "bg-moss/10 text-moss" : "bg-alert/10 text-alert"
          }`}
          role="alert"
        >
          {isCorrect() ? "Ordre correct !" : "Ce n'est pas le bon ordre."}
        </p>
      )}
    </div>
  )
}
