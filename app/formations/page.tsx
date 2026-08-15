"use client"

import Link from "next/link"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Card } from "@/components/ui/card"

const FORMATS = [
  {
    title: "Comprendre son ordinateur",
    tagline: "Fichiers, navigateur, terminal — les bases pour ne plus être perdu.",
    emoji: "🖥️",
    tag: "Débutant",
  },
  {
    title: "Piloter une IA avec Git",
    tagline: "Commits, branches, merges : du désordre au travail d'équipe propre.",
    emoji: "🌿",
    tag: "Intermédiaire",
  },
  {
    title: "Construire une page web",
    tagline: "HTML, CSS, JavaScript : de la maquette à la page qui répond.",
    emoji: "🧱",
    tag: "Intermédiaire",
  },
  {
    title: "Se faire aider par des agents IA",
    tagline: "Prompt engineering, contexte, règles : transformer l'IA en collègue fiable.",
    emoji: "🤖",
    tag: "Avancé",
  },
] as const

export default function FormationsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Territoire
        </Link>

        <h1 className="font-heading text-2xl font-bold text-marine">🎓 Formations</h1>
        <p className="font-body text-sm text-ink/50 mt-1">
          Des parcours vidéo animés par des développeurs, dans le même esprit que Vibewiki :
          comprendre, pas subir.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-compass/30 bg-compass/5 p-6 text-center animate-scale-in">
        <p className="text-3xl animate-float" role="img" aria-label="bientôt disponible">🚧</p>
        <p className="mt-2 font-heading text-xl font-bold text-marine">Bientôt disponible</p>
        <p className="mt-1 font-body text-sm text-ink/60">
          L'espace de formations payantes arrive. Rejoignez la liste d'attente en{" "}
          <a href="mailto:bopiflo05@gmail.com" className="font-semibold text-compass underline decoration-compass/40 underline-offset-2 hover:text-marine">
            nous écrivant
          </a>{" "}
          — et restez à l'affût.
        </p>
      </div>

      <div className="my-6 flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-ink/10 to-transparent" />
        <span className="font-heading text-xs uppercase tracking-widest text-ink/30">Parcours prévus</span>
        <span className="h-px flex-1 bg-gradient-to-l from-ink/10 to-transparent" />
      </div>

      <div className="space-y-4">
        {FORMATS.map((f) => (
          <Card key={f.title} variant="premium" className="p-5 opacity-80">
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-hidden="true">{f.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-bold text-marine">{f.title}</h2>
                  <span className="rounded-full bg-moss/10 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-moss">
                    {f.tag}
                  </span>
                </div>
                <p className="mt-1 font-body text-sm text-ink/50">{f.tagline}</p>
                <p className="mt-2 font-body text-xs font-semibold text-compass">🎬 Vidéos animées · à venir</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}