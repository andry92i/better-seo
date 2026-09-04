import type { Finding, Recommendation } from "@/lib/types";

export const auditScores = [
  { label: "Technique", score: 72 }, { label: "Contenu", score: 64 },
  { label: "On-page", score: 78 }, { label: "Performance", score: 86 },
  { label: "Autorité", score: 43 }, { label: "AI Search", score: 58 },
];

export const findings: Finding[] = [
  { id: "1", title: "Pages à fort potentiel bloquées en positions 8–20", detail: "14 requêtes cumulent 9,8 k impressions mensuelles avec un CTR inférieur à 1,4 %.", impact: "Critique", category: "Opportunité GSC", effort: "2–4 h" },
  { id: "2", title: "Cannibalisation sur le cluster “auth Next.js”", detail: "Trois pages répondent à la même intention et divisent les signaux internes.", impact: "Élevé", category: "Architecture", effort: "3 h" },
  { id: "3", title: "Données structurées incomplètes", detail: "Les pages article n’exposent ni author.url ni dateModified et perdent des signaux de confiance.", impact: "Élevé", category: "Schema", effort: "1 h" },
  { id: "4", title: "Écart de backlinks sur 6 pages stratégiques", detail: "Les concurrents classés dans le top 5 ont en moyenne 22 domaines référents supplémentaires.", impact: "Moyen", category: "Autorité", effort: "2 sem." },
];

export const recommendations: Recommendation[] = [
  { slug: "quick-wins", title: "Exploiter 14 quick wins GSC", description: "Prioriser les requêtes en positions 8–20 et générer un plan d’optimisation page par page.", impact: "+18–31 % de clics estimés", time: "~8 min", badge: "Meilleur prochain choix" },
  { slug: "keyword-research", title: "Construire la carte de mots-clés", description: "Créer clusters, intentions, entités, difficulté et pages cibles sans cannibalisation.", impact: "42 opportunités détectées", time: "~12 min", badge: "Recherche" },
  { slug: "competitor-gap", title: "Analyser l’écart concurrentiel", description: "Comparer contenu, structure, SERP, liens et présence AI avec 3 concurrents.", impact: "6 écarts prioritaires", time: "~10 min", badge: "Concurrence" },
  { slug: "content-plan", title: "Créer un plan éditorial 90 jours", description: "Transformer la demande organique en briefs, calendrier et maillage interne mesurable.", impact: "24 contenus planifiés", time: "~6 min", badge: "Contenu" },
  { slug: "rewrite-landing", title: "Réécrire la landing page", description: "Produire une page persuasive, humaine et optimisée avec métadonnées et FAQ utiles.", impact: "Livrable DOCX + MD", time: "~5 min", badge: "Création" },
  { slug: "technical-sprint", title: "Planifier le sprint technique", description: "Convertir les erreurs d’indexation, performance et schema en tickets prêts à développer.", impact: "11 tickets actionnables", time: "~7 min", badge: "Technique" },
];

export const competitors = [
  { domain: "semrush.com", overlap: 78, reason: "Forte couverture des intentions outils SEO" },
  { domain: "ahrefs.com", overlap: 71, reason: "Autorité et contenu éducatif supérieur" },
  { domain: "surferseo.com", overlap: 63, reason: "Positionnement proche sur l’optimisation IA" },
];
