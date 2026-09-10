# Couverture Claude SEO

Révision intégrée : `a1480c7e590b16001bd9dc1627eacdcd44d580f9`, version 2.2.5, licence MIT, 188 documents.

Le sous-module conserve le dépôt upstream complet. `scripts/sync-seo-knowledge.mjs` compile les documents et leurs empreintes SHA-256 dans le bundle serveur. Les tests comparent chaque document au sous-module. Une mise à jour upstream doit être revue avant régénération.

| Fonction | Exécution dans Better SEO | Limite |
| --- | --- | --- |
| Recherche de mots-clés | Requêtes/pages GSC et analyse Grok | Données du site, pas volume marché |
| Concurrence | Crawl public de trois pages d’accueil choisies | Pas de données privées ni SERP mesurée |
| Audit technique | HTML, robots, sitemap simple, metadata, JSON-LD, images | 16 pages, sans rendu JS |
| Performance | PageSpeed mobile et CrUX | Clés, quotas, seuils de trafic |
| Backlinks | Import CSV Liens GSC, lecture par l’agent | Pas d’API Liens GSC, fichier utilisateur |
| SEO local | Profil, contenu, schémas observés, plan local | Pas d’intégration Business Profile/Maps |
| Rédaction/on-page | Réponses Grok avec preuves et méthodologie | Brouillons à relire |
| Rapports | Constats persistés, conversations, MD/DOCX/XLSX | Extrait dashboard, preuves complètes côté agent |

Les 12 workflows choisissent les instructions pertinentes. L’agent peut rechercher tous les documents du bundle et lire les références en entier avec pagination. Il doit distinguer faits observés, hypothèses et données absentes.

L’import du dépôt ne transforme pas les commandes Claude Code en outils serveur. Les sous-agents natifs, commandes shell et connecteurs MCP décrits par upstream ne sont pas exécutés ici. Les appels Google sont implémentés directement avec OAuth ; ils assurent le cloisonnement par utilisateur.

Le cadre « Google gratuit uniquement » prime sur les fournisseurs payants cités dans certains documents upstream. Le moteur ne dispose d’aucun outil DataForSEO, Ahrefs ou SEMrush. Les coûts xAI sont distincts des sources SEO Google.
