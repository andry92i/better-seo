import { z } from "zod";

const responseSchema = z.object({
  rows: z.array(z.object({ keys: z.array(z.string()), clicks: z.number(), impressions: z.number(), ctr: z.number(), position: z.number() })).default([]),
});

export async function querySearchConsole(accessToken: string, siteUrl: string, startDate: string, endDate: string) {
  const response = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions: ["query", "page"], rowLimit: 25_000 }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Search Console a répondu ${response.status}`);
  return responseSchema.parse(await response.json());
}
