# Better SEO

Better SEO est un prototype SaaS d’ingénieur SEO IA fondé sur les workflows de [Claude SEO](https://github.com/AgriciDaniel/claude-seo). Il transforme le contexte métier, un crawl de site et les données Google en audit priorisé, conversations spécialisées et livrables exportables.

## Fonctionnalités livrées

- onboarding personnalisé en 6 étapes : rôle, niveau SEO, activité, objectifs, URL et données Google ;
- validation d’URL, suggestions de concurrents et scan multi-spécialiste simulé ;
- dashboard avec métriques, score heuristique, constats et actions classées ;
- workspaces conversationnels pour mots-clés, concurrence, contenu, technique, liens et local ;
- streaming compatible AI SDK 7 et rendu Markdown avec AI Elements/Streamdown ;
- simulation clairement étiquetée de « Grok 4.6 » sans appel payant ;
- exports réels `.md`, `.docx` et `.xlsx` ;
- schéma PostgreSQL Prisma 6 pour utilisateurs, projets, audits, preuves, conversations et artefacts ;
- Better Auth avec email/mot de passe et Google OAuth ;
- scopes GSC et GA4 en lecture seule ;
- catalogue de sources gratuites : GSC, GA4, PageSpeed, CrUX et exports Google ; Grok via xAI en direct ;
- Claude SEO complet conservé comme sous-module Git.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, composants shadcn-style, Better Auth, Prisma 6, PostgreSQL, next-safe-action, TanStack Query, Zustand, AI SDK 7, AI Elements et Vercel.

## Démarrage

```bash
git clone --recurse-submodules <votre-repository>
cd better-seo
pnpm install
cp .env.example .env.local
pnpm prisma generate
pnpm dev --hostname 127.0.0.1
```

Le parcours de démonstration fonctionne sans base ni clés API. Pour activer l’authentification et les données réelles, configurez au minimum `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`.

## Google OAuth

Ajoutez l’URI de callback Better Auth dans Google Cloud :

```text
http://localhost:3000/api/auth/callback/google
https://votre-domaine.com/api/auth/callback/google
```

Activez Google Search Console API et Google Analytics Data API. Les scopes demandés sont :

```text
https://www.googleapis.com/auth/webmasters.readonly
https://www.googleapis.com/auth/analytics.readonly
```

## Commandes

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm exec prisma generate
```

## Architecture et limites

### Intégration documentaire active

Le chat utilise désormais un bundle versionné des instructions Claude SEO et 12 workflows. Le mode démo produit un plan de collecte contextualisé. Un agent AI SDK réel, désactivé par défaut, peut consulter les instructions et références via des outils documentaires. Il requiert Better Auth et une configuration fournisseur. Les exports utilisent la réponse affichée.

**Cela n’active pas les crawlers, les spécialistes natifs Claude Code ni les MCP Google automatiquement.** Le dashboard reste une démonstration. Consulter [l’analyse approfondie et la feuille de route](docs/CLAUDE-SEO-INTEGRATION.md) pour la couverture exacte, la configuration et les conditions de production.

Validation : `pnpm build` puis `pnpm test:seo` (Node.js 24). Actualisation documentaire après revue du sous-module : `pnpm seo:sync`.

Consultez [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Le MVP fournit le parcours, les contrats et une simulation fonctionnelle. Un service de crawl durable, les files de travaux, le stockage objet, le chiffrement applicatif des tokens et les fournisseurs SEO payants restent à brancher avant une mise en production multi-client.

## Sources ouvertes

Claude SEO est utilisé selon sa licence MIT et reste dans `vendor/claude-seo`. Les composants de rendu conversationnel sont adaptés de Vercel AI Elements, également sous licence MIT. Les scores sont des heuristiques de priorisation et ne sont ni des métriques Google ni des promesses de classement.
