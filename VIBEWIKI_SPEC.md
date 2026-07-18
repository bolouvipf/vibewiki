# Vibewiki — Spécification complète de génération
*Comprendre, pas subir.*

> Ce document est destiné à être donné **tel quel à OpenCode** pour générer l'application dans son intégralité. Il contient l'architecture, la stack, les fonctionnalités et les étapes. Bun est installé sur la machine cible : OpenCode peut installer les dépendances, lancer le serveur de dev et exécuter les tests avec `bun`.

---

## 0. Contexte produit (résumé)

Vibewiki est une PWA d'apprentissage pour des personnes **qui ne codent pas** mais pilotent un ou plusieurs assistants IA (Claude, ChatGPT, OpenCode, Cursor…) pour construire ou maintenir un projet réel. L'app n'apprend pas à coder — elle apprend à **comprendre suffisamment** pour ne jamais valider une décision technique de l'IA sans la juger : reconnaître le vocabulaire, situer les composants d'une architecture, repérer une supposition non vérifiée dans une explication de l'IA, et savoir quelle question poser pour vérifier.

Le contenu est organisé en **4 piliers**, ceux du développement web réel (et non en axes abstraits, et non par langage de programmation) — ordre de progression : **Outils transversaux → Front → Back → Database**.

1. **Outils transversaux (le socle commun)** — git/GitHub (commit, branch, merge, pull request, push/pull, conflit), node/npm/bun (package, dépendance, script, runtime), build, environnement (dev/staging/prod), variable d'environnement, secrets/.env, CI/CD, déploiement, domaine. Inclut aussi les tâches automatisées sans supervision directe (scripts planifiés, où ils loguent, comment savoir s'ils ont échoué).
2. **Front (ce que l'utilisateur voit)** — composant, props/state, rendu, hydratation, responsive, route/page, framework (React/Next.js), style/CSS, cache navigateur.
3. **Back (la logique serveur / API)** — endpoint, méthode HTTP, statut HTTP, middleware, authentification, session/token, fonction serverless, requête/réponse.
4. **Database (les données)** — table, ligne/colonne, requête SQL, schéma, migration, trigger, relation/clé étrangère, index, contrainte, NULL.

Dans **chacun** des 4 piliers, le contenu applique les mêmes 4 lentilles : vocabulaire du pilier, lecture de diagnostic sans le subir, détection des suppositions de l'IA ("je suppose que…", "cela devrait…" → transformer en question de vérification), et localisation dans l'architecture réelle ("où ça vit", qui alimente la carte "territoire personnel").

Gamification façon Duolingo (réinterprétée, pas copiée) : XP, streak, vies, ligues, révision espacée.

Dictionnaire personnel **offline**, qui grandit avec les termes validés par l'utilisateur au fil des leçons — c'est un carnet de bord, pas une liste statique.

---

## 1. Architecture de l'application

### 1.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                     Client (PWA, offline-first)          │
│                                                            │
│  ┌───────────────┐   ┌─────────────────┐   ┌───────────┐ │
│  │  UI Next.js    │──▶│  Moteur de       │──▶│ IndexedDB │ │
│  │  (App Router)  │   │  leçons/exos     │   │ (Dexie)   │ │
│  └───────────────┘   └─────────────────┘   └─────┬─────┘ │
│         │                                          │       │
│         ▼                                          ▼       │
│  ┌───────────────┐                        ┌───────────────┐│
│  │ Territoire     │                        │ Dictionnaire  ││
│  │ personnel (UI) │                        │ personnel     ││
│  └───────────────┘                        │ (offline)     ││
│                                             └───────┬───────┘│
│  Service Worker (Serwist) — cache assets + shell    │       │
└──────────────────────────────────────────────────────┼──────┘
                                                           │ sync opportuniste
                                                           ▼
                                         ┌─────────────────────────┐
                                         │ Supabase (Auth + Postgres)│
                                         │ - comptes utilisateurs    │
                                         │ - sauvegarde progression  │
                                         │ - contenu des leçons      │
                                         │   (source de vérité)      │
                                         └─────────────────────────┘
```

**Principe directeur : offline-first.** Le dictionnaire personnel et la progression fonctionnent 100% sans connexion, stockés en local (IndexedDB). Supabase n'intervient que pour l'authentification optionnelle et la synchronisation multi-appareils. Le contenu des leçons est embarqué localement (fichiers JSON versionnés dans l'app) et éventuellement mis à jour depuis Supabase quand une connexion est disponible — l'app doit rester 100% utilisable sans jamais avoir été en ligne après l'installation initiale.

### 1.2 Structure de dossiers (Next.js App Router)

```
vibewiki/
├── app/
│   ├── layout.tsx                  # layout racine, thème, providers
│   ├── page.tsx                    # écran d'accueil = "territoire personnel"
│   ├── piliers/
│   │   ├── [pillarId]/              # 'transversal' | 'front' | 'back' | 'database'
│   │   │   ├── page.tsx            # fiche technique du pilier (explication + utilité) = entrée de la zone du territoire
│   │   │   ├── notions/
│   │   │   │   └── [notionId]/page.tsx  # cours court de la notion + ses exercices (dont exercices cumulatifs)
│   │   │   └── validation/
│   │   │       └── page.tsx        # les 3 exercices de validation finale, mélangeant toutes les notions du pilier
│   ├── dictionnaire/
│   │   ├── page.tsx                # carnet de bord (recherche/filtre)
│   │   └── [termId]/page.tsx       # fiche détaillée d'un terme
│   ├── profil/
│   │   └── page.tsx                # XP, streak, vies, ligue, compte
│   └── api/
│       └── sync/route.ts           # endpoint de synchronisation optionnelle
├── components/
│   ├── territoire/                 # carte personnelle, zones, progression visuelle
│   ├── notions/                     # composants : fiche technique, cours, exercices (QCM, vrai/faux, etc.), écran de validation
│   ├── dictionnaire/                # fiche terme, carnet de bord
│   └── ui/                          # boutons, cartes, badges, primitives partagées
├── lib/
│   ├── db/
│   │   ├── schema.ts                # schéma Dexie (IndexedDB)
│   │   └── queries.ts               # accès dictionnaire/progression en local
│   ├── supabase/
│   │   ├── client.ts
│   │   └── sync.ts                  # logique de synchronisation opportuniste
│   ├── exercises/
│   │   └── validators.ts            # logique de validation par type d'exercice
│   └── gamification/
│       └── engine.ts                # calcul XP, streak, vies, ligues
├── content/
│   └── piliers/
│       ├── 01-transversal.json
│       ├── 02-front.json
│       ├── 03-back.json
│       └── 04-database.json
├── public/
│   ├── manifest.json                # manifeste PWA
│   └── icons/
├── tests/
│   ├── unit/
│   │   ├── exercises.test.ts
│   │   ├── dictionary.test.ts
│   │   └── gamification.test.ts
│   └── integration/
│       └── pillar-flow.test.ts      # fiche technique → notions cumulatives → validation finale
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 1.3 Modèle de données

```ts
// Terme du dictionnaire personnel (mémoire longue durée — alimenté quand une notion est maîtrisée)
interface Term {
  id: string;
  term: string;
  shortDefinition: string;
  practicalMeaning: string;       // "à quoi ça sert concrètement"
  example: string;                // exemple contextualisé
  pillar: 'transversal' | 'front' | 'back' | 'database';
  masteryLevel: 'decouvert' | 'en_cours' | 'maitrise';
  firstSeenAt: string;            // ISO date
  masteredAt?: string;
  sourceNotionId: string;
  nextReviewAt?: string;          // révision espacée
}

// Pilier = module complet
interface Pillar {
  id: 'transversal' | 'front' | 'back' | 'database';
  title: string;
  order: number;
  technicalSheet: {
    explanation: string;          // qu'est-ce que ce pilier, en langage courant
    utility: string;              // à quoi il sert concrètement, pourquoi l'IA en parle sans arrêt
  };
  notions: Notion[];              // apprentissage séquentiel, dans l'ordre du tableau
  validationExercises: Exercise[]; // exactement 3, chacun mélangeant plusieurs notions du pilier
}

// Notion = une brique de connaissance : cours court, puis exercices
interface Notion {
  id: string;
  term: string;
  order: number;                  // position dans le pilier
  course: {
    explanation: string;          // qu'est-ce que c'est, en une ou deux phrases
    practicalMeaning: string;     // à quoi ça sert concrètement
    example: string;              // exemple concret et réaliste, jamais une reformulation de l'explication
  };
  exercises: Exercise[];          // au moins 1 exercice sur cette notion ; à partir de la
                                   // 2e notion du pilier, au moins 1 exercice DOIT remobiliser
                                   // une notion précédente du même pilier (voir 4.1)
}

type ExerciseType =
  | 'qcm_contextualise'
  | 'vrai_faux_pas_verifiable'
  | 'reperage_supposition'
  | 'association_territoire'
  | 'remise_en_ordre'
  | 'question_de_verification';

interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  payload: unknown;               // structure spécifique au type (voir 4.1)
  relatedTermIds: string[];       // plusieurs ids pour un exercice cumulatif ou de validation
}

// Progression utilisateur
interface UserProgress {
  userId: string;                 // id local si pas de compte
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  hearts: number;
  league?: string;
  completedNotionIds: string[];
  validatedPillarIds: string[];   // pilier marqué complet après réussite des 3 exercices de validation
}
```

Schéma Dexie (IndexedDB) : une table `terms`, une table `progress`, une table `pillarsCache` (copie locale du contenu embarqué + mises à jour éventuelles), indexées par `id` et par `pillar`/`masteryLevel` pour les filtres du dictionnaire.

### 1.4 Responsive — exigences précises

Mobile-first, breakpoints Tailwind standards :

| Breakpoint | Largeur | Comportement du "territoire personnel" |
|---|---|---|
| `base` (mobile) | < 640px | Carte affichée en défilement vertical, une zone à la fois, navigation par onglets en bas d'écran |
| `md` (tablette) | 641–1024px | Carte en grille 2 colonnes, dictionnaire accessible en panneau latéral rétractable |
| `lg` (desktop) | > 1024px | Carte complète visible en un écran, dictionnaire en panneau latéral fixe, navigation en haut |

Règles transverses :
- Zones tactiles ≥ 44px sur mobile.
- Aucun contenu ne doit nécessiter de défilement horizontal.
- Le moteur de leçons (exercices) doit être utilisable au clavier et au tactile de façon identique.
- Testé visuellement à 375px, 768px, 1024px, 1440px minimum.

### 1.5 Architecture PWA

- `manifest.json` : nom "Vibewiki", icônes 192/512, `display: standalone`, couleur de thème = bleu carte marine.
- Service worker via **Serwist** : stratégie *cache-first* pour l'app shell et les assets statiques, *network-first avec repli local* pour l'endpoint de synchronisation, aucune dépendance réseau pour la lecture du dictionnaire ou la poursuite d'une leçon déjà téléchargée.
- Contenu des leçons (`content/piliers/*.json`) embarqué au build, donc disponible dès la première ouverture sans connexion.

---

## 2. Stack technique

| Couche | Choix | Détail |
|---|---|---|
| Runtime / gestionnaire de paquets | **Bun** | `bun install`, `bun run dev`, `bun test` |
| Framework | **Next.js 14+ (App Router)** | TypeScript strict |
| Style | **Tailwind CSS** | tokens de design en section 4 |
| PWA | **Serwist** | service worker + manifest |
| Stockage local | **Dexie.js** (IndexedDB) | dictionnaire + progression offline |
| Backend / Auth / Sync | **Supabase** (Auth + Postgres) | optionnel, jamais bloquant |
| Validation de schéma | **Zod** | validation des payloads d'exercices et des données Supabase |
| Tests | **Bun test runner natif** (`bun test`) | unitaire + intégration, pas de dépendance de test supplémentaire |
| Lint / format | **ESLint + Prettier** | config stricte TypeScript |

Aucune dépendance de test externe (Vitest/Jest) n'est nécessaire : Bun embarque son propre test runner, à utiliser directement.

---

## 3. Identité visuelle (tokens à respecter strictement)

**Couleurs :**
- Bleu carte marine (primaire) `#1E2D4F`
- Or vibewiki (accent, validations/XP) `#D9A441`
- Papier terrain (fond) `#EEF0EA`
- Argile alerte (supposition IA détectée) `#B5502F`
- Mousse validée (terme maîtrisé) `#5B7A5E`
- Encre (texte) `#202A22`

**Typographie :**
- Titres : **Space Grotesk**
- Texte courant : **Karla**
- Citations de vocabulaire technique / glossaire : **IBM Plex Mono**

**Signature visuelle :** le "territoire personnel" sur l'écran d'accueil — une carte à 4 zones qui se remplit progressivement (une zone = un pilier : Outils transversaux, Front, Back, Database), plutôt qu'une barre de progression générique. Le dictionnaire est présenté comme un carnet de bord (repères posés sur le territoire exploré), pas une liste alphabétique froide.

**À éviter explicitement :** fond crème + accent terracotta (cliché "app IA" actuel), fond noir + vert/vermillon (cliché "hacker"), numérotation 01/02/03 décorative sans réelle séquence.

---

## 4. Fonctionnalités détaillées

### 4.1 Parcours d'un pilier : fiche technique, cours par notion, rappel cumulatif, validation finale

Le parcours d'un pilier suit toujours la même séquence en 3 temps :

**a) Fiche technique du pilier (une fois, à l'entrée du pilier)** — `Pillar.technicalSheet` : une explication en langage courant de ce qu'est ce pilier, et son utilité concrète (pourquoi l'IA en parle sans arrêt). C'est l'équivalent d'une carte d'orientation, pas un cours — quelques paragraphes maximum.

**b) Cours court + exercices, notion par notion** — pour chaque `Notion` du pilier, dans l'ordre :
1. Le cours court (`Notion.course` : explication, à quoi ça sert, exemple concret et réaliste) est affiché.
2. Un ou plusieurs exercices testent cette notion.
3. **À partir de la 2e notion du pilier**, chaque série d'exercices doit inclure **au moins un exercice qui remobilise une notion précédente du même pilier** (`Exercise.relatedTermIds` avec plusieurs ids) — pas seulement la notion qu'on vient d'apprendre. C'est ce rappel cumulatif, répété à chaque nouvelle notion, qui fait passer l'information de la mémoire courte à la mémoire longue durée, plutôt que le seul passage en révision espacée globale.

**c) Validation finale du pilier** — une fois toutes les notions vues, `Pillar.validationExercises` propose **exactement 3 exercices** qui mélangent plusieurs notions du pilier à la fois (jamais un exercice mono-notion à ce stade). Le pilier n'est marqué complet (`validatedPillarIds`) qu'après réussite de ces 3 exercices.

