export const workflows = {
  'quick-wins': { title: 'Opportunités existantes', skills: ['seo-google', 'seo-page', 'seo-plan'], needs: ['GSC : requêtes et pages sur deux périodes comparables', 'Contenu actuel des pages'] },
  'keyword-research': { title: 'Recherche de mots-clés', skills: ['seo-google', 'seo-cluster', 'seo-sxo'], needs: ['Requêtes et pages GSC de votre propriété', 'Clics, impressions, CTR et positions sur périodes comparables', 'Export Google Trends facultatif : intérêt relatif, pas volume absolu'] },
  'competitor-gap': { title: 'Écarts concurrentiels', skills: ['seo-competitor-pages', 'seo-backlinks', 'seo-sxo'], needs: ['Concurrents confirmés', 'Contenus publics des pages concurrentes fournis pour comparaison', 'Observations SERP manuelles datées, sans données privées concurrentes'] },
  'content-plan': { title: 'Plan éditorial', skills: ['seo-plan', 'seo-content-brief', 'seo-cluster', 'seo-flow'], needs: ['Objectifs commerciaux', 'Inventaire de contenus', 'Demande de recherche documentée'] },
  'rewrite-landing': { title: 'Rédaction de page', skills: ['seo-content', 'seo-page', 'seo-schema'], needs: ['Contenu de la page', 'Offre et preuves commerciales vérifiables', 'Ton de marque et audience'] },
  'technical-sprint': { title: 'Audit technique', skills: ['seo-technical', 'seo-sitemap', 'seo-schema', 'seo-images'], needs: ['Crawl et HTML rendu', 'Robots.txt et sitemaps', 'CrUX/PageSpeed', 'Inspection URL GSC'] },
  'local-seo': { title: 'SEO local', skills: ['seo-local', 'seo-maps'], needs: ['Établissements et zones desservies', 'Données Google Business Profile autorisées ou fournies', 'Observations locales manuelles datées, sans géogrille automatique'] },
  backlinks: { title: 'Backlinks', skills: ['seo-backlinks', 'seo-google'], needs: ['Export CSV du rapport Liens GSC de votre propriété', 'Échantillon partiel, sans score d’autorité ni profil concurrent complet'] },
  'ai-search': { title: 'Visibilité IA', skills: ['seo-geo', 'seo-content', 'seo-sxo'], needs: ['Pages et preuves éditoriales', 'Mesures de citations externes'] },
  international: { title: 'SEO international', skills: ['seo-hreflang', 'seo-sitemap'], needs: ['Locales et URLs correspondantes', 'Crawl des variantes régionales'] },
  ecommerce: { title: 'SEO e-commerce', skills: ['seo-ecommerce', 'seo-schema', 'seo-programmatic'], needs: ['Catalogue et variantes', 'Pages produits rendues', 'Données Merchant Center'] },
  monitoring: { title: 'Suivi de dérive SEO', skills: ['seo-drift', 'seo-google'], needs: ['Baseline horodatée', 'Nouveau crawl', 'GSC et GA4 sur périodes comparables'] },
} as const;
export type WorkflowId = keyof typeof workflows;
export function selectWorkflow(action: string, question: string): WorkflowId {
  // Explicit slash commands override the workspace; natural questions retain its context.
  const command = question.match(/^\/seo\s+(\S+)/i)?.[1]?.toLowerCase();
  const commands: Record<string, WorkflowId> = { audit: 'technical-sprint', technical: 'technical-sprint', local: 'local-seo', maps: 'local-seo', backlinks: 'backlinks', geo: 'ai-search', hreflang: 'international', ecommerce: 'ecommerce', drift: 'monitoring', plan: 'content-plan', cluster: 'keyword-research', page: 'rewrite-landing', content: 'rewrite-landing' };
  if (command && commands[command]) return commands[command];
  return Object.hasOwn(workflows, action) ? action as WorkflowId : 'content-plan';
}
