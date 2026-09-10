import { getLocale } from "next-intl/server";
import { serverCopy } from "@/i18n/server-copy";
import type { Locale } from "@/i18n/locale";
import { createAgentUIStreamResponse } from "ai";
import { chatRequestSchema } from "@/lib/ai/request";
import { createSeoAgent } from "@/lib/ai/seo-agent";
import { selectWorkflow } from "@/lib/claude-seo/workflows";
import { readBoundedJson } from "@/lib/http";
import { getSeoConfig } from "@/lib/ai/config";
import { requireUser, ownedProject, apiError, HttpError } from "@/lib/server-access";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await requireUser(request, true);
    const locale = await getLocale() as Locale;
    const copy = await serverCopy();
    const body = chatRequestSchema.parse(await readBoundedJson(request));
    const config = getSeoConfig();
    if (!config.liveConfigured) throw new HttpError(503, "Configurez GROK_API_KEY, SEO_MODEL et SEO_LIVE_ENABLED sur le serveur.");
    const project = await ownedProject(user.id, body.projectId);
    const last = body.messages.at(-1)!;
    const question = last.parts.map(p => p.text).join("\n");
    const workflow = selectWorkflow(body.action, question);
    const recent = await db.message.count({ where: { conversation: { project: { userId: user.id } }, role: "user", createdAt: { gt: new Date(Date.now() - 60000) } } });
    if (recent >= 8) throw new HttpError(429, "Trop de demandes. Réessayez dans une minute.");
    const conversation = body.conversationId
      ? await db.conversation.findFirst({ where: { id: body.conversationId, projectId: project.id } })
      : await db.conversation.create({ data: { projectId: project.id, workflow, title: question.slice(0, 100) } });
    if (!conversation) throw new HttpError(404, "Conversation introuvable.");
    const previous = await db.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "desc" }, take: 20 });
    await db.message.create({ data: { conversationId: conversation.id, role: "user", parts: last.parts } });
    // Replay server-owned text only; ignore client-supplied history and tool outputs.
    const history = previous.reverse().map(m => ({ id: m.id, role: m.role as "user" | "assistant", parts: (m.parts as { type: string; text: string }[]).filter(p => p.type === "text") })).filter(m => m.parts.length);
    return await createAgentUIStreamResponse({
      agent: createSeoAgent(config.model, workflow, project, locale),
      uiMessages: [...history, last], timeout: 240000, abortSignal: request.signal,
      headers: { "X-Conversation-Id": conversation.id, "Cache-Control": "no-store" },
      onEnd: async ({ responseMessage }) => {
        const parts = responseMessage.parts.filter(p => p.type === "text");
        if (parts.length) await db.message.create({ data: { conversationId: conversation.id, role: "assistant", parts: JSON.parse(JSON.stringify(parts)) } });
        await db.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      },
      onError: () => copy("Analyse interrompue. Vérifiez la disponibilité et le quota du modèle Grok configuré."),
    });
  } catch (error) { return apiError(error); }
}

