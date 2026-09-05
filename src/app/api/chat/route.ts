import { createAgentUIStreamResponse, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { chatRequestSchema } from '@/lib/ai/request';
import { createSeoAgent } from '@/lib/ai/seo-agent';
import { demoReport } from '@/lib/ai/demo';
import { selectWorkflow } from '@/lib/claude-seo/workflows';
import { readBoundedJson } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  let body;
  try { body = chatRequestSchema.parse(await readBoundedJson(request)); }
  catch { return Response.json({ error: 'Requête invalide ou trop volumineuse.' }, { status: 400 }); }
  const question = body.messages.at(-1)!.parts.map(part => part.text).join('\n');
  const workflow = selectWorkflow(body.action, question);
  if (body.mode === 'live') {
    if (process.env.SEO_LIVE_ENABLED !== 'true' || !process.env.SEO_MODEL || !process.env.AI_GATEWAY_API_KEY || !process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
      return Response.json({ error: 'Mode réel non configuré.' }, { status: 503 });
    }
    if (!process.env.BETTER_AUTH_URL || request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL).origin) {
      return Response.json({ error: 'Origine refusée.' }, { status: 403 });
    }
    try {
      const { auth } = await import('@/lib/auth');
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return Response.json({ error: 'Connexion requise.' }, { status: 401 });
      return await createAgentUIStreamResponse({
        agent: createSeoAgent(process.env.SEO_MODEL, workflow, body.profile),
        uiMessages: body.messages,
        abortSignal: request.signal,
        timeout: 100000,
        onError: () => 'Analyse interrompue. Aucun résultat ne doit être considéré comme validé.',
      });
    } catch {
      return Response.json({ error: 'Service IA indisponible. Aucun rapport simulé substitué.' }, { status: 502 });
    }
  }
  const report = demoReport(body, workflow);
  const stream = createUIMessageStream({
    execute({ writer }) {
      const id = crypto.randomUUID();
      writer.write({ type: 'text-start', id });
      for (let i = 0; i < report.length; i += 96) writer.write({ type: 'text-delta', id, delta: report.slice(i, i + 96) });
      writer.write({ type: 'text-end', id });
      writer.setOutcome({ status: 'completed' });
    },
  });
  return createUIMessageStreamResponse({ stream });
}
