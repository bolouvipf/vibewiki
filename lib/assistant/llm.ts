import { RETRY_CORRECTION, SYSTEM_PROMPTS } from "./prompts"
import {
  parseJargonResponse,
  parseVerificationResponse,
  type ExplainRequest,
  type JargonResponse,
  type VerificationResponse,
} from "./schema"

export const DEFAULT_LLM_URL = "https://api.openai.com/v1/chat/completions"
export const DEFAULT_LLM_MODEL = "gpt-4o-mini"
export const LLM_MAX_TOKENS = 800

export interface LlmResult<T> {
  ok: boolean
  data?: T
  error?: string
}

interface LlmDeps {
  fetchImpl?: typeof fetch
  apiKey?: string
  baseUrl?: string
  model?: string
}

function buildUserMessage(request: ExplainRequest, retry: boolean): string {
  const prefix = retry ? RETRY_CORRECTION + "\n\n" : ""
  return `${prefix}Texte à analyser :\n"""\n${request.text}\n"""`
}

async function requestCompletion(
  request: ExplainRequest,
  retry: boolean,
  deps: Required<Pick<LlmDeps, "fetchImpl" | "apiKey" | "baseUrl" | "model">>,
): Promise<string> {
  const response = await deps.fetchImpl(deps.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${deps.apiKey}`,
    },
    body: JSON.stringify({
      model: deps.model,
      temperature: 0.4,
      max_tokens: LLM_MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[request.mode] },
        { role: "user", content: buildUserMessage(request, retry) },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("LLM response had no content")
  }
  return content
}

export async function callLlm(request: ExplainRequest, deps: LlmDeps = {}): Promise<LlmResult<JargonResponse | VerificationResponse>> {
  const apiKey = deps.apiKey ?? process.env.LLM_API_KEY
  if (!apiKey) {
    return { ok: false, error: "Clé LLM non configurée côté serveur." }
  }

  const fetchImpl = deps.fetchImpl ?? fetch
  const baseUrl = deps.baseUrl ?? process.env.LLM_BASE_URL ?? DEFAULT_LLM_URL
  const model = deps.model ?? process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL
  const required = { fetchImpl, apiKey, baseUrl, model }

  const parse = (content: string) =>
    request.mode === "jargon"
      ? parseJargonResponse(content)
      : parseVerificationResponse(content)

  for (const retry of [false, true]) {
    try {
      const content = await requestCompletion(request, retry, required)
      const parsed = parse(content)
      if (parsed) {
        return { ok: true, data: parsed }
      }
    } catch (error) {
      if (retry) {
        return { ok: false, error: error instanceof Error ? error.message : "Erreur de communication avec le modèle." }
      }
    }
  }

  return { ok: false, error: "Le modèle n'a pas produit de réponse exploitable." }
}
