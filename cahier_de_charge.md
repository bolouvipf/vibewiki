# Cahier des charges — Vibewiki
*Comprendre, pas subir.*

> Document de référence du projet **Vibewiki** (v1 web). Il décrit le produit, ses exigences fonctionnelles et non-fonctionnelles, les règles de sécurité, la stack technique et les critères de réception. Les évolutions futures (agent IA pédagogique, port Flutter, synchronisation Supabase) sont documentées en section 11 comme **v2**, hors périmètre de la v1.

---

## 1. Contexte & objectif

### 1.1 Le problème

De plus en plus de personnes **ne codent pas** mais pilotent des assistants IA (Claude, ChatGPT, OpenCode, Cursor…) pour construire ou maintenir un projet réel (site, application, automatisation). Ces personnes sont confrontées chaque jour à un flux de jargon technique et de décisions qu'elles ne comprennent pas, et qu'elles valident "par défaut" sans pouvoir les juger.

### 1.2 La promesse

Vibewiki n'apprend pas à coder. Il apprend à **comprendre suffisamment** pour :
- reconnaître le vocabulaire technique que l'IA manipule,
- situer les composants d'une architecture réelle,
- repérer une supposition non vérifiée dans une explication de l'IA,
- savoir quelle question poser pour vérifier soi-même.

**Positionnement :** *"Est-ce que l'utilisateur peut juger si ce que l'IA vient de dire est plausible, vérifiable, ou juste une supposition présentée avec assurance ?"*

### 1.3 Public cible

- Profil "fondateur solo" ou "porteur de projet" plutôt que "futur développeur".
- Personnes non-codeuses qui pilotent un ou plusieurs assistants IA pour créer/maintenir un produit réel.
- Aucun prérequis technique ; aucun exercice ne demande d'écrire du code.

### 1.4 Ce que Vibewiki n'est PAS

- Une app pour "apprendre à coder" (type Codecademy, SoloLearn).
- Une promesse "deviens développeur".
- Un lexique figé ou un annuaire de définitions.
- Un chatbot de réponses techniques (voir section 11 pour l'agent IA v2 et ses garde-fous).

---

## 2. Périmètre fonctionnel v1 (web)

La v1 est une **PWA installable**, fonctionnant **offline-first**, avec les sections suivantes :

| Section | Rôle |
|---|---|
| **Territoire personnel** (accueil) | Carte à 4 zones (une par pilier) qui se remplit au fil de la progression |
| **Piliers** | 4 parcours d'apprentissage complets |
| **Dictionnaire** | Carnet de bord personnel, offline, qui grandit avec les termes validés |
| **Profil** | XP, streak, cœurs, ligue, badges, défi du jour |
| **Urgence** | Mode "j'ai besoin de comprendre maintenant" : scénarios de diagnostic rapides |

### 2.1 Les 4 piliers (structure du contenu)

Ordre de progression : **Outils transversaux → Front → Back → Database**.

1. **Outils transversaux** (le socle commun) — git/GitHub, node/npm/bun, build, environnement, variables d'environnement, secrets/.env, CI/CD, déploiement, domaine, tâches automatisées.
2. **Front** — composant, props/state, rendu, hydratation, responsive, route/page, framework, style/CSS, cache navigateur.
3. **Back** — endpoint, méthode HTTP, statut HTTP, middleware, authentification, session/token, fonction serverless, requête/réponse.
4. **Database** — table, ligne/colonne, requête SQL, schéma, migration, trigger, relation/clé étrangère, index, contrainte, NULL.

Chaque pilier applique les **4 lentilles** : vocabulaire du pilier, lecture de diagnostic, détection de supposition, localisation dans l'architecture ("où ça vit").

### 2.2 Parcours d'un pilier (3 temps)

1. **Fiche technique** — explication en langage courant de ce qu'est le pilier et pourquoi l'IA en parle sans arrêt (équivalent d'une carte d'orientation).
2. **Cours court + exercices, notion par notion** — chaque notion a un cours (explication, à quoi ça sert, exemple concret) suivi d'exercices. **À partir de la 2e notion**, chaque série inclut au moins un exercice **cumulatif** qui remobilise une notion précédente du même pilier (mémoire longue durée).
3. **Validation finale** — exactement **3 exercices** mélangeant plusieurs notions du pilier. Le pilier n'est marqué complet qu'après réussite de ces 3 exercices.

### 2.3 Les 6 types d'exercices

| Type | Principe |
|---|---|
| **QCM contextualisé** | Une réponse/diagnostic d'IA est montrée ; l'utilisateur choisit ce qu'il doit en comprendre |
| **Vrai / Faux / Pas vérifiable en l'état** | Distinguer affirmation solide et supposition |
| **Repérage de supposition** | Sélectionner la phrase qui annonce une hypothèse non vérifiée dans un extrait de réponse IA |
| **Association territoire** | Relier un terme à l'endroit où il "vit" (GitHub, Vercel, Supabase, variables d'environnement) |
| **Remise en ordre** | Reconstituer les étapes logiques d'un déploiement ou d'un diagnostic |
| **Question de vérification** | Choisir la bonne question à poser pour faire confirmer une affirmation IA |

