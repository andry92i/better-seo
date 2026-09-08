export const freeDataPolicy = {
  id: 'google-free-first',
  paidSeoProviders: false,
  sources: [
    { id: 'google-search-console', name: 'Google Search Console', access: 'OAuth en lecture seule', use: 'Requêtes, pages, clics, impressions, CTR, position moyenne et inspection des URL de vos propriétés.', limit: 'Données partielles de votre site ; ni volumes de marché ni positions privées des concurrents.' },
    { id: 'google-analytics', name: 'Google Analytics 4', access: 'OAuth en lecture seule', use: 'Acquisition organique, pages de destination, engagement et événements clés.', limit: 'Selon votre instrumentation, votre consentement Analytics et les quotas Google.' },
    { id: 'pagespeed', name: 'PageSpeed Insights', access: 'API Google', use: 'Audit Lighthouse et diagnostics de performance.', limit: 'Mesures de laboratoire ; ne pas les confondre avec les données terrain.' },
    { id: 'crux', name: 'Chrome UX Report', access: 'Clé API Google', use: 'Core Web Vitals réels et historique quand disponibles.', limit: 'Une URL ou origine peut ne pas avoir assez de données. Aucun score ne doit être inventé.' },
    { id: 'gsc-links-export', name: 'Rapport Liens Search Console', access: 'Export CSV manuel', use: 'Examiner les liens connus vers votre propre site.', limit: 'Échantillon non exhaustif ; pas d’API Liens dans le connecteur GSC et pas de profil concurrent complet.' },
    { id: 'google-trends', name: 'Google Trends', access: 'Export manuel ; API sous accès alpha', use: 'Saisonnalité et intérêt relatif des sujets.', limit: 'Ne fournit pas un volume mensuel absolu. L’accès API n’est pas garanti.' },
    { id: 'google-business-profile', name: 'Google Business Profile', access: 'OAuth et approbation Google', use: 'Préparer l’analyse de vos établissements autorisés.', limit: 'Pas de suivi automatique du classement Maps ni de grille géographique dans cette version.' },
  ],
  unavailable: ['Volumes de marché exhaustifs', 'Keyword Difficulty propriétaire', 'Trafic privé des concurrents', 'Index mondial des backlinks', 'Classements Maps géolocalisés automatiques'],
} as const;

export const freeDataInstructions = [
  'CONTRAINTE PRODUIT PRIORITAIRE : sources SEO gratuites, Google en priorité. Aucun appel ni abonnement DataForSEO, Ahrefs, Semrush, Firecrawl, Google Ads ou Maps payant. Les passages du corpus qui en dépendent sont non applicables.',
  'Les outils de recherche web payants du modèle xAI ne sont pas activés. Ne les invente pas.',
  'Mots-clés : utiliser les requêtes, pages, clics, impressions, CTR et positions GSC. Une impression n’est pas un volume de recherche. Une position moyenne n’est pas un classement universel.',
  'Clustering sans SERP : clusters sémantiques proposés, à valider ; ne jamais les présenter comme clusters SERP mesurés.',
  'Concurrence : comparer seulement les contenus publics fournis ou collectés par un outil déclaré. Demander confirmation des domaines suggérés ; ni trafic concurrent ni difficulté de mot-clé inventés.',
  'Backlinks : demander un export CSV du rapport Liens GSC. Ce rapport est partiel et ne fournit pas le profil complet des concurrents ; aucun Domain Rating ni score de toxicité.',
  'Trends : intérêt relatif et exports manuels ; API alpha non garantie. Business Profile : accès soumis à approbation. Pas de promesse de géogrille gratuite.',
  'Prendre en compte les limites de lignes, anonymisation, dates, pays, appareils, type de recherche, fuseaux et fraîcheur ; ne pas sommer les totaux GSC détaillés comme des totaux exhaustifs.',
  'Synthèse Claude SEO : observer → analyser → valider → proposer des actions. Produire au plus trois priorités initiales, avec preuve datée, hypothèse, effort, mesure et condition de réévaluation.',
  'Ne pas publier ni modifier un site : fournir des brouillons et des propositions à valider. La présence d’un skill n’implique pas un outil exécutable.',
].join('\n');
