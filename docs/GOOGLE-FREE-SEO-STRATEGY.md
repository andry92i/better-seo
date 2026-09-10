> Document de conception initial. Pour la couverture exécutée actuelle, consulter README.md et CLAUDE-SEO-INTEGRATION.md. Le mode démo décrit ci-dessous a été supprimé.

# Better SEO : stratégie Google gratuite et Grok direct

Analyse du 7 septembre 2026. Périmètre : parcours publics de ChatSEO, documentation Google/xAI et code Claude SEO versionné dans ce projet. Aucun compte ChatSEO privé testé. Les promesses commerciales citées ne constituent pas une validation indépendante des résultats.

## Décision produit

Construire un ingénieur SEO qui exploite d’abord les signaux du site autorisé : recherche réellement observée, contenu disponible, performance et conversions. Aucune dépendance à un abonnement DataForSEO, Ahrefs ou Semrush. La gratuité concerne les sources SEO sélectionnées, sous leurs quotas ; elle ne couvre pas Grok, l’hébergement, PostgreSQL ou le calcul d’un crawler.

SEO_MODEL est le nom du modèle xAI. GROK_API_KEY est le secret qui autorise ses appels. Le fournisseur AI SDK xAI appelle directement api.x.ai, sans AI Gateway. Le modèle grok-4.6 est documenté à la date de cette analyse. L’accès réel dépend du compte xAI. [Documentation xAI](https://docs.x.ai/developers/grok-4-6).

```dotenv
GROK_API_KEY=""
SEO_MODEL="grok-4.6"
SEO_LIVE_ENABLED="false"
```

Ajouter la vraie clé uniquement côté serveur, puis activer le mode réel une fois Better Auth, sa base et son URL configurés. Ne jamais utiliser NEXT_PUBLIC_ pour une clé. Le mode démo ne fait aucun appel Grok.

## Ce que l’approche ChatSEO nous apprend

La page d’accueil regroupe recherche, audit, rédaction et suivi autour d’un assistant conscient du site. Elle affiche aussi des interventions CMS après validation. Better SEO peut reprendre cette continuité : un constat ouvre une action contextualisée, qui produit un livrable, puis un suivi. Son interface publique mentionne également DataForSEO : sa couverture concurrentielle ne découle donc pas uniquement de Google. [Présentation ChatSEO](https://chatseo.app/fr).

Le parcours GSC met l’accent sur les pages déjà visibles, les CTR faibles et les pertes de clics. Je retiens une première synthèse de trois actions vérifiables, avec les pages et périodes concernées, puis la possibilité de développer chacune dans le chat. Un seuil fixe de position est un filtre de travail, pas une garantie de résultat. [Parcours GSC](https://chatseo.app/fr/fonctionnalites/google-search-console-seo).

Le volet concurrentiel propose d’étudier les sujets et stratégies rivales. Avec notre contrainte de coût, la comparaison doit porter sur des contenus publics fournis ou collectés par un outil dédié. Les mots-clés supposés d’un concurrent sont des hypothèses, pas son inventaire mesuré. [Analyse concurrentielle](https://chatseo.app/fr/fonctionnalites/analyse-concurrentielle-seo).

Le parcours on-page rapproche diagnostic et modification éditoriale. Better SEO devrait présenter le texte actuel, la proposition, les raisons et les preuves manquantes. L’export est disponible ; la publication CMS reste un développement distinct, avec validation et restauration de l’ancienne version. [On-page](https://chatseo.app/fr/fonctionnalites/outil-seo-on-page).

## Matrice des fonctionnalités

| Fonction | Source gratuite privilégiée | Ce que l’app peut conclure | Limite à afficher |
|---|---|---|---|
| Mots-clés | Search Analytics GSC | Requêtes visibles, pages associées, clics, impressions, CTR, position moyenne | Pas de volume global du marché ni de difficulté propriétaire |
| Baisse de trafic | GSC, puis GA4 | Où la baisse se produit ; hypothèses à vérifier | Une corrélation ne prouve pas sa cause |
| Valeur commerciale | GA4 standard | Sessions organiques, engagement, événements clés | Dépend du suivi installé et du consentement |
| Audit technique | HTML fourni/crawl à construire, URL Inspection, sitemaps | Directives, balises, indexation observée, maillage | Un crawl HTML ne remplace pas un rendu JS ; l’inspection n’est pas un test live |
| Performance | PageSpeed Insights et CrUX | Diagnostics de laboratoire et données terrain distincts | Quotas et couverture CrUX insuffisante possibles |
| Concurrents | Pages publiques et observations manuelles | Différences d’offre, structure, couverture des sujets | Ni GSC ni GA4 ne dévoilent leurs statistiques privées |
| Backlinks | Export Liens GSC du propriétaire | Inventaire partiel et pistes de vérification | Pas de profil mondial exhaustif, DR ou toxicité calculée |
| Contenu | Contexte métier, GSC, inventaire et preuves utilisateur | Briefs, plans, brouillons, titres et propositions de maillage | Idées de sujets non observées étiquetées comme hypothèses |
| SEO local | Business Profile autorisé, informations fournies | Cohérence des coordonnées, services, horaires et avis disponibles | Approbation Google ; pas de géogrille automatique gratuite |
| Tendances | Export Google Trends | Intérêt relatif et saisonnalité | API alpha non garantie, aucun volume absolu |
| GEO | Rapports Google disponibles et observations sourcées | Optimisation éditoriale et suivi des signaux accessibles | Aucune garantie de citation par une IA |

Search Analytics expose les principales lignes, pas nécessairement l’ensemble des résultats. Paginer n’annule pas ses limites internes. Garder les agrégations de propriété séparées des sommes requête/page. Stocker les segments pays/appareil/type de recherche avec chaque mesure. [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [limites de données](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data).

Le rapport Liens est un échantillon exportable en CSV ou Google Sheets ; il n’indique pas tous les attributs des liens. La référence de l’API GSC ne comporte pas de méthode de rapport Liens : prévoir un import manuel plutôt qu’un faux connecteur automatique. [Rapport Liens](https://support.google.com/webmasters/answer/9049606), [référence API](https://developers.google.com/webmaster-tools/v1/api_reference_index).

GA4 impose des quotas par propriété. Interroger des rapports agrégés limités, mettre en cache par utilisateur et propriété, gérer 429 et données absentes. Les clics GSC et sessions GA4 ne sont pas interchangeables : fuseaux, consentement, périmètres et attribution diffèrent. [Quotas Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas), [runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport).

PageSpeed sert aux diagnostics de performance ; interroger CrUX séparément pour le terrain lorsqu’il est disponible. Ne pas promettre toutes les données terrain pour chaque URL. [PageSpeed](https://developers.google.com/speed/docs/insights/v5/get-started).

Google Trends affiche encore une demande d’accès alpha à son API. Business Profile demande des prérequis et une approbation. Ces deux sources doivent rester facultatives pour l’onboarding. [Trends alpha](https://developers.google.com/search/apis/trends), [Business Profile](https://developers.google.com/my-business/content/prereqs).

Google a annoncé des rapports dédiés à la visibilité dans les fonctions génératives de Search en juin 2026. Vérifier la disponibilité et le schéma API avant de les brancher ; ne pas supposer que tous les comptes ou tous les exports les exposent déjà. [Annonce Google](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).

## Exploiter Claude SEO correctement

Le corpus local est épinglé à la révision a1480c7e590b16001bd9dc1627eacdcd44d580f9, version 2.2.5 : 188 documents, instructions spécialisées et références. Le dépôt décrit des scripts, sous-agents et extensions ; l’agent Next.js n’obtient pas ces moyens d’exécution simplement en lisant leurs noms. [Source versionnée](https://github.com/AgriciDaniel/claude-seo/tree/a1480c7e590b16001bd9dc1627eacdcd44d580f9).

L’adaptation retient quatre étapes :

1. Observer : choisir le secteur et les sources disponibles, contrôler leur période, leur provenance et leur couverture.
2. Analyser : sélectionner les instructions technique, Google, contenu, schema, SXO, clustering ou local selon la demande.
3. Valider : confronter chaque hypothèse à une preuve ; renvoyer « données insuffisantes » quand nécessaire.
4. Agir : produire un plan séquencé, un responsable proposé, un effort, un KPI et une condition de réévaluation.

Conserver le corpus upstream intact pour pouvoir vérifier les mises à jour. Les règles du produit priment sur les recommandations d’extensions payantes. Les workflows mots-clés et backlinks ne sélectionnent plus seo-dataforseo. Les références à des fournisseurs payants peuvent rester dans les documents upstream, mais ne créent ni connexion ni obligation d’abonnement.

Pour un déploiement SaaS complet, les scripts de crawl et de rendu doivent vivre dans un worker isolé, avec quotas, contrôle des destinations et tâches reprenables. Ne pas donner au modèle un shell arbitraire. Les outils de l’agent appellent des fonctions bornées, attachées au projet et à l’utilisateur authentifié. Les MCP sont un transport possible ; des appels API Google directs évitent une dépendance à un intermédiaire payant.

## Parcours recommandé et critères d’acceptation

**Onboarding.** Rôle, niveau, activité, offre, audience, pays/langue, objectifs, capacité de publication, URL. Ensuite consentement Google, sélection explicite des propriétés GSC/GA4, puis concurrents confirmés. Le manque de données mène à un parcours de démarrage éditorial, pas à de faux résultats.

**Collecte.** OAuth en lecture seule, refresh des tokens côté serveur, validation de l’accès à chaque propriété, isolation par utilisateur. GSC sur deux fenêtres comparables ; GA4 sur le canal organique ; inspection des seules pages prioritaires. Stocker date de collecte, période, segment, limite de lignes et erreurs. Ne pas envoyer de tokens OAuth au modèle.

**Priorisation.** Distinguer pertes observées, CTR à étudier, pages visibles en positions intermédiaires et pistes de contenu. Comparer le CTR aux pages comparables du même site, en segmentant marque, pays et appareil. La cannibalisation reste une hypothèse à vérifier par intention et évolution des pages, pas une conclusion dès que deux URL partagent une requête.

**Livrable.** Trois priorités initiales. Pour chacune : page, preuve, diagnostic/hypothèse, proposition, dépendances, effort, KPI et date de réévaluation. Passer une requête sélectionnée du tableau au chat sans la perdre. Les exports doivent reprendre exactement les réponses, sans ajouter des chiffres fictifs.

**Suivi.** Sauvegarder l’état avant modification, annoter la date et comparer après une période pertinente. Ne pas attribuer automatiquement toute hausse à l’action : tenir compte de la saisonnalité, des changements du site et des évolutions de Search.

## État de l’implémentation après cette mise à jour

Réalisé : xAI direct avec GROK_API_KEY ; modèle configurable ; garde d’activation commune aux routes ; retrait des variables de fournisseurs payants ; catalogue de sources gratuites ; adaptation des workflows, consignes, démo, écrans mots-clés/concurrents/intégrations ; tests de destination xAI sans appel payant.

À réaliser avant de revendiquer l’audit automatique : parcours OAuth Google complet, sélection et synchronisation des propriétés, pagination et snapshots GSC, rapports GA4, collecte PageSpeed/CrUX, import CSV Liens, crawler sécurisé, moteur de priorisation basé sur les données et persistance des livrables.

Aucune connexion Google ni génération Grok réelle n’a été validée dans cette modification : les identifiants ne sont pas fournis. Les états « à préparer » restent donc visibles.

## Journal de recherche

Méthode : lectures du site et de quatre pages fonctionnelles ChatSEO ; recherche Google/xAI ; comparaison au code et aux instructions upstream épinglées. Sources utilisées : pages primaires des éditeurs, pas de témoignages comme preuve de performance. L’accès Web au dépôt GitHub et à la page AI SDK a échoué ; le dépôt local et la documentation du package @ai-sdk/xai installé ont fourni les références techniques. Aucun benchmark concurrent ni compte privé testé.
