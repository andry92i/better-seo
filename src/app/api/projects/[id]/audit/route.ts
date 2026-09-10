import { requireUser, apiError } from "@/lib/server-access";
import { runAudit } from "@/lib/seo/audit";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const user = await requireUser(request, true); return Response.json(await runAudit(user.id, (await context.params).id, request.headers)); }
  catch (error) { return apiError(error); }
}