Types d'exercices disponibles pour (b) et (c), aucun n'exige d'écrire du code :

- **QCM contextualisé** : une réponse/diagnostic d'IA est montrée, l'utilisateur choisit ce qu'il doit en comprendre.
- **Vrai / Faux / Pas vérifiable en l'état** : entraîne à distinguer affirmation solide et supposition.
- **Repérage de supposition** : dans un extrait de réponse IA, l'utilisateur sélectionne la phrase qui annonce une hypothèse non vérifiée.
- **Association territoire** : relie un terme à l'endroit où il "vit" (GitHub / Vercel / Supabase / variables d'environnement).
- **Remise en ordre** : reconstitue les étapes logiques d'un déploiement ou d'un diagnostic.
- **Question de vérification** : à partir d'une affirmation IA, choisir la bonne question à poser pour la faire confirmer.

Logique de validation centralisée dans `lib/exercises/validators.ts`, une fonction pure par type d'exercice, testée unitairement.

La réussite d'une notion déclenche l'ajout ou la mise à jour du `Term` correspondant dans le dictionnaire (`masteryLevel` progresse : `decouvert` → `en_cours` après la notion, puis → `maitrise` après un exercice cumulatif ou de validation réussi qui la remobilise).

### 4.2 Dictionnaire offline évolutif

