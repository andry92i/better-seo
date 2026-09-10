import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, apiError, ownedProject, HttpError } from "@/lib/server-access";
import { readBoundedJson } from "@/lib/http";
import { publicUrl } from "@/lib/seo/public-fetch";
import { googleToken, googleProperties } from "@/lib/google/data";
import { displayEvidence } from "@/lib/seo/display-evidence";

export const runtime = "nodejs";
const schema = z.object({
  id: z.string().max(100).optional(), name: z.string().min(1).max(100),
  websiteUrl: z.url().max(2048), role: z.string().max(100),
  seoLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  businessType: z.enum(["SAAS", "ECOMMERCE", "LOCAL_SERVICE", "PUBLISHER", "AGENCY"]),
  goals: z.array(z.string().min(1).max(300)).min(1).max(10),
  competitors: z.array(z.url().max(2048)).max(3).default([]),
  gscProperty: z.string().max(2048).nullable().optional(), ga4Property: z.string().regex(/^properties\/\d+$/).nullable().optional(),
});
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, name: true } });
      return Response.json({ projects }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const projects = await db.project.findMany({ where: { userId: user.id, id }, orderBy: { createdAt: "desc" },
      include: { competitors: true, audits: { take: 1, orderBy: { createdAt: "desc" }, include: { findings: true } },
        conversations: { take: 30, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, workflow: true, updatedAt: true } },
        artifacts: { take: 20, orderBy: { createdAt: "desc" } } } });
    return Response.json({ projects: projects.map(p => ({ ...p,
      audits: p.audits.map(a => ({...a, canRetry: Date.now() - a.createdAt.getTime() >= 300000, rawEvidence: displayEvidence(a.rawEvidence)})),
      artifacts: p.artifacts.filter(a => a.storageKey === "database:backlinks").slice(0,1).map(a => {
        const metadata = a.metadata as { rows?: unknown[] } | null;
        return {...a, metadata: metadata ? {...metadata, rows: metadata.rows?.slice(0,100)} : null};
      }),
    })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await requireUser(request, true);
    const body = schema.parse(await readBoundedJson(request));
    try { publicUrl(body.websiteUrl); body.competitors.forEach(publicUrl); } catch { throw new HttpError(400, "Utilisez des adresses publiques HTTPS."); }
    const existing = body.id ? await ownedProject(user.id, body.id) : null;
    if (!existing && await db.project.count({ where: { userId: user.id } }) >= 20) throw new HttpError(422, "Limite de 20 projets atteinte.");
    if (body.gscProperty || body.ga4Property) {
      const properties = await googleProperties(await googleToken(user.id, request.headers));
      if (body.gscProperty && !properties.searchConsole.some(p => p.siteUrl === body.gscProperty && p.permissionLevel !== "siteUnverifiedUser")) throw new HttpError(403, "Propriété Search Console non autorisée.");
      if (body.ga4Property && !properties.analytics.some(p => p.name === body.ga4Property)) throw new HttpError(403, "Propriété Analytics non autorisée.");
      if (body.gscProperty) {
        const site = new URL(body.websiteUrl);
        const gsc = body.gscProperty;
        const matches = gsc.startsWith("sc-domain:")
          ? site.hostname === gsc.slice(10) || site.hostname.endsWith("." + gsc.slice(10))
          : site.href.startsWith(gsc) && site.origin === new URL(gsc).origin;
        if (!matches) throw new HttpError(400, "La propriété Search Console doit correspondre au site du projet.");
      }
    }
    const { id, competitors, ...data } = body;
    const competitorData = [...new Set(competitors)].map(domain => ({ domain, source: "USER", selected: true }));
    const project = id ? await db.project.update({ where: { id }, data: { ...data, competitors: { deleteMany: {}, create: competitorData } } })
      : await db.project.create({ data: { ...data, userId: user.id, competitors: { create: competitorData } } });
    return Response.json({ project });
  } catch (error) { return apiError(error); }
}
