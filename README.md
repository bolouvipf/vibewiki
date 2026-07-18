# Vibewiki — Comprendre, pas subir

Vibewiki est une PWA d'apprentissage destinée aux personnes qui **ne codent pas** mais pilotent des assistants IA (Claude, ChatGPT, OpenCode, Cursor…) pour construire ou maintenir un projet réel.

L'objectif n'est pas d'apprendre à coder — mais d'apprendre à **comprendre suffisamment** pour ne jamais valider une décision technique de l'IA sans la juger : reconnaître le vocabulaire, situer les composants d'une architecture, repérer une supposition non vérifiée, et savoir quelle question poser pour vérifier.

## Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Langage**: TypeScript
- **Base de données client**: Dexie.js (IndexedDB)
- **Style**: Tailwind CSS 4
- **Service Worker**: Serwist (PWA)
- **Package manager**: Bun

## Contenu

Le contenu est organisé en **4 piliers** du développement web réel :

1. **Outils transversaux** — Git, npm, build, déploiement, CI/CD
2. **Front** — React, composants, rendu, responsive, CSS
3. **Back** — API, serveur, middleware, authentification
4. **Database** — Schéma, requêtes, migrations, ORM

## Démarrage

```bash
bun install
bun dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build production

```bash
bun run build
bun start
```

## Tests

```bash
bun test
```
