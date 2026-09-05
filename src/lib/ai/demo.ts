import { knowledgeMetadata, workflowInstructions } from '../claude-seo/knowledge';
import { workflows, type WorkflowId } from '../claude-seo/workflows';
import type { ChatRequest } from './request';
export function demoReport(input: ChatRequest, workflow: WorkflowId) {
  const spec = workflows[workflow];
  return [
    `## ${spec.title} — préparation de l’analyse`,
    '> Démonstration déterministe : aucun modèle Grok ni service SEO appelé. Ceci est un plan de collecte, pas un audit du site.',
    `Site déclaré : ${input.profile.websiteUrl || 'non renseigné'}. Activité : ${input.profile.businessType || 'à préciser'}. Niveau : ${input.profile.seoLevel || 'à préciser'}.`,
    `Objectifs déclarés : ${input.profile.goals.join(', ') || 'à préciser'}.`,
    `Concurrents déclarés, non vérifiés : ${input.profile.competitors.join(', ') || 'aucun'}.`,
    '### Données nécessaires avant de conclure', ...spec.needs.map(need => `- ${need} — **non collecté**.`),
    '### Méthodologie sélectionnée',
    ...workflowInstructions(workflow).map(doc => `- [${doc.id}](${knowledgeMetadata.repository}/blob/${knowledgeMetadata.revision}/${doc.id})`),
    '### Prochaine action',
    'Rassembler ces données, documenter leurs sources et périodes, puis établir une baseline. Responsable proposé : propriétaire du projet. Échéance proposée : prochain sprint. KPI : couverture des données requises. Critère d’échec : preuves absentes ou périodes non comparables.',
    'Aucune priorité de correction ni estimation de gain validée sans ces données. Le mode IA réel peut exploiter les instructions et rédiger des propositions ; il ne remplace pas les connecteurs manquants.',
    `Source méthodologique : Claude SEO ${knowledgeMetadata.version}, révision ${knowledgeMetadata.revision}.`,
  ].join('\n\n');
}
