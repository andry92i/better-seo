import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, apiError, ownedProject, HttpError } from "@/lib/server-access";
import { readBoundedJson } from "@/lib/http";
import { parseBacklinks } from "@/lib/seo/backlinks";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request, true);
    const project = await ownedProject(user.id, (await context.params).id);
    const body = z.object({ csv: z.string().min(1).max(500000) }).parse(await readBoundedJson(request, 600000));
    let report;
    try { report = parseBacklinks(body.csv); }
    catch { throw new HttpError(400, "CSV invalide : vérifiez l’en-tête, les lignes et les guillemets."); }
    const artifact = await db.artifact.create({ data: { projectId: project.id, name: "Import Liens Search Console", format: "XLSX", storageKey: "database:backlinks", metadata: JSON.parse(JSON.stringify(report)) } });
    return Response.json({ artifact });
  } catch (error) { return apiError(error); }
}