- Consultable et cherchable 100% hors-ligne.
- Filtrable par catégorie et par niveau de maîtrise.
- Chaque fiche affiche : définition courte, usage concret, exemple, niveau, date de validation, notion et pilier d'origine.
- Alimenté automatiquement par la progression réelle de l'utilisateur — jamais préchargé en entier comme un lexique figé.

### 4.3 Gamification

- **XP** par exercice réussi.
- **Streak** (jours consécutifs d'activité).
- **Vies** : perdues sur erreur, régénérées avec le temps.
- **Ligues hebdomadaires** (optionnel si Supabase connecté, sinon désactivé proprement en local seul).
- **Révision espacée** : les termes `en_cours` réapparaissent à intervalles croissants jusqu'à `maitrise`.

### 4.4 Authentification et synchronisation

- Utilisation possible sans compte (tout en local).
- Compte optionnel via Supabase pour retrouver sa progression sur un autre appareil.
- Synchronisation opportuniste : dès qu'une connexion est détectée et qu'un compte existe, `lib/supabase/sync.ts` pousse/tire les deltas de progression et de dictionnaire, jamais de façon bloquante pour l'UI.

### 4.5 Contenu des 4 piliers

Chaque fichier `content/piliers/0X-*.json` correspond à un objet `Pillar` complet : sa fiche technique (`technicalSheet`), une liste de 5 à 8 `notions` minimum pour la génération initiale (contenu extensible ensuite), chacune avec son cours court et 1 à 3 exercices (dont, à partir de la 2e notion, un exercice cumulatif remobilisant une notion précédente — voir 4.1), et exactement 3 `validationExercises` mélangeant plusieurs notions à la fois. Le pilier Database doit obligatoirement inclure, parmi ses notions ou sa validation, un exercice de diagnostic basé sur le cas type "une table présentée comme responsable d'une réponse NULL" (cas fondateur du projet).

**Exigence de qualité sur `Notion.course.example` :** chaque notion doit avoir un exemple concret et réaliste (une situation, pas une reformulation de l'explication). Mauvais exemple à proscrire : *"Un commit sert à enregistrer une modification."* (reformulation, pas un exemple). Bon exemple : *"Tu demandes à l'IA de corriger un bug d'affichage sur mobile ; une fois le correctif validé, elle crée un commit intitulé 'fix: correction affichage mobile' — c'est ce commit que tu retrouveras dans l'historique si tu dois revenir en arrière."*

---

## 5. Étapes de génération (ordre recommandé pour OpenCode)

1. **Init projet** : `bun create next-app` (TypeScript, App Router, Tailwind), config ESLint/Prettier, structure de dossiers section 1.2.
2. **Design system** : configurer les tokens Tailwind (couleurs, polices section 3), composants UI de base (`components/ui`).
3. **Modèle de données local** : schéma Dexie (section 1.3 : `Pillar`, `Notion`, `Term`, `UserProgress`), fonctions `lib/db/queries.ts`.
4. **Contenu de démonstration** : générer les 4 fichiers JSON de piliers (fiche technique + notions + 3 exercices de validation, section 4.5), dans l'ordre Outils transversaux → Front → Back → Database.
5. **Moteur de notions et exercices** : composants pour la fiche technique, le cours par notion, les exercices (dont cumulatifs) et l'écran de validation finale + `lib/exercises/validators.ts` + tests unitaires associés.
6. **Territoire personnel** : écran d'accueil, carte responsive (section 1.4), logique de remplissage par zone.
7. **Dictionnaire offline** : écran carnet de bord, recherche/filtre, écriture/lecture IndexedDB.
8. **Gamification** : `lib/gamification/engine.ts` (XP, streak, vies) + tests unitaires + affichage sur le profil.
9. **PWA** : manifest, service worker Serwist, test d'installation et de fonctionnement hors-ligne.
10. **Auth + sync Supabase** (optionnel, en dernier) : connexion, endpoint `/api/sync`, synchronisation opportuniste.
11. **Tests et vérification finale** : exécuter `bun test`, vérifier le responsive aux 4 largeurs de la section 1.4, vérifier le fonctionnement hors-ligne (couper le réseau et utiliser l'app).

---

## 6. Exigences non-fonctionnelles

- **Offline-first** : dictionnaire, progression, fiches techniques, cours et exercices déjà chargés doivent fonctionner sans réseau, sans exception.
- **Responsive** : conforme au tableau de la section 1.4, testé aux 4 largeurs indiquées.
- **Accessibilité** : contraste conforme AA sur toute la palette, navigation clavier complète, focus visible, respect de `prefers-reduced-motion`.
- **Performance / installabilité PWA** : app installable, chargement initial rapide, audit Lighthouse PWA passant.
- **Qualité de code** : TypeScript strict (`strict: true`), ESLint sans erreur, pas de `any` non justifié.
- **Tests** : exécutés avec `bun test`. Couverture minimale attendue :
  - `lib/exercises/validators.ts` — un test par type d'exercice.
  - `lib/gamification/engine.ts` — calcul XP, streak, perte/régénération de vies.
  - `lib/db/queries.ts` — ajout d'un terme, progression de `masteryLevel`.
  - Un test vérifiant qu'à partir de la 2e notion d'un pilier, un exercice cumulatif remobilisant une notion précédente est bien présent.
  - Un test d'intégration du parcours complet : fiche technique → notions (cours + exercices cumulatifs) → 3 exercices de validation réussis → pilier marqué `validatedPillarIds` → terme ajouté au dictionnaire → XP mis à jour.

---

## 7. Critères de complétion

- [ ] `bun install && bun run dev` lance l'app sans erreur.
- [ ] `bun test` passe entièrement.
- [ ] L'app est installable en PWA et reste utilisable après coupure réseau (dictionnaire + piliers déjà vus).
- [ ] Le territoire personnel s'affiche correctement à 375px, 768px, 1024px, 1440px.
- [ ] Chacun des 4 piliers est jouable de bout en bout : fiche technique → toutes les notions (cours + exercices, avec rappel cumulatif dès la 2e notion) → 3 exercices de validation finale réussis.
- [ ] Un terme validé apparaît bien dans le dictionnaire avec le bon niveau de maîtrise, et passe à `maitrise` après un exercice cumulatif ou de validation réussi.
- [ ] La palette et les polices de la section 3 sont appliquées sur l'ensemble de l'UI, aucune valeur de couleur codée en dur hors des tokens.
