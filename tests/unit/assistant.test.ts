import { describe, it, expect } from "bun:test"
import {
  explainRequestSchema,
  parseAssistantJson,
  parseJargonResponse,
  parseVerificationResponse,
  MAX_INPUT_LENGTH,
} from "@/lib/assistant/schema"
import { callLlm } from "@/lib/assistant/llm"

const jargonText = "Le build a échoué : ENOENT, no such file or directory."

describe("explainRequestSchema", () => {
  it("accepts a valid request", () => {
    const r = explainRequestSchema.safeParse({ text: jargonText, mode: "jargon" })
    expect(r.success).toBe(true)
  })

  it("rejects text shorter than 10 characters", () => {
    const r = explainRequestSchema.safeParse({ text: "court", mode: "jargon" })
    expect(r.success).toBe(false)
  })

  it("rejects text longer than the maximum length", () => {
    const r = explainRequestSchema.safeParse({ text: "a".repeat(MAX_INPUT_LENGTH + 1), mode: "verification" })
    expect(r.success).toBe(false)
  })

  it("rejects an unknown mode", () => {
    const r = explainRequestSchema.safeParse({ text: jargonText, mode: "inconnu" })
    expect(r.success).toBe(false)
  })
})

describe("parseAssistantJson", () => {
  it("parses a plain JSON object", () => {
    const v = parseAssistantJson('{"a": 1}')
    expect(v).toEqual({ a: 1 })
  })

  it("parses JSON wrapped in code fences", () => {
    const v = parseAssistantJson('```json\n{"a": 1}\n```')
    expect(v).toEqual({ a: 1 })
  })

  it("returns null on invalid JSON", () => {
    expect(parseAssistantJson("pas du json")).toBeNull()
  })
})

describe("parseJargonResponse", () => {
  const valid = {
    explication: "Signification simple",
    aQuoiCaSert: "Utilité concrète",
    exemple: "Exemple réaliste",
    commentVerifier: "Question à poser",
  }

  it("parses a valid response", () => {
    const r = parseJargonResponse(JSON.stringify(valid))
    expect(r).toEqual(valid)
  })

  it("returns null when a field is missing", () => {
    const partial = { explication: "Signification simple", aQuoiCaSert: "Utilité concrète", exemple: "Exemple réaliste" }
    expect(parseJargonResponse(JSON.stringify(partial))).toBeNull()
  })
})

describe("parseVerificationResponse", () => {
  const valid = {
    rappel: "Ce point mérite vérification",
    questions: [{ question: "Quelle version ?", pourquoi: "Pour confirmer le chiffre." }],
  }

  it("parses a valid response", () => {
    const r = parseVerificationResponse(JSON.stringify(valid))
    expect(r).toEqual(valid)
  })

  it("returns null with no questions", () => {
    expect(parseVerificationResponse(JSON.stringify({ rappel: "x", questions: [] }))).toBeNull()
  })
})

function jsonResponse(content: string) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}

describe("callLlm", () => {
  const request = { text: jargonText, mode: "jargon" as const }

  it("returns an error when no API key is configured", async () => {
    const r = await callLlm(request, { apiKey: "" })
    expect(r.ok).toBe(false)
  })

  it("parses a valid jargon response", async () => {
    const answer = {
      explication: "Le build a échoué",
      aQuoiCaSert: "Cela indique où chercher",
      exemple: "Fichier manquant",
      commentVerifier: "Demander quel fichier",
    }
    const r = await callLlm(request, {
      apiKey: "cle-test",
      fetchImpl: async () => jsonResponse(JSON.stringify(answer)),
    })
    expect(r.ok).toBe(true)
    expect(r.data).toEqual(answer)
  })

  it("retries once when the model returns invalid JSON", async () => {
    const answer = {
      explication: "E",
      aQuoiCaSert: "A",
      exemple: "X",
      commentVerifier: "C",
    }
    let calls = 0
    const r = await callLlm(request, {
      apiKey: "cle-test",
      fetchImpl: async () => {
        calls += 1
        return jsonResponse(calls === 1 ? "pas du json" : JSON.stringify(answer))
      },
    })
    expect(calls).toBe(2)
    expect(r.ok).toBe(true)
    expect(r.data).toEqual(answer)
  })

  it("fails after two invalid attempts", async () => {
    const r = await callLlm(request, {
      apiKey: "cle-test",
      fetchImpl: async () => jsonResponse("pas du json"),
    })
    expect(r.ok).toBe(false)
  })

  it("fails when the provider returns an error status", async () => {
    const r = await callLlm(request, {
      apiKey: "cle-test",
      fetchImpl: async () => new Response("{}", { status: 401 }),
    })
    expect(r.ok).toBe(false)
  })

  it("parses a valid verification response", async () => {
    const answer = {
      rappel: "La version annoncée est à vérifier",
      questions: [{ question: "Quelle version exacte ?", pourquoi: "Pour la confirmer." }],
    }
    const r = await callLlm({ text: "Tout est prêt pour la production.", mode: "verification" }, {
      apiKey: "cle-test",
      fetchImpl: async () => jsonResponse(JSON.stringify(answer)),
    })
    expect(r.ok).toBe(true)
    expect(r.data).toEqual(answer)
  })
})