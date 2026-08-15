export interface EmergencyScenario {
  id: string
  title: string
  context: string
  iaMessage: string
  options: {
    text: string
    isCorrect: boolean
    consequence: string
    xpReward: number
  }[]
  pillar: string
  difficulty: "debutant" | "intermediaire" | "avance"
  notions: string[]
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: "emergency-001",
    title: "🚨 Site en panne",
    context: "Votre site est inaccessible depuis 10 minutes. Vos utilisateurs commencent à vous signaler le problème sur les réseaux sociaux.",
    iaMessage: "Le site est down. C'est probablement un problème de cache. Videz le cache Redis et redémarrez le serveur. Ça devrait résoudre le problème en 30 secondes.",
    options: [
      {
        text: "Vider le cache immédiatement et redémarrer",
        isCorrect: false,
        consequence: "❌ Le cache n'était pas le problème. En redémarrant, vous avez perdu les données de session de 200 utilisateurs connectés. Le site est toujours down.",
        xpReward: 0
      },
      {
        text: "Demander les logs d'erreur avant toute action",
        isCorrect: true,
        consequence: "✅ Excellente réaction ! Les logs montrent une erreur de connexion à la base de données (timeout). Le cache n'a rien à voir. Vous pouvez maintenant agir sur la vraie cause.",
        xpReward: 25
      },
      {
        text: "Redémarrer le serveur sans vérifier",
        isCorrect: false,
        consequence: "❌ Le redémarrage a masqué temporairement le problème, qui est revenu 10 minutes plus tard. Vous avez perdu du temps et de la crédibilité.",
        xpReward: 5
      }
    ],
    pillar: "transversal",
    difficulty: "intermediaire",
    notions: ["log", "environment", "deployment"]
  },
  {
    id: "emergency-002",
    title: "🚨 Fuite de données",
    context: "Un utilisateur vous contacte en panique : il voit les noms, emails et numéros de téléphone d'autres clients sur son tableau de bord.",
    iaMessage: "C'est un bug d'affichage front-end. Je vais corriger le composant React pour qu'il n'affiche que les données de l'utilisateur connecté. C'est une erreur de filtrage côté client.",
    options: [
      {
        text: "Corriger le composant front immédiatement",
        isCorrect: false,
        consequence: "⚠️ Le composant affiche ce que l'API lui envoie. Le vrai problème est côté serveur. Vous avez corrigé l'affichage mais pas la faille de sécurité.",
        xpReward: 5
      },
      {
        text: "Vérifier l'endpoint API et ses filtres de sécurité",
        isCorrect: true,
        consequence: "✅ Exact ! L'API GET /api/users renvoyait toutes les données sans filtrer par userId. C'est une faille de sécurité majeure. Vous devez immédiatement corriger l'endpoint et auditer tous les endpoints similaires.",
        xpReward: 30
      },
      {
        text: "Bloquer l'accès au site temporairement",
        isCorrect: false,
        consequence: "⚠️ C'est une réaction excessive sans comprendre l'ampleur du problème. Les données étaient déjà visibles. Il faut d'abord comprendre, puis agir ciblé.",
        xpReward: 10
      }
    ],
    pillar: "back",
    difficulty: "avance",
    notions: ["endpoint", "middleware", "authentication"]
  },
  {
    id: "emergency-003",
    title: "🚨 Build qui échoue mystérieusement",
    context: "Vous essayez de déployer une nouvelle fonctionnalité. Le build Vercel échoue avec un message d'erreur que vous ne comprenez pas.",
    iaMessage: "Le build échoue à cause d'une dépendance manquante. J'ai vérifié et c'est probablement un problème temporaire avec le registry npm. Relancez le déploiement, ça devrait passer.",
    options: [
      {
        text: "Relancer le déploiement immédiatement",
        isCorrect: false,
        consequence: "❌ Le build échoue à nouveau avec la même erreur. L'IA a supposé sans vérifier. Vous avez perdu 10 minutes.",
        xpReward: 0
      },
      {
        text: "Lire les logs Vercel ligne par ligne",
        isCorrect: true,
        consequence: "✅ Les logs montrent clairement : 'Module not found: react-icons'. La dépendance a été ajoutée dans le code mais pas dans package.json. L'IA a supposé que c'était un problème temporaire sans lire les logs.",
        xpReward: 25
      },
      {
        text: "Demander à l'IA de vérifier le package.json",
        isCorrect: true,
        consequence: "✅ Bonne question ! L'IA vérifie et trouve effectivement que 'react-icons' manque dans les dépendances. C'était une supposition de l'IA, pas un fait.",
        xpReward: 20
      }
    ],
    pillar: "transversal",
    difficulty: "debutant",
    notions: ["build", "dependency", "log", "deployment"]
  },
  {
    id: "emergency-004",
    title: "🚨 Le NULL qui casse tout",
    context: "Votre application affiche 'undefined' à la place du nom de certains utilisateurs sur la page de profil.",
    iaMessage: "Le problème vient du composant UserProfile qui n'affiche pas correctement le nom quand il est vide. C'est un problème de gestion d'état côté front. Ajoutons une valeur par défaut 'Utilisateur'.",
    options: [
      {
        text: "Ajouter une valeur par défaut côté front",
        isCorrect: false,
        consequence: "⚠️ Vous avez masqué le symptôme mais pas la cause. Le nom est NULL dans la base de données pour 15 utilisateurs. Le problème reviendra ailleurs.",
        xpReward: 5
      },
      {
        text: "Vérifier dans la base de données quelles lignes ont NULL",
        isCorrect: true,
        consequence: "✅ Vous trouvez que la colonne 'name' autorise NULL et que 15 utilisateurs l'ont laissée vide. Vous devez décider : ajouter une contrainte NOT NULL (obligatoire) ou gérer proprement l'affichage si NULL est légitime.",
        xpReward: 30
      },
      {
        text: "Demander à l'IA de vérifier le schéma de la table",
        isCorrect: true,
        consequence: "✅ L'IA vérifie et constate que la colonne n'a pas de contrainte NOT NULL. C'est une supposition de l'IA de dire que c'est un problème front.",
        xpReward: 25
      }
    ],
    pillar: "database",
    difficulty: "intermediaire",
    notions: ["NULL", "schema", "constraint", "query"]
  },
  {
    id: "emergency-005",
    title: "🚨 La dépendance abandonnée",
    context: "Vous voulez ajouter un calendrier interactif. L'IA propose d'utiliser la bibliothèque 'moment' pour gérer les dates.",
    iaMessage: "J'ajoute la dépendance 'moment' pour formater les dates. C'est la bibliothèque la plus populaire et la plus complète. Elle fait exactement ce qu'il vous faut.",
    options: [
      {
        text: "Installer moment sans poser de question",
        isCorrect: false,
        consequence: "❌ 'moment' est en mode maintenance depuis 2020 et pèse 232KB. Vous avez ajouté une dette technique. Il existe des alternatives 20x plus légères.",
        xpReward: 0
      },
      {
        text: "Vérifier quand la bibliothèque a été mise à jour pour la dernière fois",
        isCorrect: true,
        consequence: "✅ Vous découvrez que moment est déprécié. L'IA a supposé que 'populaire' = 'adapté'. Vous choisissez 'date-fns' (3KB, maintenue) à la place.",
        xpReward: 25
      },
      {
        text: "Demander la taille de la dépendance et ses alternatives",
        isCorrect: true,
        consequence: "✅ L'IA compare : moment (232KB), date-fns (3KB), dayjs (2KB). Vous choisissez la plus légère adaptée à votre besoin.",
        xpReward: 20
      }
    ],
    pillar: "transversal",
    difficulty: "intermediaire",
    notions: ["dependency", "security", "update"]
  }
]

export function validateEmergencyAnswer(scenarioId: string, optionIndex: number) {
  const scenario = EMERGENCY_SCENARIOS.find(s => s.id === scenarioId)
  if (!scenario) throw new Error("Scénario inconnu")
  const option = scenario.options[optionIndex]
  return {
    correct: option.isCorrect,
    consequence: option.consequence,
    xpReward: option.xpReward,
    scenario
  }
}

export function getRandomEmergencyScenario(pillar?: string): EmergencyScenario {
  const pool = pillar 
    ? EMERGENCY_SCENARIOS.filter(s => s.pillar === pillar)
    : EMERGENCY_SCENARIOS
  return pool[Math.floor(Math.random() * pool.length)]
}
