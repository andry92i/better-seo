"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "./store";
import type { CrawlEvidence } from "./seo/crawl";
import type { SearchRow, AnalyticsReport } from "./google/data";

type Source<T> = { status: string; data?: T; error?: string };
export type Evidence = {
  collectedAt: string; crawl?: Source<CrawlEvidence>;
  gsc?: Source<{ rows: SearchRow[]; previous: SearchRow[]; totals: SearchRow | null; previousTotals: SearchRow | null; daily: SearchRow[]; range: { current: { startDate: string; endDate: string } }; coverage: string }>;
  ga4?: Source<AnalyticsReport>;
  performance?: { source: string; data: Record<string, unknown> }[];
  competitors?: { domain: string; result: Source<CrawlEvidence> }[];
};
export type ProjectRecord = {
  id: string; name: string; websiteUrl: string; role: string; seoLevel: string; businessType: string; goals: string[];
  gscProperty: string | null; ga4Property: string | null;
  competitors: { domain: string; selected: boolean }[];
  audits: { id: string; canRetry: boolean; status: string; createdAt: string; rawEvidence: Evidence | null; findings: { id: string; category: string; title: string; description: string; impact: string; status: string; evidence: { url?: string; observed?: string } | null }[] }[];
  conversations: { id: string; title: string; workflow: string; updatedAt: string }[];
  artifacts: { id: string; name: string; createdAt: string; storageKey: string; metadata: { headers?: string[]; rows?: string[][]; domainCount?: number; coverage?: string } | null }[];
};
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "La requête a échoué.");
  return body as T;
}
export function useProject() {
  const id = useAppStore(s => s.projectId);
  const list = useQuery({ queryKey: ["projects"], queryFn: () => api<{ projects: Pick<ProjectRecord, "id" | "name">[] }>("/api/projects") });
  const selected = list.data?.projects.find(p => p.id === id) ?? list.data?.projects[0];
  const query = useQuery({ queryKey: ["projects", selected?.id], enabled: Boolean(selected), queryFn: () => api<{ projects: ProjectRecord[] }>("/api/projects?id=" + encodeURIComponent(selected!.id)), refetchInterval: query => query.state.data?.projects.some(p => p.audits.some(a => ["CRAWLING","ANALYZING","QUEUED"].includes(a.status))) ? 5000 : false });
  return { ...query, error: list.error ?? query.error, isPending: list.isPending || (Boolean(selected) && query.isPending), refetch: async () => { await list.refetch(); if (selected) await query.refetch(); }, project: query.data?.projects[0], projects: list.data?.projects ?? [] };
}
