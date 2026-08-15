import { z } from "zod"

export type ExerciseType =
  | "qcm_contextualise"
  | "vrai_faux_pas_verifiable"
  | "reperage_supposition"
  | "association_territoire"
  | "remise_en_ordre"
  | "question_de_verification"

const qcmPayload = z.object({
  options: z.array(z.string()),
  correctIndex: z.number(),
})

const vraiFauxPayload = z.object({
  affirmation: z.string(),
  correctAnswer: z.enum(["vrai", "faux", "pas_verifiable"]),
})

const reperagePayload = z.object({
  text: z.string(),
  suppositionStart: z.number(),
  suppositionEnd: z.number(),
})

const associationPayload = z.object({
  term: z.string(),
  correctPlace: z.string(),
  places: z.array(z.string()),
})

const remiseEnOrdrePayload = z.object({
  steps: z.array(z.string()),
  correctOrder: z.array(z.number()),
})

const questionVerificationPayload = z.object({
  affirmation: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
})

export type ExercisePayload =
  | { type: "qcm_contextualise" } & z.infer<typeof qcmPayload>
  | { type: "vrai_faux_pas_verifiable" } & { affirmation: string; correctAnswer: "vrai" | "faux" | "pas_verifiable" }
  | { type: "reperage_supposition" } & z.infer<typeof reperagePayload>
  | { type: "association_territoire" } & z.infer<typeof associationPayload>
  | { type: "remise_en_ordre" } & z.infer<typeof remiseEnOrdrePayload>
  | { type: "question_de_verification" } & z.infer<typeof questionVerificationPayload>

export function validateQCM(payload: unknown, answer: number) {
  const parsed = qcmPayload.parse(payload)
  return { correct: answer === parsed.correctIndex, correctIndex: parsed.correctIndex }
}

export function validateVraiFaux(payload: unknown, answer: "vrai" | "faux" | "pas_verifiable") {
  const parsed = vraiFauxPayload.parse(payload)
  return { correct: answer === parsed.correctAnswer, correctAnswer: parsed.correctAnswer }
}

export function validateReperage(payload: unknown, selectedStart: number, selectedEnd: number) {
  const parsed = reperagePayload.parse(payload)
  const correct = selectedStart === parsed.suppositionStart && selectedEnd === parsed.suppositionEnd
  return { correct }
}

export function validateAssociation(payload: unknown, answer: string) {
  const parsed = associationPayload.parse(payload)
  return { correct: answer === parsed.correctPlace, correctPlace: parsed.correctPlace }
}

export function validateRemiseEnOrdre(payload: unknown, answer: number[]) {
  const parsed = remiseEnOrdrePayload.parse(payload)
  const correct = answer.length === parsed.correctOrder.length && answer.every((v, i) => v === parsed.correctOrder[i])
  return { correct, correctOrder: parsed.correctOrder }
}

export function validateQuestionVerification(payload: unknown, answer: number) {
  const parsed = questionVerificationPayload.parse(payload)
  return { correct: answer === parsed.correctIndex, correctIndex: parsed.correctIndex }
}
