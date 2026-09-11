import { knowledgeMetadata } from '@/lib/claude-seo/knowledge';
import { workflows } from '@/lib/claude-seo/workflows';
import { getSeoConfig } from '@/lib/ai/config';
import { freeDataPolicy } from '@/lib/seo-data-policy';
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ knowledge: knowledgeMetadata, workflows,
    execution: { liveConfigured: getSeoConfig().liveConfigured, tools: ['searchDocuments', 'readDocument', 'getProjectEvidence', 'loadSkill'] },
    dataPolicy: freeDataPolicy,
    data: { crawl: 'server_html', gsc: 'oauth', ga4: 'oauth', serp: 'manual_only', backlinks: 'csv_import' },
  });
}
