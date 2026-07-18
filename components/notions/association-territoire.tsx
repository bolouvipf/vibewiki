"use client"

import { useState } from "react"

export interface AssociationTerritoireProps {
  term: string
  correctPlace: string
  onAnswer: (place: string) => void
  disabled?: boolean
}

const places = ["GitHub", "Vercel", "Supabase", "Variables d'environnement"]

export function AssociationTerritoire({
  term,
  correctPlace,
  onAnswer,
  disabled = false,
}: AssociationTerritoireProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  function handleSelect(place: string) {
    if (disabled || revealed) return
    setSelected(place)
    setRevealed(true)
    onAnswer(place)
  }

  function getPlaceStyle(place: string) {
    if (!revealed) {
      return selected === place
        ? "ring-2 ring-marine bg-marine/5"
        : "bg-white hover:bg-marine/5"
    }

    if (place === correctPlace) {
      return "bg-moss/10 ring-2 ring-moss text-moss"
    }

    if (place === selected && place !== correctPlace) {
      return "bg-alert/10 ring-2 ring-alert text-alert"
    }

    return "bg-white opacity-50"
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="mb-2 font-body text-sm font-medium text-ink/60">Associez ce terme à son territoire :</p>
      <p className="mb-6 font-heading text-lg font-semibold text-ink">{term}</p>

      <div
        className="grid grid-cols-2 gap-3"
        role="radiogroup"
        aria-label="Territoires possibles"
      >
        {places.map((place) => (
          <button
            key={place}
            onClick={() => handleSelect(place)}
            disabled={disabled || revealed}
            role="radio"
            aria-checked={selected === place}
            aria-label={place}
            className={`rounded-lg border border-ink/10 px-5 py-4 text-center font-body text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-compass/50 disabled:cursor-default ${getPlaceStyle(place)}`}
          >
            {place}
          </button>
        ))}
      </div>

      {revealed && (
        <p
          className={`mt-4 rounded-lg px-4 py-2 font-body text-sm font-medium ${
            selected === correctPlace
              ? "bg-moss/10 text-moss"
              : "bg-alert/10 text-alert"
          }`}
          role="alert"
        >
          {selected === correctPlace
            ? `C'est exact ! "${term}" relève bien de ${correctPlace}.`
            : `Pas tout à fait. "${term}" relève de ${correctPlace}.`}
        </p>
      )}
    </div>
  )
}
