# Intégration Claude SEO : état réel et prochaine étape

## Diagnostic du prototype initial

Le sous-module était présent, mais aucune route ne lisait ses instructions. Le chat produisait toujours le même texte, le profil était ignoré, les exports contenaient un rapport indépendant et le bouton Google ne réalisait aucun OAuth. Le schéma Prisma ne signifiait pas que les projets et conversations étaient persistés.

## Ce qui fonctionne maintenant

- Bundle documentaire serveur reproductible : instructions des skills, descriptions des agents, références, docs et extensions. Source figée : Claude SEO 2.2.5, commit `a1480c7e590b16001bd9dc1627eacdcd44d580f9`.
- `pnpm seo:sync` compile le sous-module local sans mise à jour réseau ni exécution des scripts upstream. Empreinte SHA-256 par document et licence conservée. Le JSON généré est versionné : Vercel n’a pas besoin de lire le sous-module au runtime.
- 12 workflows sélectionnés par espace de travail ; commandes explicites `/seo local`, `/seo backlinks`, `/seo geo`, etc. disponibles dans le chat.
- Agent AI SDK `ToolLoopAgent` configurable. Outils autorisés : recherche documentaire et lecture paginée par identifiant exact. Il peut consulter toutes les instructions, pas exécuter les scripts qu’elles décrivent.
- Mode démo gratuit par défaut : plan de collecte déterministe adapté au workflow et au profil, sans fausses métriques. Il ne génère pas une rédaction IA.
- Mode réel volontaire : session Better Auth obligatoire, contrôle d’origine, requêtes bornées, 12 étapes au maximum, limite de sortie par étape et timeout. Aucun fallback silencieux en simulation.
- Exports POST de la dernière réponse : MD exact, Word texte paragraphe par paragraphe, Excel texte ligne par ligne (pas encore de table analytique structurée).
- `/api/seo/capabilities` expose la couverture documentaire et les limites d’exécution sans secrets.

## Activation de l’IA réelle (environnement privé de validation)

Configurer PostgreSQL et Better Auth, appliquer le schéma et connecter un utilisateur. Définir `SEO_LIVE_ENABLED=true`, `AI_GATEWAY_API_KEY`, `SEO_MODEL` (identifiant fournisseur/modèle réellement disponible dans votre catalogue Gateway), `BETTER_AUTH_URL` et `DATABASE_URL`. Aucun identifiant « Grok 4.6 » n’est supposé réel. La case du chat active l’envoi du profil et de la conversation au fournisseur configuré. Le changement de mode efface la conversation affichée pour ne pas mélanger des sorties de démonstration avec une analyse réelle.

Le mode réel n’a pas été testé contre un fournisseur payant lors de cette livraison. Ne pas l’ouvrir au public avant des quotas distribués, un budget par tenant, une limitation de concurrence et des évaluations adversariales des prompts. Les limites par requête ne constituent pas un budget global.

## Couverture fonctionnelle : documents ≠ outils exécutables

| Fonction | Maintenant | Pour une analyse réelle complète |
|---|---|---|
| Recherche de mots-clés | Instructions, plan de collecte, agent documentaire | GSC + fournisseur de SERP/volumes ; pays/langue ; coûts bornés |
| Concurrence et backlinks | Workflows et références | Index externe Ahrefs/DataForSEO, concurrents validés |
| Audit technique | Méthodologie consultable | Worker de crawl HTTP + navigateur isolé, protections SSRF et DNS-rebinding, robots, limites et preuves |
| SEO local | Instructions local/maps | GBP OAuth, adresses vérifiées, grilles de positions |
| Rédaction/on-page | Agent réel configurable, profil utilisateur | Contenu source, faits commerciaux, validation humaine, persistance |
| GSC/GA4 | Scopes déclarés et client GSC élémentaire préexistant | OAuth UI effectif, propriétés sélectionnées et vérifiées, refresh/chiffrement tokens, pagination et agrégations |
| Rapport/suivi | Exports de la conversation | Rapports structurés persistés, baselines, jobs durables et comparaison temporelle |

## Architecture cible et ordre d’implémentation

1. **Identité et isolation** : véritables formulaires Better Auth, projets Prisma liés au propriétaire, vérification d’accès serveur pour chaque lecture/écriture, politique de rétention. Ne jamais faire confiance à un projectId ou token envoyé par le navigateur.
2. **Google OAuth et preuves** : consentement explicite, choix des propriétés GSC/GA4, stockage chiffré, renouvellement et révocation ; collecteurs paginés en lecture seule. Une API configurée n’est pas un compte connecté. MCP est un protocole de transport, pas une source de données supplémentaire.
3. **Crawl durable** : workers hors route Next.js, files de travaux idempotentes, isolation réseau, blocage des IP privées et métadonnées cloud à chaque résolution/redirection, plafonds de pages/octets/durée et respect de robots.txt. Ne jamais exécuter une commande issue du chat ou d’une page crawlée.
4. **Orchestration spécialisée** : réutiliser les scripts upstream après revue dans le worker ; exécuter les spécialistes adaptés à l’activité ; fusionner et dédupliquer leurs constats avec preuves identifiées, dépendances, confiance et critères de réfutation. Une description d’agent n’est pas un agent lancé.
5. **Enrichissement optionnel** : MCP par tenant avec outils en lecture seule autorisés explicitement, secrets injectés côté serveur, quotas et consentement aux coûts. Aucun token ni accès global partagé entre utilisateurs.
6. **Décision et suivi** : priorisation impact/confiance/effort reliée aux objectifs commerciaux, validation humaine avant publication, tickets, reporting, contrôles de dérive et mesures avant/après sans attribution causale automatique.

Il n’existe pas de stratégie garantie « meilleure » sans objectif, marché, contraintes et données vérifiées. L’app doit expliciter l’incertitude et tester ses hypothèses.

## Licences et sécurité documentaire

La licence upstream est conservée dans le bundle et le sous-module. Certaines références FLOW comportent leurs propres conditions d’attribution : conserver leurs notices lors de la redistribution. Le bundle n’est pas une validation de l’actualité de chaque affirmation SEO. Les scripts, instructions d’installation et URLs qu’il contient restent du contenu documentaire, jamais des commandes autorisées automatiquement.
