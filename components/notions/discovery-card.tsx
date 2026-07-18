"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export interface DiscoveryCardProps {
  term: string
  shortDefinition: string
  practicalMeaning: string
  example: string
  onDismiss: () => void
  pillarAccent?: string
}

export function DiscoveryCard({
  term,
  shortDefinition,
  practicalMeaning,
  example,
  onDismiss,
  pillarAccent = "bg-compass/10",
}: DiscoveryCardProps) {
  return (
    <div className="animate-scale-in">
      <Card variant="premium" className="overflow-hidden">
        <div className={`-mx-6 -mt-6 mb-5 px-6 pt-5 pb-4 ${pillarAccent}`}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <svg className="size-5 text-marine" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                Nouveau terme découvert
              </p>
              <p className="font-heading text-xl font-bold text-marine">{term}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">
            Définition
          </p>
          <p className="font-body text-sm leading-relaxed text-ink/80">{shortDefinition}</p>
        </div>

        <div className="mb-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">
            Ce que ça veut dire pour vous
          </p>
          <p className="font-body text-sm leading-relaxed text-ink/80">{practicalMeaning}</p>
        </div>

        <div className="mb-6 rounded-lg bg-terrain/60 p-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink/40 mb-2">
            Exemple concret
          </p>
          <p className="font-body text-sm leading-relaxed italic text-ink/70">
            &ldquo;{example}&rdquo;
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onDismiss}
          className="w-full"
        >
          J&rsquo;ai compris
        </Button>
      </Card>
    </div>
  )
}
