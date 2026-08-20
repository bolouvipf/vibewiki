import { z } from "zod"

export const assistantModes = ["jargon", "verification"] as const
export type AssistantMode = (typeof assistantModes)[number]

export const MAX_INPUT_LENGTH = 4000
export const MIN_INPUT_LENGTH = 10

export const explainRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_INPUT_LENGTH, `Texte trop court (minimum ${MIN_INPUT_LENGTH} caractères).`)
    .max(MAX_INPUT_LENGTH, `Texte trop long (maximum ${MAX_INPUT_LENGTH} caractères).`),
  mode: z.enum(assistantModes),
})

export type ExplainRequest = z.infer<typeof explainRequestSchema>

export const jargonResponseSchema = z.object({
  explication: z.string().min(1),
  aQuoiCaSert: z.string().min(1),
  exemple: z.string().min(1),
  commentVerifier: z.string().min(1),
})

export type JargonResponse = z.infer<typeof jargonResponseSchema>

export const verificationResponseSchema = z.object({
  rappel: z.string().min(1),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        pourquoi: z.string().min(1),
      }),
    )
    .min(1)
    .max(6),
})

export type VerificationResponse = z.infer<typeof verificationResponseSchema>

export function parseAssistantJson(content: string): unknown {
  const trimmed = content.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : trimmed
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

export function parseJargonResponse(content: string): JargonResponse | null {
  const parsed = parseAssistantJson(content)
  if (parsed === null) return null
  const result = jargonResponseSchema.safeParse(parsed)
  return result.success ? result.data : null
}

export function parseVerificationResponse(content: string): VerificationResponse | null {
  const parsed = parseAssistantJson(content)
  if (parsed === null) return null
  const result = verificationResponseSchema.safeParse(parsed)
  return result.success ? result.data : null
}