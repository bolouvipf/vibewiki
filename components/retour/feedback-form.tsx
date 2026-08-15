"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"

const FEEDBACK_EMAIL = "bopiflo05@gmail.com"

const CATEGORIES = [
  { value: "bug", label: "🐞 Bug ou problème technique" },
  { value: "suggestion", label: "💡 Suggestion d'amélioration" },
  { value: "avis", label: "🗣️ Avis global / ressenti" },
  { value: "autre", label: "📝 Autre" },
] as const

type Category = (typeof CATEGORIES)[number]["value"]

export function FeedbackForm() {
  const [category, setCategory] = useState<Category>("bug")
  const [message, setMessage] = useState("")
  const [contact, setContact] = useState("")
  const [sent, setSent] = useState(false)

  function buildMailto(): string {
    const subject = encodeURIComponent(`[Vibewiki] Retour testeur — ${category}`)
    const bodyLines = [
      "--- Retour Vibewiki ---",
      `Catégorie : ${category}`,
      `Page : ${typeof window !== "undefined" ? window.location.href : ""}`,
      `Navigateur : ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`,
      "",
      "Message :",
      message.trim(),
      "",
      contact.trim() ? `Contact (pour te répondre) : ${contact.trim()}` : "",
    ]
    const body = encodeURIComponent(bodyLines.filter(Boolean).join("\n"))
    return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    window.location.href = buildMailto()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-moss/10 border border-moss/20 p-6 text-center animate-fade-in">
        <p className="text-2xl">🙏</p>
        <p className="mt-2 font-heading text-lg font-bold text-marine">Merci pour ton retour !</p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Ton logiciel de messagerie s'est ouvert avec le message prêt à envoyer — appuie simplement sur
          « Envoyer ». Si rien ne s'est ouvert, écris-nous directement à{" "}
          <span className="font-mono text-marine">{FEEDBACK_EMAIL}</span>.
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSent(false)}>
          Faire un autre retour
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-ink/40">
          Type de retour
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm text-ink focus:border-compass/50 focus:outline-none focus:ring-2 focus:ring-compass/30"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-ink/40">
          Ton message <span className="text-alert">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          required
          placeholder="Ce qui s'est passé, ce qui t'a bloqué, ce que tu aimerais… Sois précis, chaque détail aide."
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-compass/50 focus:outline-none focus:ring-2 focus:ring-compass/30"
        />
      </div>

      <div>
        <label htmlFor="contact" className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider text-ink/40">
          Ton contact (optionnel)
        </label>
        <input
          id="contact"
          type="email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="email ou pseudo, pour qu'on puisse te répondre"
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-compass/50 focus:outline-none focus:ring-2 focus:ring-compass/30"
        />
      </div>

      <p className="font-body text-xs text-ink/40">
        L'envoi ouvrira ton application de messagerie avec le message pré-rempli. La page visitée et le
        navigateur sont inclus automatiquement pour aider au diagnostic.
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={!message.trim()}>
        Envoyer mon retour
      </Button>
    </form>
  )
}