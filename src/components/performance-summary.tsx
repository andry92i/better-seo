"use client";
import { useLocale } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import type { Evidence } from "@/lib/project-client";

type Metric = { displayValue?: string; score?: number | null; percentiles?: { p75?: number | string } };
export function PerformanceSummary({ reports }: { reports: Evidence["performance"] }) {
  const fr = useLocale() === "fr";
  return <div className="grid gap-4 md:grid-cols-2">{reports?.map(({ source, data }) => {
    const available = data.status === "available";
    const categories = data.categories as Record<string, Metric> | undefined;
    const audits = data.audits as Record<string, Metric> | undefined;
    const record = data.record as { metrics?: Record<string, Metric> } | undefined;
    const rows: [string, string][] = source === "PageSpeed" ? [
      ...Object.entries(categories ?? {}).map(([key, metric]): [string, string] => [key === "performance" ? "Performance" : key === "seo" ? "SEO" : fr ? "Accessibilité" : "Accessibility", metric.score == null ? "—" : `${Math.round(metric.score * 100)} / 100`]),
      ...Object.entries(audits ?? {}).map(([key, metric]): [string, string] => [({ "largest-contentful-paint": "LCP", "cumulative-layout-shift": "CLS", "total-blocking-time": "TBT", "speed-index": "Speed Index" })[key] ?? key, metric.displayValue ?? "—"]),
    ] : Object.entries(record?.metrics ?? {}).flatMap(([key, metric]): [string, string][] => {
      const value = metric.percentiles?.p75;
      if (value == null) return [];
      const unit = key.includes("layout_shift") ? "" : key.includes("paint") || key.includes("interaction") || key.includes("byte") ? " ms" : "";
      return [[key.replaceAll("_", " "), String(value) + unit]];
    });
    return <Card key={source}><CardHeader><CardTitle>{source}</CardTitle><CardDescription>{source === "PageSpeed" ? (fr ? "Test Lighthouse sur mobile · données de laboratoire" : "Mobile Lighthouse test · lab data") : (fr ? "Expérience des visiteurs · origine entière · 75e percentile" : "Real visitor experience · entire origin · 75th percentile")}</CardDescription></CardHeader><CardContent>{available && rows.length ? <dl className="flex flex-col gap-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 text-sm"><dt className="capitalize text-muted-foreground">{label}</dt><dd className="shrink-0 font-medium tabular-nums">{value}</dd></div>)}</dl> : <p className="text-sm text-muted-foreground">{data.status === "insufficient_traffic" ? (fr ? "Trafic insuffisant pour publier des mesures CrUX." : "Not enough traffic to publish CrUX measurements.") : data.status === "unconfigured" ? (fr ? "Cette source n’est pas encore configurée." : "This source has not been configured yet.") : (fr ? "Aucune mesure disponible pour cet audit." : "No measurements available for this audit.")}</p>}</CardContent></Card>;
  })}</div>;
}
