import { auth } from "@/lib/auth";
import { requireUser, apiError } from "@/lib/server-access";
import { readBoundedJson } from "@/lib/http";
import { profileSchema } from "@/lib/profile-schema";

export async function PATCH(request: Request) {
  try {
    await requireUser(request, true);
    const body = profileSchema.parse(await readBoundedJson(request, 5000));
    await auth.api.updateUser({ headers: request.headers, body: { name: body.name, image: body.image || null } });
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
