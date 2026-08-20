import { NextRequest, NextResponse } from "next/server"
import { callLlm } from "@/lib/assistant/llm"
import { explainRequestSchema } from "@/lib/assistant/schema"

export const runtime = "nodejs"
export const maxDuration = 30

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

const ipHits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hit = ipHits.get(ip)
  if (!hit || hit.resetAt <= now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  hit.count += 1
  return hit.count > RATE_LIMIT_MAX
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Trop de requêtes. Réessayez dans une minute." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  const parsed = explainRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Requête invalide." },
      { status: 400 },
    )
  }

  const result = await callLlm(parsed.data)
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error ?? "Erreur inconnue." }, { status: 502 })
  }

  return NextResponse.json({ mode: parsed.data.mode, answer: result.data })
}
