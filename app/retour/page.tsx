"use client"

import Link from "next/link"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Card } from "@/components/ui/card"
import { FeedbackForm } from "@/components/retour/feedback-form"

export default function RetourPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-8 animate-fade-in">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 font-body text-xs text-ink/40 hover:text-compass transition-colors mb-4">
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Territoire
        </Link>

        <h1 className="font-heading text-2xl font-bold text-marine">💬 Faire un retour</h1>
        <p className="font-body text-sm text-ink/50 mt-1">
          Testeur ? Dis-nous ce qui s'est passé, ce qui bloque ou ce qui manque. Chaque retour fait avancer Vibewiki.
        </p>
      </div>

      <Card className="p-5">
        <FeedbackForm />
      </Card>

      <p className="mt-6 text-center font-body text-xs text-ink/30">
        Tu peux aussi nous écrire directement :{" "}
        <a href="mailto:bopiflo05@gmail.com" className="font-mono text-marine hover:text-compass">
          bopiflo05@gmail.com
        </a>
      </p>

      <BottomNav />
    </div>
  )
}