import { seoTasks } from '@/lib/claude-seo/tasks';
import { knowledgeMetadata } from '@/lib/claude-seo/knowledge';
import { workflows } from '@/lib/claude-seo/workflows';
import { getSeoConfig } from '@/lib/ai/config';
import { freeDataPolicy } from '@/lib/seo-data-policy';
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ knowledge: knowledgeMetadata, workflows, tasks: seoTasks.map(({command,group,en,fr,needs}) => ({command,group,en,fr,needs})),
    execution: { assistantEnabled: getSeoConfig().checks.enabled, liveConfigured: getSeoConfig().liveConfigured, tools: ['searchDocuments', 'readDocument', 'getProjectEvidence', 'analyzeAudit', 'loadSkill'] },
    dataPolicy: freeDataPolicy,
    data: { crawl: 'server_html', gsc: 'oauth', inspection: 'oauth_indexed_homepage', ga4: 'oauth', serp: 'manual_only', backlinks: 'csv_import' },
  });
}
