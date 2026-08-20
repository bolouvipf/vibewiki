"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/ui/bottom-nav"
import { JargonAnswer } from "@/components/assistant/jargon-answer"
import { VerificationAnswer } from "@/components/assistant/verification-answer"
import type { AssistantMode, JargonResponse, VerificationResponse } from "@/lib/assistant/schema"

type ApiAnswer = JargonResponse | VerificationResponse

const placeholders: Record<AssistantMode, string> = {
  jargon:
    "Collez ici la phrase, le message ou l'erreur opaque de votre assistant IA…\n\nExemple : « Le build a échoué : ENOENT: no such file or directory, open '.next/BUILD_ID' »",
  verification:
    "Collez ici une affirmation ou une décision de votre assistant IA que vous voulez vérifier…\n\nExemple : « J'ai configuré la base de données avec Supabase, tout est prêt pour la production. »",
}

export default function AssistantPage() {
  const [mode, setMode] = useState<AssistantMode>("jargon")
  const [text, setText] = useState("")
  const [answer, setAnswer] = useState<ApiAnswer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const offline = typeof navigator !== "undefined" && !navigator.onLine

  async function handleSubmit() {
    if (loading) return
    setAnswer(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      })
      const data = (await res.json()) as { error?: string; answer?: ApiAnswer }
      if (!res.ok || !data.answer) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.")
        return
      }
      setAnswer(data.answer)
    } catch {
      setError("Impossible de contacter le service. Vérifiez votre connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4"
        >
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Accueil
        </Link>
        <h1 className="font-heading text-2xl font-bold text-marine">✨ Assistant IA</h1>
        <p className="font-body text-sm text-ink/50 mt-1">
          Comprendre ce que dit votre IA, sans la subir.
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-1.5 flex gap-1.5 mb-5">
        {(
          [
            { value: "jargon", label: "Traduire le jargon" },
            { value: "verification", label: "Questions de vérification" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setMode(tab.value)
              setAnswer(null)
              setError(null)
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-all duration-200 ${
              mode === tab.value
                ? "bg-marine text-white shadow-sm"
                : "text-ink/40 hover:text-marine"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-ink/10 p-5 shadow-sm">
        <label htmlFor="assistant-input" className="mb-3 block font-body text-xs font-semibold uppercase tracking-wider text-ink/40">
          {mode === "jargon" ? "Le message opaque de votre IA" : "L'affirmation à vérifier"}
        </label>
        <textarea
          id="assistant-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={placeholders[mode]}
          className="w-full resize-none rounded-2xl border border-ink/10 bg-terrain/50 p-4 font-body text-sm text-ink outline-none focus:border-marine/40 focus:ring-2 focus:ring-compass/30 transition-all"
        />
        <Button
          variant="primary"
          size="lg"
          className="mt-4 w-full"
          onClick={handleSubmit}
          disabled={loading || offline || text.trim().length < 10}
        >
          {loading ? "L'IA réfléchit…" : offline ? "Hors ligne — service indisponible" : "Expliquer simplement"}
        </Button>
        {text.trim().length > 0 && text.trim().length < 10 && (
          <p className="mt-2 font-body text-xs text-alert">Minimum 10 caractères pour lancer l'analyse.</p>
        )}
      </div>

      {loading && (
        <div className="mt-5 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="animate-shimmer h-4 w-2/3 rounded-full bg-ink/5" />
          <div className="animate-shimmer mt-3 h-3 w-full rounded-full bg-ink/5" />
          <div className="animate-shimmer mt-2 h-3 w-5/6 rounded-full bg-ink/5" />
          <div className="animate-shimmer mt-3 h-3 w-3/4 rounded-full bg-ink/5" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-5 rounded-2xl border border-alert/30 bg-alert/10 p-4 animate-scale-in">
          <p className="font-body text-sm leading-relaxed text-ink/80">{error}</p>
        </div>
      )}

      {answer && mode === "jargon" && <JargonAnswer answer={answer as JargonResponse} />}
      {answer && mode === "verification" && <VerificationAnswer answer={answer as VerificationResponse} />}

      <p className="mt-6 font-body text-xs leading-relaxed text-ink/30">
        Ce service est en ligne et optionnel : le reste de VibeWiki fonctionne sans lui.
      </p>

      <BottomNav />
    </div>
  )
}