import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"

const pillars = [pillar1, pillar2, pillar3, pillar4]

for (const p of pillars) {
  console.log(`${p.pillarId}: notions=${p.notions?.length}, validationExercises=${p.validationExercises?.length}, technicalSheet=${typeof p.technicalSheet}`)
}
