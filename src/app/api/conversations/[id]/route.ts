import { db } from "@/lib/db";
import { requireUser, apiError, HttpError } from "@/lib/server-access";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const conversation = await db.conversation.findFirst({ where: { id: (await context.params).id, project: { userId: user.id } }, include: { messages: { orderBy: { createdAt: "asc" } } } });
    if (!conversation) throw new HttpError(404, "Conversation introuvable.");
    return Response.json({ conversation }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
