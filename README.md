# Better SEO

Application Next.js pour collecter les données SEO d’un projet, prioriser les améliorations et préparer des contenus avec Grok et la méthode [Claude SEO](https://github.com/AgriciDaniel/claude-seo).

## Fonctionnalités

- Comptes Better Auth, projets privés et onboarding : activité, rôle, niveau SEO, objectifs, site et propriétés Google.
- Google OAuth en lecture seule : sélection des propriétés GSC et GA4, renouvellement des tokens via Better Auth.
- Search Console : requêtes/pages, clics, impressions, CTR, positions moyennes, deux périodes de 28 jours et évolution quotidienne.
- Analytics : sessions organiques, utilisateurs, sessions engagées et événements clés, comparés à la période précédente.
- Audit HTML réel : robots.txt, sitemap simple, balises, titres dupliqués, H1, canonical, noindex, images et JSON-LD. Constats persistés et suivi « traité / ouvert ».
- Mesures PageSpeed mobile et CrUX lorsque les clés sont configurées et les données disponibles.
- Comparaison des pages publiques de trois concurrents renseignés par l’utilisateur.
- Import CSV du rapport Liens GSC ; aucun score d’autorité inventé.
- Douze workflows de stratégie, technique, contenu, concurrence et SEO local. Conversations enregistrées ; exports Markdown, Word et Excel.
- Design appliqué à partir de `design/stripe-design/stripe-DESIGN.md`.

Aucun mode de simulation ni données de démonstration dans l’application. Une source absente est affichée comme absente.

## Installation

Node.js 24 et npm. PostgreSQL direct ou Prisma Accelerate sont pris en charge.

```bash
git clone --recurse-submodules https://github.com/andry92i/better-seo.git
cd better-seo
npm ci
cp .env.example .env
# Renseigner les variables dans .env
npx prisma generate
# Base neuve : appliquer les migrations existantes.
npx prisma migrate deploy
npm run dev
```

Ne pas réinitialiser une base existante. Si son schéma a été créé par `db push`, vérifier l’historique avant d’appliquer les migrations.

## Google

Configurer `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET`. Dans Google Cloud, activer :

- Google Search Console API ;
- Google Analytics Admin API (liste des propriétés) ;
- Google Analytics Data API (rapports) ;
- PageSpeed Insights API et Chrome UX Report API si utilisés.

URI de redirection OAuth : `https://votre-domaine/api/auth/callback/google` et, pour le développement, `http://localhost:3000/api/auth/callback/google`. Les scopes sont `webmasters.readonly` et `analytics.readonly`, en plus de l’identité Google. En mode de consentement Google « Test », ajouter les utilisateurs de test.

Dans l’application : autoriser Google, charger les propriétés, sélectionner celles du projet, enregistrer et lancer l’audit. Une clé `GOOGLE_ANALYTICS_API_KEY` ne donne pas accès aux rapports GA4 et n’est pas utilisée.

## Grok et Claude SEO

`GROK_API_KEY` appelle xAI directement. `SEO_MODEL` est un identifiant de modèle xAI disponible sur votre compte, sans préfixe `xai/`. Le modèle demandé par le projet est proposé dans l’exemple ; sa disponibilité et son quota doivent être vérifiés sur xAI. Activer `SEO_LIVE_ENABLED=true` pour autoriser les appels facturés par xAI.

Claude SEO est conservé intégralement dans le sous-module `vendor/claude-seo`. La révision `a1480c7e590b16001bd9dc1627eacdcd44d580f9` fournit 188 documents versionnés. L’agent lit les instructions, références et les preuves du projet avec ses outils. Il ne lance pas Claude Code, les scripts shell ou les MCP natifs du dépôt.

```bash
git submodule update --init --recursive
# Après revue d’une mise à jour du sous-module :
npm run seo:sync
```

## Vérifications et Vercel

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:seo
```

`vercel.json` impose `npm ci` et `npm run build`. Prisma est généré pendant le build, pas versionné. Configurer les variables sur l’environnement Vercel réellement déployé ; le domaine officiel doit correspondre à `BETTER_AUTH_URL` et au callback Google.

Les audits et le chat utilisent des fonctions Node.js avec une durée maximale de 300 secondes. Le crawl est borné à 16 pages HTML ; les jobs interrompus deviennent relançables après cinq minutes.

## Périmètre des données

GSC ne fournit ni volumes globaux de recherche, ni statistiques concurrentes, ni API du rapport Liens. Les comparaisons portent sur les pages publiques ; les liens externes du crawl sont des pistes à vérifier. Le SEO local prépare une stratégie à partir du site et du profil ; aucune géogrille Google Maps n’est mesurée.

Le crawl n’exécute pas JavaScript et n’explore pas récursivement les index de sitemaps. Les sources ont leurs propres quotas et fenêtres de disponibilité. Les recommandations restent des hypothèses à valider. Aucun classement n’est garanti.

Pour une exploitation à grande échelle : prévoir une file de travaux durable, une politique de rétention, des audits incrémentaux et un contrôle de consommation par client. Voir [l’architecture](docs/ARCHITECTURE.md) et [la couverture Claude SEO](docs/CLAUDE-SEO-INTEGRATION.md).
