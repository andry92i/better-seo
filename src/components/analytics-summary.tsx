import type { AnalyticsReport } from "@/lib/google/data";
import { Card } from "./ui/card";
const format = (value: string | undefined) => value == null ? "—" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(Number(value));
export function AnalyticsSummary({ report }: { report?: AnalyticsReport }) {
  const current = report?.totals?.find(row => row.dimensionValues.some(v => v.value === "current"));
  const previous = report?.totals?.find(row => row.dimensionValues.some(v => v.value === "previous"));
  return <Card className="p-6">
    <h2 className="text-lg font-medium">Ce que le trafic organique produit</h2>
    <p className="mt-2 text-sm text-muted-foreground">Google Analytics 4 · Canal Organic Search · Deux périodes de 28 jours</p>
    <dl className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {["Sessions", "Utilisateurs", "Sessions engagées", "Événements clés"].map((label, i) => <div key={label}>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="mt-3 text-3xl font-light tabular-nums">{format(current?.metricValues[i]?.value)}</dd>
        <dd className="mt-2 text-xs text-muted-foreground">Période précédente : {format(previous?.metricValues[i]?.value)}</dd>
      </div>)}
    </dl>
    {!report && <p className="mt-5 text-sm text-muted-foreground">Choisissez une propriété Analytics dans Intégrations, puis relancez l’audit.</p>}
    {report?.metadata?.subjectToThresholding && <p className="mt-5 text-xs text-muted-foreground">Google applique des seuils de confidentialité à ce rapport.</p>}
  </Card>;
}
