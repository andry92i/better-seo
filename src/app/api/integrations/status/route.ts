import { db } from "@/lib/db";
import { requireUser, apiError } from "@/lib/server-access";
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const account = await db.account.findFirst({ where: { userId: user.id, providerId: "google" }, select: { scope: true } });
    return Response.json({ googleLinked: Boolean(account), scopes: account?.scope ?? "", configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
