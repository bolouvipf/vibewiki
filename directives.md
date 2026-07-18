# Boussole
*Comprendre, pas subir.*

Application d'apprentissage pour non-codeurs qui utilisent l'IA (Claude, ChatGPT, OpenCode, Cursor, etc.) pour construire ou maintenir des projets. Objectif : ne plus jamais valider une décision technique qu'on ne comprend pas.

---

## 1. Concept

### 1.1 Positionnement

**Ce que ce n'est PAS :** une app pour "apprendre à coder" comme Codefinity, SoloLearn, ou Duolingo lui-même. On ne demande jamais à l'utilisateur d'écrire une ligne de code fonctionnelle. Il n'y a pas de promesse "deviens développeur".

**Ce que c'est :** une app pour comprendre le **vocabulaire, l'architecture et les raisonnements** que l'IA manipule en permanence, afin de pouvoir :
- comprendre une explication technique donnée par une IA,
- repérer quand cette explication contient une supposition non vérifiée,
- savoir où chercher pour vérifier soi-même (sans savoir coder),
- prendre une décision éclairée plutôt que de cliquer "oui, continue" par défaut.

La ligne directrice de tout le contenu est cette question : **"Est-ce que l'utilisateur peut juger si ce que l'IA vient de dire est plausible, vérifiable, ou juste une supposition présentée avec assurance ?"**

