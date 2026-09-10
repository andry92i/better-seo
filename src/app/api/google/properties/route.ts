import { googleToken, googleProperties } from "@/lib/google/data";
import { requireUser, apiError } from "@/lib/server-access";
export async function GET(request: Request) {
  try { const user = await requireUser(request); return Response.json(await googleProperties(await googleToken(user.id, request.headers)), { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return apiError(error); }
}
