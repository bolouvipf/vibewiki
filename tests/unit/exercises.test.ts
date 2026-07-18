import { describe, it, expect } from "bun:test"
import {
  validateQCM,
  validateVraiFaux,
  validateReperage,
  validateAssociation,
  validateRemiseEnOrdre,
  validateQuestionVerification,
} from "@/lib/exercises/validators"

describe("validateQCM", () => {
  const payload = { options: ["A", "B", "C"], correctIndex: 1 }

  it("returns correct=true when answer matches correctIndex", () => {
    const r = validateQCM(payload, 1)
    expect(r.correct).toBe(true)
    expect(r.correctIndex).toBe(1)
  })

  it("returns correct=false when answer is wrong", () => {
    const r = validateQCM(payload, 0)
    expect(r.correct).toBe(false)
    expect(r.correctIndex).toBe(1)
  })
})

describe("validateVraiFaux", () => {
  const payload = { affirmation: "Le ciel est bleu", correctAnswer: "vrai" as const }

  it("returns correct=true for matching answer", () => {
    const r = validateVraiFaux(payload, "vrai")
    expect(r.correct).toBe(true)
    expect(r.correctAnswer).toBe("vrai")
  })

  it("returns correct=false for wrong answer", () => {
    const r = validateVraiFaux(payload, "faux")
    expect(r.correct).toBe(false)
    expect(r.correctAnswer).toBe("vrai")
  })

  it("handles pas_verifiable answer", () => {
    const p = { affirmation: "Test", correctAnswer: "pas_verifiable" as const }
    const r = validateVraiFaux(p, "pas_verifiable")
    expect(r.correct).toBe(true)
    expect(r.correctAnswer).toBe("pas_verifiable")
  })
})

describe("validateReperage", () => {
  const payload = { text: "Long text", suppositionStart: 5, suppositionEnd: 12 }

  it("returns correct=true when selection matches", () => {
    const r = validateReperage(payload, 5, 12)
    expect(r.correct).toBe(true)
  })

  it("returns correct=false when start differs", () => {
    const r = validateReperage(payload, 6, 12)
    expect(r.correct).toBe(false)
  })
})

describe("validateAssociation", () => {
  const payload = { term: "Git", correctPlace: "GitHub", places: ["GitHub", "Vercel", "Supabase"] }

  it("returns correct=true for matching answer", () => {
    const r = validateAssociation(payload, "GitHub")
    expect(r.correct).toBe(true)
    expect(r.correctPlace).toBe("GitHub")
  })

  it("returns correct=false for wrong answer", () => {
    const r = validateAssociation(payload, "Vercel")
    expect(r.correct).toBe(false)
    expect(r.correctPlace).toBe("GitHub")
  })
})

describe("validateRemiseEnOrdre", () => {
  const payload = { steps: ["A", "B", "C"], correctOrder: [0, 1, 2] }

  it("returns correct=true for exact match", () => {
    const r = validateRemiseEnOrdre(payload, [0, 1, 2])
    expect(r.correct).toBe(true)
    expect(r.correctOrder).toEqual([0, 1, 2])
  })

  it("returns correct=false for wrong order", () => {
    const r = validateRemiseEnOrdre(payload, [2, 1, 0])
    expect(r.correct).toBe(false)
    expect(r.correctOrder).toEqual([0, 1, 2])
  })
})

describe("validateQuestionVerification", () => {
  const payload = { affirmation: "Test", options: ["Non", "Oui", "Peut-être"], correctIndex: 2 }

  it("returns correct=true when answer matches correctIndex", () => {
    const r = validateQuestionVerification(payload, 2)
    expect(r.correct).toBe(true)
    expect(r.correctIndex).toBe(2)
  })

  it("returns correct=false when answer is wrong", () => {
    const r = validateQuestionVerification(payload, 0)
    expect(r.correct).toBe(false)
    expect(r.correctIndex).toBe(2)
  })
})
