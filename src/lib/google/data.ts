import { belongsToProperty } from "./inspection";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/server-access";

export type SearchRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type AnalyticsRow = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };
export type AnalyticsReport = { rows?: AnalyticsRow[]; totals?: AnalyticsRow[]; metadata?: { subjectToThresholding?: boolean; dataLossFromOtherRow?: boolean } };
export async function googleToken(userId: string, headers: Headers) {
  const account = await db.account.findFirst({ where: { userId, providerId: "google" }, select: { id: true } });
  if (!account) throw new HttpError(409, "Connectez votre compte Google dans Intégrations.");
  try {
    const result = await auth.api.getAccessToken({ headers, body: { accountId: account.id } });
    if (!result.accessToken) throw new Error("Missing token");
    return result.accessToken;
  } catch { throw new HttpError(409, "L’autorisation Google a expiré. Reconnectez Google dans Intégrations."); }
}
async function googleJson<T>(url: string, token: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: body ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(25000),
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new HttpError(response.status === 429 ? 429 : 502,
    response.status === 403 ? "Google refuse cet accès. Vérifiez les API activées et les permissions de la propriété." :
    response.status === 429 ? "Quota Google atteint. Réessayez plus tard." : "La source Google est temporairement indisponible.");
  return response.json() as Promise<T>;
}
export async function googleProperties(token: string) {
  const results = await Promise.allSettled([
    googleJson<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>("https://www.googleapis.com/webmasters/v3/sites", token),
    (async () => {
      const properties: { name: string; displayName: string }[] = [];
      let pageToken = "";
      for (let i = 0; i < 20; i++) {
        const data = await googleJson<{ accountSummaries?: { propertySummaries?: { property: string; displayName: string }[] }[]; nextPageToken?: string }>(
          "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : ""), token);
        for (const account of data.accountSummaries ?? []) for (const p of account.propertySummaries ?? []) properties.push({ name: p.property, displayName: p.displayName });
        pageToken = data.nextPageToken ?? "";
        if (!pageToken) return properties;
      }
      throw new HttpError(422, "Trop de propriétés Analytics pour ce compte.");
    })(),
  ]);
  return {
    searchConsole: results[0].status === "fulfilled" ? results[0].value.siteEntry ?? [] : [],
    analytics: results[1].status === "fulfilled" ? results[1].value : [],
    errors: results.flatMap((r, i) => r.status === "rejected" ? [{ source: i === 0 ? "Search Console" : "Analytics", message: r.reason instanceof HttpError ? r.reason.message : "Source indisponible." }] : []),
  };
}
export function periods(now = new Date()) {
  const day = (offset: number) => new Date(now.getTime() - offset * 86400000).toISOString().slice(0, 10);
  return { current: { startDate: day(30), endDate: day(3) }, previous: { startDate: day(58), endDate: day(31) } };
}
export async function searchAnalytics(token: string, property: string) {
  const range = periods();
  const query = async (dates: { startDate: string; endDate: string }, dimensions: string[]) =>
    googleJson<{ rows?: SearchRow[] }>("https://www.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(property) + "/searchAnalytics/query", token,
      { ...dates, dimensions, rowLimit: 25000, type: "web", dataState: "final" });
  const [current, previous, totals, previousTotals, daily] = await Promise.all([
    query(range.current, ["query", "page"]), query(range.previous, ["query", "page"]),
    query(range.current, []), query(range.previous, []), query(range.current, ["date"]),
  ]);
  return { range, rows: current.rows ?? [], previous: previous.rows ?? [], totals: totals.rows?.[0] ?? null,
    previousTotals: previousTotals.rows?.[0] ?? null, daily: (daily.rows ?? []).sort((a,b) => a.keys[0].localeCompare(b.keys[0])),
    coverage: "Top lignes Google, 25 000 maximum par période. Les requêtes anonymisées sont absentes." };
}
export async function analyticsReport(token: string, property: string) {
  if (!/^properties\/\d+$/.test(property)) throw new HttpError(400, "Propriété GA4 invalide.");
  const range = periods();
  const report = await googleJson<AnalyticsReport>("https://analyticsdata.googleapis.com/v1beta/" + property + ":runReport", token, {
    dateRanges: [{...range.current, name: "current"}, {...range.previous, name: "previous"}], dimensions: [{ name: "landingPagePlusQueryString" }],
    metricAggregations: ["TOTAL"],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "engagedSessions" }, { name: "keyEvents" }],
    dimensionFilter: { filter: { fieldName: "sessionDefaultChannelGroup", stringFilter: { matchType: "EXACT", value: "Organic Search" } } },
    limit: "10000",
  });
  return { range, ...report, channel: "Organic Search", limit: 10000 };
}

export async function inspectGoogleUrl(token: string, property: string, url: string) {
  if (!belongsToProperty(url, property)) throw new HttpError(422, "L’URL ne fait pas partie de la propriété Search Console sélectionnée.");
  const result = await googleJson<{ inspectionResult?: Record<string, unknown> }>(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", token,
    { inspectionUrl: url, siteUrl: property, languageCode: "en-US" });
  return { url, property, collectedAt: new Date().toISOString(), scope: "Google indexed version, not a live indexability test", result: result.inspectionResult ?? null };
}
