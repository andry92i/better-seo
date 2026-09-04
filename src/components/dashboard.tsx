import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarClock, CircleAlert, Clock3, MousePointerClick, Search, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auditScores, findings, recommendations } from "@/lib/mock-data";

const metrics = [
  { label: "Clics organiques", value: "12 840", delta: "+18,6 %", icon: MousePointerClick },
  { label: "Impressions", value: "428 k", delta: "+24,1 %", icon: Search },
  { label: "Position moyenne", value: "14,2", delta: "+2,8 places", icon: TrendingUp },
  { label: "Opportunités", value: "42", delta: "14 urgentes", icon: Sparkles },
];

export function Dashboard() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Badge><Sparkles className="size-3" /> Analyse Claude SEO</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Bonjour Andry, voici où agir.</h1><p className="mt-1.5 text-sm text-muted-foreground">Les données des 28 derniers jours ont été analysées et priorisées.</p></div><Button variant="outline"><CalendarClock className="size-4" /> 28 derniers jours</Button></div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label}><CardContent className="p-5"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-secondary"><metric.icon className="size-4" /></span><span className="text-xs font-medium text-primary">{metric.delta}</span></div><p className="mt-5 text-2xl font-semibold tracking-tight">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.label}</p></CardContent></Card>)}</div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
        <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle>Score de santé SEO</CardTitle><CardDescription>Heuristique de priorisation, pas un score Google</CardDescription></div><div className="text-right"><span className="text-4xl font-semibold tracking-tighter">68</span><span className="text-sm text-muted-foreground">/100</span></div></CardHeader><CardContent><div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{auditScores.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between text-xs"><span>{item.label}</span><span className="font-mono font-medium">{item.score}</span></div><Progress value={item.score} /></div>)}</div><div className="mt-6 flex items-center gap-3 rounded-xl bg-amber-500/8 p-3 text-sm"><CircleAlert className="size-5 shrink-0 text-amber-600" /><p><span className="font-medium">Levier principal :</span> votre autorité reste inférieure à celle des concurrents directs.</p></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Trafic organique</CardTitle><CardDescription>Clics Google Search · 12 semaines</CardDescription></CardHeader><CardContent><div className="relative h-48 overflow-hidden rounded-lg bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:25%_25%]"><svg viewBox="0 0 600 180" className="absolute inset-0 h-full w-full" aria-label="Trafic organique en hausse"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity=".28"/><stop offset="1" stopColor="var(--primary)" stopOpacity="0"/></linearGradient></defs><path d="M0 154 C70 148 90 125 145 132 S225 96 280 108 S355 76 408 78 S485 44 600 28 L600 180 L0 180Z" fill="url(#area)"/><path d="M0 154 C70 148 90 125 145 132 S225 96 280 108 S355 76 408 78 S485 44 600 28" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/></svg></div><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>12 juin</span><span>4 septembre</span></div></CardContent></Card>
      </div>

      <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Meilleures actions maintenant</h2><p className="mt-1 text-sm text-muted-foreground">Calculées selon impact, confiance, effort et vos objectifs.</p></div><Button variant="ghost" className="hidden sm:flex">Tout afficher <ArrowRight className="size-4" /></Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{recommendations.map((item, index) => <Link href={`/workspace/${item.slug}`} key={item.slug} className="group"><Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><CardHeader><div className="flex items-center justify-between"><Badge variant={index === 0 ? "default" : "secondary"}>{item.badge}</Badge><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div><CardTitle className="mt-3 text-base">{item.title}</CardTitle><CardDescription className="leading-5">{item.description}</CardDescription></CardHeader><CardContent className="flex items-center justify-between text-xs"><span className="font-medium text-primary">{item.impact}</span><span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="size-3" /> {item.time}</span></CardContent></Card></Link>)}</div></section>

      <Card><CardHeader><CardTitle>Problèmes prioritaires</CardTitle><CardDescription>Chaque constat reste relié à une preuve et à une action.</CardDescription></CardHeader><CardContent className="p-0"><div className="divide-y">{findings.map((finding) => <div key={finding.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{finding.title}</p><Badge variant={finding.impact === "Critique" ? "danger" : finding.impact === "Élevé" ? "warning" : "secondary"}>{finding.impact}</Badge></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{finding.detail}</p></div><span className="text-xs text-muted-foreground">{finding.category}</span><span className="text-xs font-medium">{finding.effort}</span></div>)}</div></CardContent></Card>
    </div>
  );
}