**Nom retenu : Boussole.** Une vibewiki ne fait pas le trajet à ta place — elle donne les moyens de savoir où l'on est et où l'on va, même quand quelqu'un d'autre (ici, l'IA) prétend connaître le chemin. Ce nom relie directement le débutant, l'IA, et la logique de "territoire" que l'on retrouve maintenant dans chacun des 4 piliers (voir section 1.3 et section 4).

### 1.2 Public cible

Personnes non-codeuses qui pilotent un ou plusieurs assistants IA pour créer/maintenir un produit réel (site, app, automatisation) — profil "fondateur solo" ou "porteur de projet" plutôt que "futur développeur".

### 1.3 Les 4 piliers (structure du contenu)

**Changement de structure (v2) :** l'ancienne organisation en 5 "axes de compréhension" était trop abstraite — elle produisait un contenu générique, difficile à ancrer dans des situations réelles. Le contenu est maintenant organisé autour des **4 piliers réels du développement web**, ceux que l'IA mentionne concrètement à chaque session de travail. Rien n'est perdu : les anciens axes (vocabulaire, lecture de diagnostic, détection de suppositions, tâches automatisées, territoire) deviennent des **lentilles transversales appliquées à l'intérieur de chaque pilier**, plutôt que des modules à part — ce qui est justement ce qui manquait de concret.

**Ordre de progression proposé :** Outils transversaux → Front → Back → Database. Raison : les outils transversaux (git, environnement, déploiement) sont ce que l'utilisateur croise dès la première minute de toute session avec l'IA, quel que soit le projet — c'est le socle commun. Le Front donne ensuite des victoires rapides et visibles (on voit le résultat). Le Back développe la logique invisible. La Database, la plus abstraite, vient en dernier — c'est aussi le pilier où se trouvent les diagnostics les plus piégeux (comme la fameuse table "à l'origine" d'une réponse NULL).

#### Pilier 1 — Outils transversaux (le socle commun)
- **Vocabulaire :** commit, branch, merge, pull request, clone, push/pull, conflit — package, dépendance, script, runtime (node/npm/bun) — build, environnement (dev/staging/prod), variable d'environnement, secrets/.env, CI/CD, déploiement, domaine.
- **Où ça vit :** GitHub (code et historique), Vercel (build et déploiement), le fichier `.env` (jamais commité).
- **Diagnostics typiques :** "le déploiement a échoué au build", "les variables d'environnement ne sont pas reconnues en production", "il y a un conflit à résoudre".

#### Pilier 2 — Front (ce que l'utilisateur voit)
- **Vocabulaire :** composant, props/state, rendu, hydratation, responsive, route/page, framework (React/Next.js), style/CSS, cache navigateur.
- **Où ça vit :** le navigateur de l'utilisateur, servi depuis Vercel/CDN.
- **Diagnostics typiques :** page blanche, bouton qui ne réagit pas, erreur d'hydratation, style qui ne s'applique pas, build front qui échoue.

#### Pilier 3 — Back (la logique serveur / API)
- **Vocabulaire :** endpoint, méthode HTTP, statut HTTP, middleware, authentification, session/token, fonction serverless, serveur, requête/réponse.
- **Où ça vit :** les fonctions serveur (Vercel functions ou serveur Node), les logs serveur.
- **Diagnostics typiques :** API qui répond 500/404, timeout, erreur CORS, authentification qui échoue.

#### Pilier 4 — Database (les données)
- **Vocabulaire :** table, ligne/colonne, requête SQL, schéma, migration, trigger, relation/clé étrangère, index, contrainte, NULL.
- **Où ça vit :** Supabase/Postgres.
- **Diagnostics typiques :** *"cette table est à l'origine de l'appel API qui répond NULL"* (le cas vécu qui a lancé ce projet), contrainte violée, migration ratée.

**Les 4 lentilles appliquées dans chaque pilier :**
1. *Vocabulaire du pilier* — les mots que l'IA utilise dans ce domaine précis.
2. *Lire un diagnostic sans le subir* — juger si l'explication de l'IA est logique et vérifiable, dans le contexte de ce pilier.
3. *Détecter une supposition de l'IA* — repérer les tournures d'hypothèse non vérifiée ("je suppose que…", "cela devrait…") propres à ce pilier, et les transformer en question de vérification.
4. *Où ça vit* — situer précisément l'élément dans l'architecture réelle (alimente la carte "territoire personnel", section 4).

Les tâches automatisées sans supervision directe (ex. scripts planifiés) sont traitées comme un thème du **pilier Outils transversaux**, pas comme un module séparé.

### 1.4 Formats d'exercice (pas de syntaxe à écrire)

- **QCM de définition contextualisée** : pas "que veut dire X ?" mais "l'IA vient de dire ça — que doit comprendre l'utilisateur ?"
- **Vrai / Faux / Pas vérifiable en l'état** : entraîner à distinguer une affirmation solide d'une supposition.
- **Repérage** : dans un extrait de réponse IA, souligner la phrase qui annonce une supposition.
- **Association carte du territoire** : relier un terme à l'endroit où il "vit" (GitHub / Vercel / Supabase / variables d'env).
- **Remise en ordre** : reconstituer les étapes logiques d'un déploiement ou d'un diagnostic.
- **Question de vérification** : à partir d'une affirmation IA, choisir la bonne question à poser pour la faire confirmer.

### 1.5 Gamification

Mécaniques type Duolingo réinterprétées (pas de copie visuelle) : séries de jours (streak), vies/cœurs, XP, ligues hebdomadaires, révision espacée des termes déjà "validés" pour ne pas les oublier.

---

## 2. Le dictionnaire offline évolutif

Élément central du projet, distinct des leçons.

- **Offline par défaut** : consultable sans connexion, stocké localement sur l'appareil.
- **Personnel et évolutif** : chaque terme rencontré dans une leçon et validé (répondu correctement, revu suffisamment de fois) est ajouté automatiquement au dictionnaire personnel de l'utilisateur — qui grandit avec son expérience réelle, pas avec un contenu figé.
- **Fiche par terme** : définition courte, "à quoi ça sert concrètement", exemple contextualisé (issu d'une vraie situation type), niveau de maîtrise (découvert / en cours / maîtrisé), date de validation, leçon d'origine.
- **Recherche et filtre** : par catégorie (vocabulaire, architecture, outils, sécurité…), par niveau de maîtrise.
- **Synchronisation optionnelle** : le dictionnaire fonctionne 100% offline en local ; une synchronisation cloud (compte utilisateur) permet de retrouver sa progression sur un autre appareil quand une connexion est disponible — mais n'est jamais requise pour utiliser l'app.

---

## 3. Stack technique proposée

Choisie pour rester cohérente avec ton expérience déjà acquise (houetor.com) et pour permettre le fonctionnement offline du dictionnaire.

| Besoin | Choix proposé | Pourquoi |
|---|---|---|
| Framework front | Next.js (App Router) | Tu le maîtrises déjà côté pilotage, réutilisable avec OpenCode |
| Style | Tailwind CSS | Rapide à faire coder par l'IA, cohérent |
| Fonctionnement offline | PWA (Serwist ou next-pwa) | Permet l'installation et l'usage du dictionnaire sans réseau |
| Stockage local | IndexedDB via Dexie.js | Stockage structuré offline pour dictionnaire + progression |
| Compte / sync / contenu distant | Supabase (Auth + Postgres) | Tu le connais déjà ; sync optionnelle uniquement |
| Hébergement | Vercel | Cohérent avec ton usage actuel |
| Dépôt | GitHub | Idem |

*À valider : est-ce que tu veux une app mobile native (plus tard) ou uniquement la PWA installable sur téléphone/ordinateur pour l'instant ? Je recommande PWA seule pour la v1 — plus simple, et déjà installable sur téléphone.*

---

## 4. Direction visuelle

Volontairement **à l'opposé du cliché "terminal hacker vert sur noir"** ET du cliché "app IA" (fond crème + accent terracotta que tout le monde produit en ce moment). L'identité s'appuie sur la métaphore cartographique de l'axe 3 : l'utilisateur explore un territoire, il ne remplit pas une checklist.

**Signature de l'app — le "territoire personnel" :** l'écran d'accueil n'affiche pas une barre de progression générique, mais une carte personnelle qui se remplit et se détaille au fur et à mesure (4 zones = les 4 piliers). Le dictionnaire n'est pas une liste alphabétique froide : c'est un **carnet de bord**, avec les termes maîtrisés comme des repères posés sur le territoire déjà exploré. C'est le seul endroit où l'app prend un risque visuel fort ; le reste de l'interface reste sobre et discipliné pour ne pas la concurrencer.

**Palette (carte marine / vibewiki, pas cliché "hacker" ni cliché "IA crème") :**
- Bleu carte marine (primaire) `#1E2D4F` — sérieux, orientation, jamais froid grâce au fond ci-dessous.
- Or vibewiki (accent, validations/XP) `#D9A441` — le "déclic de compréhension".
- Papier terrain (fond) `#EEF0EA` — gris-vert pâle, évoque le papier topographique, se distingue du crème générique.
- Argile alerte (supposition IA non vérifiée détectée) `#B5502F` — signale sans être un rouge d'erreur classique.
- Mousse validée (terme maîtrisé) `#5B7A5E`.
- Encre (texte) `#202A22` — presque noir, légèrement teinté vert pour rester dans la famille terrain.

**Typographie :**
- Titres : **Space Grotesk** — géométrique, technique sans être froide, utilisée avec retenue (pas partout).
- Texte courant : **Karla** — humaniste, très lisible, chaleureuse.
- Extraits de vocabulaire technique cités / glossaire : **IBM Plex Mono** — seul endroit où une police "code" apparaît, précisément parce qu'on y cite un terme technique tel qu'il apparaît dans la vraie vie.

**Layout :** pas de numérotation 01/02/03 générique — la progression se lit sur la carte elle-même, pas dans une liste séquentielle, sauf pour les rares contenus réellement séquentiels (ex. étapes d'un déploiement).

---

## 5. Étapes successives (roadmap de construction via OpenCode)

Chaque phase donnera lieu à **un prompt précis rédigé ensemble ici**, à copier dans OpenCode. On avance phase par phase, on valide le résultat avant de passer à la suivante.

- **Phase 0 — Squelette du projet** : Next.js + Tailwind + config PWA de base, structure de dossiers, déploiement initial sur Vercel.
- **Phase 1 — Modèle de données** : schéma du dictionnaire (terme, définition, exemple, catégorie, niveau de maîtrise), schéma des leçons/exercices, schéma de progression (XP, streak, vies).
- **Phase 2 — Navigation et UI de base** : écran d'accueil, accès aux leçons, accès au dictionnaire, identité visuelle appliquée.
- **Phase 3 — Moteur de leçons** : affichage des exercices, validation des réponses, gestion des vies/erreurs, ajout automatique au dictionnaire personnel en cas de validation.
- **Phase 4 — Dictionnaire offline** : stockage IndexedDB, recherche/filtre, consultation 100% hors-ligne.
- **Phase 5 — Contenu des 4 piliers** : rédaction et intégration du contenu réel pour Outils transversaux, Front, Back et Database (section 1.3).
- **Phase 6 — Compte et synchronisation** : authentification Supabase, sync optionnelle multi-appareils.
- **Phase 7 — Finalisation PWA et déploiement** : installabilité, icônes, tests offline, mise en production.

---

## 6. Décisions

- [x] Nom : **Boussole**
- [x] Structure de contenu v2 : 4 piliers (Outils transversaux, Front, Back, Database) remplaçant les 5 anciens axes, avec les anciens axes intégrés comme lentilles transversales
- [x] Ordre de progression : Outils transversaux → Front → Back → Database
- [x] PWA seule pour la v1
- [x] Palette et typographie proposées (section 4)
- [ ] Revoir le contenu généré par OpenCode à la lumière de la nouvelle structure en piliers (section 1.3)
