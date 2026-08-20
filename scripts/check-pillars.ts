import pillar0 from "@/content/piliers/00-parcours.json"
import pillar1 from "@/content/piliers/01-transversal.json"
import pillar2 from "@/content/piliers/02-front.json"
import pillar3 from "@/content/piliers/03-back.json"
import pillar4 from "@/content/piliers/04-database.json"
import pillar5 from "@/content/piliers/05-ia.json"

const pillars = [pillar0, pillar1, pillar2, pillar3, pillar4, pillar5]

for (const p of pillars) {
  console.log(`${p.pillarId}: notions=${p.notions?.length}, validationExercises=${p.validationExercises?.length}, technicalSheet=${typeof p.technicalSheet}`)
}
