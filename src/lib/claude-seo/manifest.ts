export const claudeSeoSpecialists = [
  "technical", "content", "schema", "performance", "images", "geo", "local", "maps",
  "backlinks", "sitemap", "hreflang", "ecommerce", "sxo", "programmatic", "competitor-pages",
] as const;

export const claudeSeoScoreWeights = {
  content: 23,
  technical: 22,
  onPage: 20,
  schema: 10,
  performance: 10,
  aiReadiness: 10,
  images: 5,
} as const;

export const evidencePolicy = [
  "Séparer strictement données observées, inférences et estimations.",
  "Conserver la source, la date et l’URL pour chaque constat.",
  "Ne jamais présenter le score heuristique comme un score Google.",
  "Prioriser selon impact, confiance, effort et adéquation aux objectifs.",
] as const;
