import { knowledgeMetadata } from '@/lib/claude-seo/knowledge';
import { workflows } from '@/lib/claude-seo/workflows';
export function GET() {
  return Response.json({ knowledge: knowledgeMetadata, workflows,
    execution: { demo: true, liveConfigured: process.env.SEO_LIVE_ENABLED === 'true' && Boolean(process.env.SEO_MODEL && process.env.AI_GATEWAY_API_KEY && process.env.DATABASE_URL && process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_SECRET), tools: ['searchDocuments', 'readDocument'] },
    data: { crawl: 'not_connected', gsc: 'not_connected', ga4: 'not_connected', serp: 'not_connected', backlinks: 'not_connected' },
  });
}
