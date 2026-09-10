import { useLocale, useTranslations } from "next-intl";
import type { AnalyticsReport } from "@/lib/google/data";
import { Card } from "./ui/card";

export function AnalyticsSummary({ report }: { report?: AnalyticsReport }) {
const t = useTranslations("ui");
const locale = useLocale();
const format = (value: string | undefined) => value == null ? "—" : new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Number(value));

  const current = report?.totals?.find(row => row.dimensionValues.some(v => v.value === "current"));
  const previous = report?.totals?.find(row => row.dimensionValues.some(v => v.value === "previous"));
  return <Card className="p-6">
    <h2 className="text-lg font-medium">{t("what_organic_traffic_delivers_a8368e")}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{t("google_analytics_4__organic_3d17e8")}</p>
    <dl className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {["Sessions", t("users_c661b3"), t("engaged_sessions_f7f71e"), t("key_events_7d68a7")].map((label, i) => <div key={label}>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-3 text-3xl font-light tabular-nums">{format(current?.metricValues[i]?.value)}</dd>
        <dd className="mt-2 text-xs text-muted-foreground">{t("previous_period_307727")} {format(previous?.metricValues[i]?.value)}</dd>
      </div>)}
    </dl>
    {!report && <p className="mt-5 text-sm text-muted-foreground">{t("choose_an_analytics_property_in_fcda8f")}</p>}
    {report?.metadata?.subjectToThresholding && <p className="mt-5 text-xs text-muted-foreground">{t("google_applies_privacy_thresholds_to_aada5c")}</p>}
  </Card>;
}

