import { knowledgeMetadata } from '@/lib/claude-seo/knowledge';
import { workflows } from '@/lib/claude-seo/workflows';
import { getSeoConfig } from '@/lib/ai/config';
import { freeDataPolicy } from '@/lib/seo-data-policy';
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ knowledge: knowledgeMetadata, workflows,
    execution: { demo: true, ...getSeoConfig(), tools: ['searchDocuments', 'readDocument'] },
    dataPolicy: freeDataPolicy,
    data: { crawl: 'not_connected', gsc: 'not_connected', ga4: 'not_connected', serp: 'not_connected', backlinks: 'not_connected' },
  });
}
