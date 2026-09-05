import 'server-only';
import knowledge from './generated/knowledge.json';
import { workflows, type WorkflowId } from './workflows';

export const knowledgeMetadata = {
  version: knowledge.version, revision: knowledge.revision, repository: knowledge.repository,
  documents: knowledge.documents.length,
  skills: knowledge.documents.filter(d => /^skills\/[^/]+\/SKILL\.md$/.test(d.id)).map(d => d.id.split('/')[1]),
  agents: knowledge.documents.filter(d => /^agents\/[^/]+\.md$/.test(d.id)).map(d => d.id),
};

export function readKnowledge(id: string, offset = 0) {
  // Exact IDs only: no arbitrary filesystem reads, URL retrieval or path traversal.
  const document = knowledge.documents.find(d => d.id === id);
  if (!document) return { error: 'Document inconnu' };
  const end = Math.min(offset + 16000, document.content.length);
  return { id, sha256: document.sha256, revision: knowledge.revision, content: document.content.slice(offset, end), nextOffset: end < document.content.length ? end : null };
}

export function searchKnowledge(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 10);
  if (!terms.length) return [];
  return knowledge.documents.map(d => ({ id: d.id, sha256: d.sha256, score: terms.reduce((n, term) => n + (d.id.toLowerCase().includes(term) ? 5 : 0) + (d.content.toLowerCase().includes(term) ? 1 : 0), 0) }))
    .filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
}

export function workflowInstructions(id: WorkflowId) {
  return workflows[id].skills.map(skill => {
    const document = knowledge.documents.find(d => d.id === `skills/${skill}/SKILL.md`);
    if (!document) throw new Error(`Knowledge build incomplete: ${skill}`);
    // Seed document IDs; the agent reads full, paginated instructions through its tools.
    return { id: document.id, sha256: document.sha256 };
  });
}
