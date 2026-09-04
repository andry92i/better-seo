"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Check, ChevronLeft, ChevronRight, Globe2, LoaderCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { competitors } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { BusinessType, SeoLevel } from "@/lib/types";

const roles = ["Fondateur / dirigeant", "Développeur", "Responsable marketing", "Consultant SEO", "Créateur de contenu"];
const levels: SeoLevel[] = ["Débutant", "Intermédiaire", "Avancé", "Expert"];
const businesses: BusinessType[] = ["SaaS", "E-commerce", "Service local", "Média / Blog", "Agence"];
const goals = ["Augmenter le trafic organique", "Trouver les meilleures opportunités", "Dépasser mes concurrents", "Créer du contenu qui se classe", "Corriger les problèmes techniques", "Être visible dans les réponses IA"];
const scanSteps = ["Exploration technique du site", "Analyse des signaux on-page", "Croisement Search Console & Analytics", "Détection des concurrents", "Priorisation des opportunités"];

function Choice({ selected, children, onClick }: { selected: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent/40", selected && "border-primary bg-primary/8 text-primary ring-1 ring-primary/20")}><span>{children}</span>{selected ? <Check className="size-4" /> : null}</button>;
}

export function OnboardingWizard() {
  const router = useRouter();
  const { profile, updateProfile, completeAudit } = useAppStore();
  const [step, setStep] = useState(0);
  const [scanIndex, setScanIndex] = useState(0);
  const total = 7;
  const validUrl = useMemo(() => { try { return Boolean(new URL(profile.websiteUrl).hostname.includes(".")); } catch { return false; } }, [profile.websiteUrl]);

  function next() {
    if (step === 5) {
      setStep(6);
      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        setScanIndex(index);
        if (index >= scanSteps.length) {
          window.clearInterval(timer);
          completeAudit();
          window.setTimeout(() => router.push("/dashboard"), 700);
        }
      }, 650);
      return;
    }
    setStep((value) => Math.min(total - 1, value + 1));
  }

  const canContinue = [Boolean(profile.role), Boolean(profile.seoLevel), Boolean(profile.businessType), profile.goals.length > 0, validUrl, true, false][step];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_32%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Brand /><Badge variant="outline">Configuration guidée</Badge></header>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-6 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:pt-14">
        <div className="hidden lg:block">
          <Badge><Sparkles className="size-3" /> Claude SEO inside</Badge>
          <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.035em]">Votre stratégie SEO commence par votre contexte.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">Better SEO adapte chaque audit, recommandation et livrable à votre niveau, votre activité et vos vraies données.</p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" /> Accès Google en lecture seule</div>
            <div className="flex items-center gap-3"><Search className="size-5 text-primary" /> Audit multi-agent fondé sur des preuves</div>
            <div className="flex items-center gap-3"><BarChart3 className="size-5 text-primary" /> Actions classées par impact et effort</div>
          </div>
        </div>

        <Card className="overflow-hidden shadow-xl shadow-black/5">
          <div className="border-b px-6 py-5"><div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>Étape {Math.min(step + 1, 6)} sur 6</span><span>{Math.round((Math.min(step + 1, 6) / 6) * 100)} %</span></div><Progress value={(Math.min(step + 1, 6) / 6) * 100} /></div>
          <CardContent className="min-h-[470px] p-6 sm:p-8">
            {step === 0 ? <Question title="Quel est votre rôle principal ?" text="Nous ajusterons le niveau de détail et le type de recommandations."><div className="grid gap-2 sm:grid-cols-2">{roles.map((role) => <Choice key={role} selected={profile.role === role} onClick={() => updateProfile({ role })}>{role}</Choice>)}</div></Question> : null}
            {step === 1 ? <Question title="Quel est votre niveau en SEO ?" text="Vous pourrez modifier ce choix dans les préférences."><div className="grid gap-2 sm:grid-cols-2">{levels.map((seoLevel) => <Choice key={seoLevel} selected={profile.seoLevel === seoLevel} onClick={() => updateProfile({ seoLevel })}>{seoLevel}</Choice>)}</div></Question> : null}
            {step === 2 ? <Question title="Quel type de projet développez-vous ?" text="Claude SEO pondère différemment un SaaS, un commerce local ou un média."><div className="grid gap-2 sm:grid-cols-2">{businesses.map((businessType) => <Choice key={businessType} selected={profile.businessType === businessType} onClick={() => updateProfile({ businessType })}>{businessType}</Choice>)}</div></Question> : null}
            {step === 3 ? <Question title="Quels résultats attendez-vous ?" text="Choisissez une ou plusieurs priorités."><div className="grid gap-2 sm:grid-cols-2">{goals.map((goal) => <Choice key={goal} selected={profile.goals.includes(goal)} onClick={() => updateProfile({ goals: profile.goals.includes(goal) ? profile.goals.filter((item) => item !== goal) : [...profile.goals, goal] })}>{goal}</Choice>)}</div></Question> : null}
            {step === 4 ? <Question title="Quel site devons-nous analyser ?" text="Nous vérifierons l’URL avant de lancer l’exploration."><div className="relative"><Globe2 className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-10" value={profile.websiteUrl} onChange={(event) => updateProfile({ websiteUrl: event.target.value })} placeholder="https://votre-site.com" /></div><p className={cn("mt-2 text-xs", validUrl ? "text-primary" : "text-muted-foreground")}>{validUrl ? "URL valide — prête à analyser" : "Saisissez une URL complète et publique."}</p></Question> : null}
            {step === 5 ? <Question title="Connecter vos données Google" text="L’audit est plus précis avec les requêtes, pages, conversions et canaux réels."><button type="button" onClick={() => updateProfile({ googleConnected: !profile.googleConnected })} className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-accent/40", profile.googleConnected && "border-primary bg-primary/8")}><span className="grid size-11 place-items-center rounded-lg bg-white shadow-sm"><span className="text-xl font-bold text-blue-600">G</span></span><span className="flex-1"><span className="block font-medium">Google Search Console + GA4</span><span className="mt-1 block text-sm text-muted-foreground">Lecture seule · Révocable à tout moment</span></span>{profile.googleConnected ? <Badge>Connecté</Badge> : <Badge variant="outline">Mode démo</Badge>}</button><div className="mt-5"><p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Concurrents suggérés</p><div className="space-y-2">{competitors.map((item) => <label key={item.domain} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"><input type="checkbox" checked={profile.competitors.includes(item.domain)} onChange={() => updateProfile({ competitors: profile.competitors.includes(item.domain) ? profile.competitors.filter((value) => value !== item.domain) : [...profile.competitors, item.domain] })} className="accent-[var(--primary)]" /><span className="font-medium">{item.domain}</span><span className="ml-auto text-xs text-muted-foreground">{item.overlap}% similaire</span></label>)}</div></div></Question> : null}
            {step === 6 ? <div className="flex min-h-[400px] flex-col items-center justify-center text-center"><span className="relative grid size-20 place-items-center rounded-full bg-primary/10 text-primary"><LoaderCircle className="size-9 animate-spin" /><span className="absolute inset-0 rounded-full border border-primary/20" /></span><h2 className="mt-6 text-2xl font-semibold tracking-tight">Analyse approfondie en cours</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">15 spécialistes croisent les signaux du site, les opportunités organiques et le contexte concurrentiel.</p><div className="mt-7 w-full max-w-sm space-y-2 text-left">{scanSteps.map((item, index) => <div key={item} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground", index < scanIndex && "text-foreground")}><span className={cn("grid size-5 place-items-center rounded-full border text-[10px]", index < scanIndex && "border-primary bg-primary text-primary-foreground")}>{index < scanIndex ? <Check className="size-3" /> : index + 1}</span>{item}</div>)}</div></div> : null}
          </CardContent>
          {step < 6 ? <div className="flex items-center justify-between border-t px-6 py-4"><Button variant="ghost" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ChevronLeft className="size-4" /> Retour</Button><Button disabled={!canContinue} onClick={next}>{step === 5 ? "Lancer l’audit" : "Continuer"}<ChevronRight className="size-4" /></Button></div> : null}
        </Card>
      </section>
    </main>
  );
}

function Question({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mb-7 mt-2 text-sm leading-6 text-muted-foreground">{text}</p>{children}</div>;
}