Aucun type d'exercice n'exige d'écrire du code.

### 2.4 Dictionnaire offline évolutif

- Consultable et cherchable **100% hors-ligne**.
- Filtrable par pilier et par niveau de maîtrise.
- Chaque fiche : définition courte, usage concret, exemple, niveau, date de validation, notion et pilier d'origine.
- **Alimenté automatiquement** par la progression réelle de l'utilisateur — jamais préchargé comme un lexique figé.
- Niveau de maîtrise : `decouvert` → `en_cours` (après la notion) → `maitrise` (après un exercice cumulatif ou de validation réussi).

### 2.5 Gamification

- **XP** par exercice réussi (+ bonus : combo, notion parfaite, streak, défi du jour, urgence).
- **Streak** (jours consécutifs d'activité).
- **Cœurs** : perdus sur erreur, régénérés avec le temps (max 5).
- **Ligues** : Bronze → Argent → Or → Saphir → Diamant → Légende (selon XP).
- **Badges** débloqués selon les comportements (suppositions repérées, sauvetages, sessions parfaites, sessions tardives/précoces…).
- **Défi du jour** : objectif quotidien avec récompense XP.
- **Révision espacée** : les termes `en_cours` réapparaissent à intervalles croissants (1, 3, 7, 14, 30 jours) jusqu'à `maitrise`.

### 2.6 Mode urgence

Scénarios de diagnostic rapides pour "comprendre maintenant" sans faire le parcours complet : un problème concret est présenté, l'utilisateur choisit la bonne action de vérification. Récompense XP en cas de réussite.

### 2.7 Formulaire de retour testeurs

Page `/retour` accessible depuis la page d'accueil : un formulaire (type de retour, message, contact optionnel) envoyé vers l'email de l'équipe (`bopiflo05@gmail.com`). En v1 le transport utilise `mailto:` (zéro dépendance backend, fonctionne hors-ligne) ; l'envoi ouvre l'application de messagerie avec le message pré-rempli. La page visitée et le navigateur sont inclus automatiquement pour faciliter le diagnostic.

---

## 3. Exigences fonctionnelles détaillées

### 3.1 Règles du parcours pilier

- [ ] La fiche technique est affichée une fois, à l'entrée du pilier.
- [ ] Les notions sont apprises dans l'ordre du pilier.
- [ ] Chaque notion a au moins 1 exercice ; à partir de la 2e notion, au moins 1 exercice cumulatif remobilise une notion précédente.
- [ ] La validation finale contient exactement 3 exercices multi-notions.
- [ ] Le pilier n'est validé qu'après réussite des 3 exercices de validation.
- [ ] La réussite d'une notion ajoute/met à jour le `Term` correspondant dans le dictionnaire.

### 3.2 Règles du dictionnaire

- [ ] Un terme validé apparaît dans le dictionnaire avec le bon niveau de maîtrise.
- [ ] Le niveau passe à `maitrise` après un exercice cumulatif ou de validation réussi.
- [ ] Recherche par texte, filtre par pilier et par niveau de maîtrise.
- [ ] Consultation possible sans réseau, sans exception.

### 3.3 Règles de gamification

- [ ] XP attribué à chaque exercice réussi, bonus appliqués selon les règles de l'engine.
- [ ] Streak mis à jour selon la date de dernière activité.
- [ ] Cœurs perdus sur erreur, régénérés après 4h, plafond 5.
- [ ] Ligue recalculée selon le total XP.
- [ ] Badges débloqués et persistés.
- [ ] Défi du jour : un par jour, récompense XP, état persisté.
- [ ] Révision espacée : intervalles croissants, réinitialisation sur échec.

### 3.4 Règles du mode urgence

- [ ] Un scénario = un problème concret + des actions possibles.
- [ ] La bonne action est une action de vérification, jamais une action "aveugle".
- [ ] XP attribué en cas de bonne action (bonus si action parfaite).

### 3.5 Règles du formulaire de retour

- [ ] Accessible depuis l'accueil (lien "Faire un retour").
- [ ] Champs : type de retour (bug / suggestion / avis / autre), message (obligatoire), contact (optionnel).
- [ ] Le message est pré-rempli avec la catégorie, la page visitée et le navigateur.
- [ ] Destinataire : bopiflo05@gmail.com.
- [ ] En v1 : ouverture de l'application de messagerie via `mailto:` (aucune donnée stockée côté serveur).
- [ ] Évolution v1.5 possible : routage via un service de formulaire (Formspree/Web3Forms) ou API route + SMTP, avec les headers CSP à ajuster en conséquence.

---

## 4. Exigences non-fonctionnelles

### 4.1 Offline-first

- Dictionnaire, progression, fiches techniques, cours et exercices déjà chargés fonctionnent **sans réseau, sans exception**.
- L'app reste 100% utilisable sans jamais avoir été en ligne après l'installation initiale.
- Le contenu des leçons est embarqué au build (JSON versionnés dans l'app).

### 4.2 PWA

- Installable (manifest, icônes 192/512, `display: standalone`, thème `#1E2D4F`).
- Service worker (Serwist) : cache-first pour l'app shell et les assets, network-first avec repli local pour la synchronisation.
- Aucune dépendance réseau pour la lecture du dictionnaire ou la poursuite d'une leçon déjà téléchargée.

### 4.3 Responsive

| Breakpoint | Largeur | Comportement du territoire |
|---|---|---|
| `base` (mobile) | < 640px | Carte en défilement vertical, une zone à la fois, navigation par onglets en bas |
| `md` (tablette) | 641–1024px | Grille 2 colonnes, dictionnaire en panneau latéral rétractable |
| `lg` (desktop) | > 1024px | Carte complète en un écran, dictionnaire en panneau fixe, navigation en haut |

- Zones tactiles ≥ 44px sur mobile.
- Aucun défilement horizontal.
- Moteur d'exercices utilisable au clavier et au tactile de façon identique.
- Testé visuellement à 375px, 768px, 1024px, 1440px.

### 4.4 Accessibilité

- Contraste conforme AA sur toute la palette.
- Navigation clavier complète, focus visible.
- Respect de `prefers-reduced-motion`.

### 4.5 Performance

- Chargement initial rapide.
- Audit Lighthouse PWA passant.

---

## 5. Sécurité

### 5.1 Résultat de l'audit (état actuel)

**Contexte :** aucun backend, 100% client-side (Next.js statique + IndexedDB), aucune donnée envoyée nulle part, aucun compte, aucune API, aucun tracker. La surface d'attaque est quasi nulle.

**Points sains (vérifiés) :**
- Aucun secret commité (aucun `.env`, aucune clé dans l'historique git).
- Aucune clé Supabase dans le code (`@supabase/supabase-js` déclaré mais jamais utilisé).
- Pas de XSS : contenu = JSON statique importé au build, rendu par React (échappé). Aucun `dangerouslySetInnerHTML`, `eval` ou `innerHTML`.
- Pas d'injection : accès données via Dexie (pas de SQL), `useParams` utilisé uniquement comme clé de lookup.
- TypeScript `strict: true`.
- Aucune donnée personnelle collectée (pas de PII, cookies, formulaires ou scripts tiers).

**Points à corriger (priorité) :**

| # | Problème | Gravité | Correction |
|---|---|---|---|
| 1 | `.gitignore` ne bloque pas `.env*` — le jour où Supabase sera configuré, `.env.local` risquerait d'être commité | **Haute** | Ajouter `.env*` et `!.env.example` au `.gitignore` |
| 2 | Aucun security header (CSP, X-Frame-Options…) | Moyenne | Ajouter les headers dans `next.config.ts` dès qu'une API/auth arrivera |
| 3 | Gamification forgeable (XP/streak/ligues en IndexedDB, modifiables par l'utilisateur) | Faible | Accepté comme décision de conception en v1 (aucun enjeu réel) ; à documenter si une ligue compétitive arrive |
| 4 | Cache PWA potentiellement périmé (`revision: NEXT_PUBLIC_BUILD_ID \|\| "1"`) | Faible | Poser `NEXT_PUBLIC_BUILD_ID` au build ou générer une révision automatique |
| 5 | Dossier `app/api/sync/` vide (scaffolding mort) | Faible | À supprimer ou à implémenter proprement en v2 |

### 5.2 Règles pour le futur Supabase (v2)

- L'authentification et la synchronisation seront **optionnelles et jamais bloquantes** pour l'UI.
- **Ne jamais faire confiance aux valeurs envoyées par le client** (XP, streak, progression) : toute écriture distante doit être validée côté serveur (RLS Supabase, règles de cohérence).
- Rate limiting sur l'endpoint de synchronisation.
- Aucun secret (service_role, clés privées) ne doit jamais être exposé côté client.
- Les clés publiques (anon key) sont les seules autorisées côté client.
- Politique de confidentialité requise dès qu'un compte utilisateur existe.

---

## 6. Stack & architecture

### 6.1 Stack v1

| Couche | Choix |
|---|---|
| Runtime / package manager | **Bun** |
| Framework | **Next.js 15** (App Router), TypeScript strict |
| Style | **Tailwind CSS 4** |
| PWA | **Serwist** (service worker + manifest) |
| Stockage local | **Dexie.js** (IndexedDB) — dictionnaire + progression offline |
| Backend / Auth / Sync | **Supabase** (optionnel, v2) |
| Validation de schéma | **Zod** |
| Tests | **Bun test** (runner natif) |
| Lint / format | ESLint + Prettier |

### 6.2 Structure des dossiers

```
vibewiki/
├── app/                     # routes (App Router)
│   ├── page.tsx             # accueil = territoire personnel
│   ├── piliers/[pillarId]/  # fiche pilier, notions, validation
│   ├── dictionnaire/        # carnet de bord + fiche terme
│   ├── profil/              # XP, streak, cœurs, ligue, badges
│   └── urgence/             # mode urgence
├── components/              # territoire, notions, dictionnaire, profil, ui
├── lib/                     # db (Dexie), exercises (validators), gamification
├── content/
│   ├── piliers/             # 4 JSON (transversal, front, back, database)
│   └── ressources/          # fiches, prompts de vérification, scénarios
├── public/                  # manifest, icônes, service worker
├── tests/                   # unitaires + intégration
└── sw.ts                    # service worker (Serwist)
```

### 6.3 Qualité de code

- TypeScript `strict: true`, pas de `any` non justifié.
- ESLint sans erreur, Prettier appliqué.
- Tests exécutés avec `bun test` :
  - un test par type d'exercice (validators),
  - calcul XP, streak, perte/régénération de cœurs (gamification),
  - ajout d'un terme, progression de `masteryLevel` (queries),
  - présence d'un exercice cumulatif dès la 2e notion d'un pilier,
  - test d'intégration du parcours complet (fiche → notions → validation → pilier validé → terme au dictionnaire → XP mis à jour).

---

## 7. Données

### 7.1 Modèle de données (local, IndexedDB)

```ts
// Terme du dictionnaire personnel
interface Term {
  id: string;
  term: string;
  shortDefinition: string;
  practicalMeaning: string;       // "à quoi ça sert concrètement"
  example: string;                // exemple contextualisé
  pillar: 'transversal' | 'front' | 'back' | 'database';
  masteryLevel: 'decouvert' | 'en_cours' | 'maitrise';
  firstSeenAt: string;
  masteredAt?: string;
  sourceNotionId: string;
  nextReviewAt?: string;          // révision espacée
  lastReviewAt?: string;
  currentReviewInterval?: number;
  cumulativeExercisesPassed?: boolean;
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
  validatedPillarIds: string[];
  currentCombo: number;
  unlockedBadgeIds: string[];
  suppositionsSpotted: number;
  rescueCount: number;
  perfectExercises: number;
  lateNightSessions: number;
  earlySessions: number;
  emergencySuccess: number;
  masteredTerms: { pillar: string; termId: string }[];
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string;
  dailyChallengeProgress: number;
}
```

### 7.2 Contenu

- 4 fichiers JSON (`content/piliers/0X-*.json`), un par pilier : fiche technique, 5 à 8 notions minimum (cours + 1 à 3 exercices dont un cumulatif dès la 2e notion), exactement 3 exercices de validation.
- Le pilier Database inclut obligatoirement un exercice de diagnostic basé sur le cas type "une table présentée comme responsable d'une réponse NULL".
- **Exigence de qualité sur les exemples :** chaque `Notion.course.example` doit être une situation concrète et réaliste, jamais une reformulation de l'explication.
- `content/ressources/` : fiches de référence, prompts de vérification, scénarios narratifs.

---

## 8. Design system

### 8.1 Couleurs (tokens à respecter strictement)

| Token | Valeur | Usage |
|---|---|---|
| Bleu carte marine (primaire) | `#1E2D4F` | Sérieux, orientation |
| Or vibewiki (accent) | `#D9A441` | Validations, XP, "déclic de compréhension" |
| Papier terrain (fond) | `#EEF0EA` | Fond général (gris-vert pâle, papier topographique) |
| Argile alerte | `#B5502F` | Supposition IA détectée |
| Mousse validée | `#5B7A5E` | Terme maîtrisé |
| Encre (texte) | `#202A22` | Texte courant |

### 8.2 Typographies

- Titres : **Space Grotesk**
- Texte courant : **Karla**
- Citations de vocabulaire technique / glossaire : **IBM Plex Mono**

### 8.3 Signature visuelle

- Le "territoire personnel" : une carte à 4 zones qui se remplit progressivement (une zone = un pilier), plutôt qu'une barre de progression générique.
- Le dictionnaire est un **carnet de bord** (repères posés sur le territoire exploré), pas une liste alphabétique froide.
- Aucune valeur de couleur codée en dur hors des tokens.

### 8.4 À éviter explicitement

- Fond crème + accent terracotta (cliché "app IA").
- Fond noir + vert/vermillon (cliché "hacker").
- Numérotation 01/02/03 décorative sans réelle séquence.

---

## 9. Gouvernance projet

- **Versioning :** git, messages de commit conventionnels (`feat:`, `fix:`, `docs:`…), en français ou en anglais selon le contenu.
- **Qualité :** `bun test` doit passer entièrement avant tout commit ; `bun run build` sans erreur.
- **Relecture :** toute modification du contenu pédagogique (JSON des piliers) doit respecter l'exigence de qualité des exemples (section 7.2).
- **Sécurité :** aucun secret dans le code, jamais. Les clés passent par les variables d'environnement, jamais commitées.

---

## 10. Critères de réception (v1)

- [ ] `bun install && bun run dev` lance l'app sans erreur.
- [ ] `bun test` passe entièrement.
- [ ] `bun run build` passe sans erreur.
- [ ] L'app est installable en PWA et reste utilisable après coupure réseau (dictionnaire + piliers déjà vus).
- [ ] Le territoire personnel s'affiche correctement à 375px, 768px, 1024px, 1440px.
- [ ] Chacun des 4 piliers est jouable de bout en bout : fiche technique → toutes les notions (cours + exercices, avec rappel cumulatif dès la 2e notion) → 3 exercices de validation finale réussis.
- [ ] Un terme validé apparaît dans le dictionnaire avec le bon niveau de maîtrise, et passe à `maitrise` après un exercice cumulatif ou de validation réussi.
- [ ] La palette et les polices de la section 8 sont appliquées sur l'ensemble de l'UI, aucune valeur de couleur codée en dur hors des tokens.
- [ ] Le mode urgence est accessible et fonctionnel.
- [ ] Les corrections de sécurité de la section 5.1 sont appliquées (`.gitignore` en priorité).

---

## 11. Évolutions v2 (hors périmètre v1)

### 11.1 Agent IA pédagogique

**Objectif :** aider l'utilisateur à comprendre une chose précise "avec des manières d'expliquer simples et claires", sans faire un cours complet — et sans reproduire le réflexe "je demande à l'IA, je valide sans juger".

**Principe de non-nuisance (contrainte de conception) :**
- L'agent ne doit **jamais** donner une réponse "plate" à une question technique.
- Toute réponse doit être un **mini-cours conforme aux 4 lentilles** du produit : explication simple → à quoi ça sert → exemple concret → "comment vérifier".
- L'agent **modélise** la compétence enseignée : il marque explicitement ce qu'il ne sait pas et propose des questions de vérification plutôt que des affirmations.
- Il est ancré dans la progression de l'utilisateur : il connaît ses termes maîtrisés (dictionnaire) et explique au bon niveau.

**Formats prioritaires (dans l'ordre) :**
1. **Traducteur de jargon** — l'utilisateur colle la phrase opaque de son IA ; l'agent surligne les termes techniques, renvoie vers le dictionnaire, explique chacun en langage clair, situe *où ça vit*, et propose la question de vérification à poser.
2. **Formulateur de questions de vérification** — à partir d'une affirmation IA, l'agent aide à construire la bonne question de vérification (entraînement déguisé, aligné sur l'exercice `question_de_verification`).
3. **"Explique-moi simplement" structuré** — réponse en structure de cours, jamais plate, avec refus pédagogique ("plutôt que de te dire si c'est vrai, voici comment le vérifier").

**Contraintes techniques :**
- Nécessite une API d'inférence (coût, latence, modération) — à arbitrer (clé utilisateur vs clé produit).
- Conflit apparent avec l'offline-first : l'agent est un **service en ligne optionnel**, jamais requis pour utiliser l'app.
- Hors périmètre v1 : la v1 web reste **sans agent**.

### 11.2 Port Flutter (application native)

- Port complet en Dart/Flutter : contenu JSON réutilisé tel quel, validateurs et moteur de gamification traduits en Dart, IndexedDB remplacé par Drift (SQLite) ou Hive.
- Carte territoire en CustomPainter (rendu natif supérieur au CSS).
- Notifications natives (streak, régénération de cœurs).
- Cible : Android d'abord (Play Store, 25 $ une fois). **iOS bloquant sans Mac.**
- Décision de séquencement : le port ne doit être lancé qu'après validation du concept par de vrais utilisateurs sur la web.

### 11.3 Synchronisation Supabase

- Compte optionnel, jamais bloquant.
- Synchronisation opportuniste des deltas (progression + dictionnaire).
- Règles de sécurité de la section 5.2 applicables (RLS, validation serveur, rate limiting, politique de confidentialité).

### 11.4 Autres évolutions possibles

- Ligues compétitives hebdomadaires (nécessite de résoudre la forgeabilité, section 5.1 #3).
- Contenu étendu (nouveaux piliers, nouvelles notions).
- Notifications de rappel (révision espacée, streak).

### 11.5 Formations payantes vidéo (coming soon)

**Objectif :** monétiser la promesse de Vibewiki ("comprendre, pas subir") en proposant des parcours vidéo approfondis, animés par des développeurs, dans le même concept pédagogique (explications simples → à quoi ça sert → exemple concret → comment vérifier).

**Espace web en "coming soon" (v1.5) :**
- Page `/formations` avec annonce "Bientôt disponible" et présentation des parcours prévus.
- Appel à l'action : contact email pour rejoindre une liste d'attente.
- Aucun paiement en v1.5 ; le paiement et le gating sont v2 (voir ci-dessous).

**Catalogue envisagé (parcours vidéo animés par des devs) :**
1. Comprendre son ordinateur — fichiers, navigateur, terminal.
2. Piloter une IA avec Git — commits, branches, merges.
3. Construire une page web — HTML, CSS, JavaScript.
4. Se faire aider par des agents IA — prompt engineering, contexte, règles.

**Règles à respecter :**
- Le contenu reste dans l'esprit Vibewiki : démonstrations concrètes, pas de théorie plate, vérification systématique.
- Les formats sont "vidéos animées par des devs" : l'écran de l'outil réel (éditeur, terminal, navigateur) plutôt qu'un cours caméra.
- Les formations gratuites (piliers) restent gratuites ; la section payante est clairement séparée.
- Hors périmètre v1 : le paiement, le gating vidéo et la liste d'attente ne sont pas construits en v1.

**Prérequis v2 (paiement & gating) :**
- Service de paiement (Stripe/Paddle) et gestion des accès — nécessite un backend, compatible avec le futur Supabase (section 11.3).
- Règles de sécurité section 5.2 applicables dès qu'un compte/paiement existe.
- Politique de confidentialité et CGV nécessaires dès qu'une transaction existe.

---

## 12. Hors périmètre v1 (rappel)

- Agent IA pédagogique (v2, section 11.1).
- Application native Flutter (v2, section 11.2).
- Compte utilisateur / synchronisation Supabase (v2, section 11.3).
- Formations payantes vidéo — paiement, gating et liste d'attente (v2, section 11.5) ; la page `/formations` "coming soon" est en revanche incluse en v1.5.
- Publication sur les stores d'applications.
- Monétisation.

---

## 13. Prochain chantier : Parcours d'arrivée (cours commun obligatoire)

> Décision pédagogique : avant les 4 piliers, un **cours commun court et obligatoire en douceur** — le socle *mental* (les piliers restant le socle *technique*). Il ne duplique pas le pilier Outils transversaux : il installe la carte du territoire, le réflexe de vérification et le vocabulaire minimal, pour que chaque pilier démarre avec les mêmes appuis.

### 13.1 Pourquoi (fondements pédagogiques)

- **Charge cognitive (Sweller)** : un non-codeur qui démarre sur Back absorbe API + endpoint + HTTP + auth d'un coup ; le parcours commun découpe la nouveauté en étapes maîtrisables.
- **Ancrage (Ausubel)** : chaque pilier s'appuie sur un vocabulaire partagé (API, commit, build, table) ; sans socle, chaque notion doit ré-expliquer ou l'utilisateur accumule de la confusion.
- **Signature produit d'abord** : le réflexe central (« l'IA propose, vous vérifiez ») est transversal et doit s'installer *avant* les piliers techniques.
- **Victoires rapides** : débuter par « comment marche mon site » donne du sens immédiat (levier psychologique *pertinence*).

### 13.2 Structure (3 notions, ~12 min chacune, micro-sessions)

Nouveau pilier `parcours` (ordre 0), suivant la structure canonique de notion (tentative libre → feedback incarné → exemple → exercice → réflexion active) :

1. **La carte du territoire** — comment une app web fonctionne (front → back → base → déploiement), exercice `association_territoire`.
2. **Le réflexe de vérification** — supposition vs vérifiable (mini-entraînement `vrai_faux_pas_verifiable` + `reperage_supposition`).
3. **Le vocabulaire minimal** — API, commit, build, table (QCM contextualisés).

### 13.3 Règles fonctionnelles

- [ ] Le parcours d'arrivée est proposé **à la première ouverture** (moment d'arrivée : curiosité + anxiété → message d'accueil aligné sur la promesse, pas « app pour apprendre l'informatique »).
- [ ] **Verrouillage en douceur** : les piliers 1–4 sont visibles mais marqués « à découvrir via le parcours » tant que le parcours n'est pas validé ; un bouton **« je connais déjà, passer »** permet de contourner (principe d'autonomie, jamais d'obligation absolue).
- [ ] Le parcours reste accessible à tout moment depuis l'accueil (mode « réviser les bases »).
- [ ] Validation : exactement 3 exercices de validation finale (règle commune à tous les piliers).
- [ ] Badge **« Bienvenue »** débloqué à la validation du parcours ; XP attribuée comme un pilier classique.
- [ ] **Interleaving vers les piliers** : au moins 1 exercice des piliers 1–4 remobilise un terme du parcours via `relatedTermIds` (les termes du parcours existent dans les `terms` des piliers concernés ou dans un `terms` dédié).
- [ ] Les termes du parcours (API, commit, build, table) alimentent le dictionnaire personnel comme les autres notions.
- [ ] Contenu embarqué au build comme les 4 piliers (offline-first inchangé).

### 13.4 Critères de réception

- [ ] Un nouvel utilisateur voit le parcours d'arrivée à la première ouverture.
- [ ] Les piliers 1–4 se déverrouillent après validation du parcours, ou immédiatement via « passer ».
- [ ] Le parcours suit la structure canonique (tentative → feedback → exemple → exercices → réflexion) et dure ~12 min par notion.
- [ ] `bun test`, `bun run build` et `bun run lint` passent avec le nouveau pilier.

### 13.5 Ordre de réalisation

1. Ajouter `06-parcours.json` (ou `00-parcours.json`, ordre 0) et le déclarer dans toutes les listes de piliers (accueil, fiche pilier, validation, dictionnaire, badges, territoire, défi du jour).
2. Logique de verrouillage doux (état local, bouton « passer », déverrouillage à la validation).
3. Écran d'accueil première ouverture + badge « Bienvenue ».
4. Exercices d'interleaving remobilisant les termes du parcours dans les piliers 1–4.
5. Mise à jour de `tests/unit/content.test.ts` (6 piliers) + vérifications complètes.

---

*Document de référence — Vibewiki. Dernière mise à jour : 19 août 2026.*