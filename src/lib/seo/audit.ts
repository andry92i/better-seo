import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { googleToken, searchAnalytics, analyticsReport } from "@/lib/google/data";
import { ownedProject, HttpError } from "@/lib/server-access";
import { crawlSite, technicalFindings } from "./crawl";
import { performanceReport } from "./performance";
import { knowledgeMetadata } from "@/lib/claude-seo/knowledge";

export async function runAudit(userId: string, projectId: string, headers: Headers) {
  const project = await ownedProject(userId, projectId);
  const audit = await db.$transaction(async tx => {
    const running = await tx.audit.findFirst({ where: { projectId, status: { in: ["CRAWLING", "ANALYZING", "QUEUED"] }, createdAt: { gt: new Date(Date.now() - 300000) } } });
    if (running) throw new HttpError(409, "Un audit est déjà en cours.");
    await tx.audit.updateMany({ where: { projectId, status: { in: ["CRAWLING", "ANALYZING", "QUEUED"] } }, data: { status: "FAILED", completedAt: new Date() } });
    return tx.audit.create({ data: { projectId, status: "CRAWLING", startedAt: new Date() } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  const capture = async <T>(fn: () => Promise<T>) => { try { return { status: "available" as const, data: await fn() }; } catch (e) { return { status: "unavailable" as const, error: e instanceof HttpError ? e.message : "Collecte impossible pour cette source." }; } };
  try {
    const token = googleToken(userId, headers);
    // Ensure a rejected OAuth promise is handled even when no property was selected.
    const tokenResult = token.catch(() => null);
    const [crawl, gsc, ga4, performance, competitors] = await Promise.all([
      capture(() => crawlSite(project.websiteUrl)),
      project.gscProperty ? capture(async () => { const t = await tokenResult; if (!t) throw new HttpError(409, "Reconnectez Google."); return searchAnalytics(t, project.gscProperty!); }) : Promise.resolve({ status: "unconfigured" as const }),
      project.ga4Property ? capture(async () => { const t = await tokenResult; if (!t) throw new HttpError(409, "Reconnectez Google."); return analyticsReport(t, project.ga4Property!); }) : Promise.resolve({ status: "unconfigured" as const }),
      performanceReport(project.websiteUrl),
      Promise.all(project.competitors.filter(c => c.selected).slice(0, 3).map(async c => ({ domain: c.domain, result: await capture(() => crawlSite(c.domain, 1)) }))),
    ]);
    await db.audit.update({ where: { id: audit.id }, data: { status: "ANALYZING" } });
    const findings = crawl.status === "available" ? technicalFindings(crawl.data) : [];
    if (gsc.status === "available") {
      for (const row of gsc.data.rows.filter(r => r.impressions >= 100 && r.position >= 4 && r.position <= 20).sort((a,b) => b.impressions - a.impressions).slice(0, 20)) {
        findings.push({ category: "Opportunité GSC", title: "Optimiser « " + row.keys[0] + " »", description: row.impressions + " impressions, position moyenne " + row.position.toFixed(1) + ". Vérifier l’intention et le contenu avant de modifier la page.", impact: "MEDIUM", confidence: 0.8, effort: 2, evidence: { url: row.keys[1], observed: JSON.stringify(row) } });
      }
    }
    const status = (crawl.status === "available" && crawl.data.pages.length > 0) || gsc.status === "available" || ga4.status === "available" ? "COMPLETE" : "FAILED";
    const evidence = JSON.parse(JSON.stringify({ collectedAt: new Date().toISOString(), methodology: knowledgeMetadata, crawl, gsc, ga4, performance, competitors }));
    await db.audit.update({ where: { id: audit.id }, data: { status, completedAt: new Date(), rawEvidence: evidence, findings: { create: findings } } });
    if (status === "COMPLETE") await db.project.update({ where: { id: projectId }, data: { onboardingDone: true } });
    return { id: audit.id, status, findings: findings.length };
  } catch (error) {
    await db.audit.update({ where: { id: audit.id }, data: { status: "FAILED", completedAt: new Date() } });
    throw error;
  }
}
