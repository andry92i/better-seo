"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { api, type ProjectRecord } from "@/lib/project-client";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, Link2 } from "lucide-react";
const authClient = createAuthClient();
type Properties = { searchConsole: { siteUrl: string; permissionLevel: string }[]; analytics: { name: string; displayName: string }[]; errors: { source: string; message: string }[] };
export function ProjectEditor({ project, onboarding = false }: { project?: ProjectRecord; onboarding?: boolean }) {
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [form, setForm] = useState({ name: project?.name ?? "", websiteUrl: project?.websiteUrl ?? "", role: project?.role ?? "Fondateur", seoLevel: project?.seoLevel ?? "BEGINNER", businessType: project?.businessType ?? "SAAS", goals: project?.goals.join("\n") ?? "", competitors: project?.competitors.map(c => c.domain).join("\n") ?? "", gscProperty: project?.gscProperty ?? "", ga4Property: project?.ga4Property ?? "" });
  const [discover, setDiscover] = useState(false);
  const [savedId, setSavedId] = useState(project?.id);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let cancelled = false;
    void authClient.getSession().then(({data}) => {
      if (cancelled) return;
      try {
        const raw = sessionStorage.getItem("better-seo-google-draft");
        if (!raw) return;
        const draft = JSON.parse(raw);
        sessionStorage.removeItem("better-seo-google-draft");
        if (!cancelled && draft.userId === data?.user.id && draft.projectId === project?.id && Date.now() - draft.createdAt < 1800000) {
          setForm(draft.form); setStep(2); setDiscover(true);
        }
      } catch { /* Storage may be disabled by the browser. */ }
    });
    return () => { cancelled = true; };
  }, [project?.id]);
  const properties = useQuery({ queryKey: ["google-properties"], enabled: discover, retry: false, queryFn: () => api<Properties>("/api/google/properties") });
  const router = useRouter(), cache = useQueryClient(), select = useAppStore(s => s.selectProject);
  const set = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));
  async function save() {
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await api<{ project: { id: string } }>("/api/projects", { method: "POST", body: JSON.stringify({ ...form, id: savedId, goals: form.goals.split("\n").map(s => s.trim()).filter(Boolean), competitors: form.competitors.split("\n").map(s => s.trim()).filter(Boolean), gscProperty: form.gscProperty || null, ga4Property: form.ga4Property || null }) });
      setSavedId(result.project.id);
      setNotice("Projet enregistré.");
      select(result.project.id); await cache.invalidateQueries({ queryKey: ["projects"] });
      if (onboarding) {
        const resultAudit = await api<{ status: string }>("/api/projects/" + result.project.id + "/audit", { method: "POST" });
        await cache.invalidateQueries({ queryKey: ["projects"] });
        if (resultAudit.status === "FAILED") { setError("Le projet est enregistré, mais la collecte a échoué. Vérifiez le site et les accès Google dans le tableau de bord."); return; }
        router.push("/dashboard");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  }
  function field(key: keyof typeof form, label: string, placeholder = "") {
    return <label className="grid gap-2 text-sm font-medium">{label}<Input value={form[key]} required={["name","websiteUrl"].includes(key)} placeholder={placeholder} onChange={e => set(key,e.target.value)} /></label>;
  }
  function selectField(key: keyof typeof form, label: string, options: [string,string][]) {
    return <label className="grid gap-2 text-sm font-medium">{label}<select className="form-select" value={form[key]} onChange={e => set(key,e.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>;
  }
  return <Card className="mx-auto max-w-3xl p-6 sm:p-10">
    {onboarding && <ol className="mb-10 flex gap-5 text-sm">{["Votre activité","Votre site","Vos sources"].map((label,i) => <li key={label} className={i === step ? "font-semibold text-primary" : "text-muted-foreground"}>{i < step ? <Check className="inline size-4"/> : i+1} · {label}</li>)}</ol>}
    <form onSubmit={e => { e.preventDefault(); if (onboarding && step < 2) setStep(step+1); else void save(); }} className="space-y-6">
      {(!onboarding || step===0) && <><div><h2 className="text-2xl">Une stratégie adaptée à votre activité.</h2><p className="mt-2 text-sm text-muted-foreground">Ces informations guideront les recommandations et le niveau d’explication.</p></div><div className="grid gap-5 sm:grid-cols-2">{field("role","Votre rôle")}{selectField("seoLevel","Votre niveau SEO",[["BEGINNER","Débutant"],["INTERMEDIATE","Intermédiaire"],["ADVANCED","Avancé"],["EXPERT","Expert"]])}{selectField("businessType","Votre activité",[["SAAS","Logiciel / SaaS"],["ECOMMERCE","E-commerce"],["LOCAL_SERVICE","Service local"],["PUBLISHER","Média / Blog"],["AGENCY","Agence"]])}</div><label className="grid gap-2 text-sm">Vos objectifs, votre secteur et votre audience<textarea required className="form-select min-h-28" value={form.goals} onChange={e=>set("goals",e.target.value)} placeholder="Ex. Générer des demandes de devis pour mon agence web à Antananarivo. Un objectif par ligne."/></label></>}
      {(!onboarding || step===1) && <><h2 className="text-2xl">Le site à faire progresser.</h2>{field("name","Nom du projet","Mon entreprise")}{field("websiteUrl","URL HTTPS du site","https://votre-site.com")}<label className="grid gap-2 text-sm">Concurrents à comparer (facultatif, 3 maximum)<textarea className="form-select min-h-24" value={form.competitors} onChange={e=>set("competitors",e.target.value)} placeholder="Une URL HTTPS par ligne"/></label><p className="text-xs text-muted-foreground">Leurs pages publiques seront analysées. Vous pourrez compléter cette liste après le premier audit.</p></>}
      {(!onboarding || step===2) && <><h2 className="text-2xl">Reliez vos données Google.</h2><p className="text-sm text-muted-foreground">Autorisez la lecture de Search Console et Analytics, puis choisissez les propriétés du projet.</p><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={async()=>{setError("");try{const session=await authClient.getSession();try{sessionStorage.setItem("better-seo-google-draft",JSON.stringify({userId:session.data?.user.id,projectId:project?.id,form,createdAt:Date.now()}));}catch{}const r=await authClient.linkSocial({provider:"google",callbackURL:project?"/dashboard/integrations":"/onboarding",scopes:["https://www.googleapis.com/auth/webmasters.readonly","https://www.googleapis.com/auth/analytics.readonly"]});if(r.error)setError(r.error.message??"Connexion Google impossible.");}catch{setError("Connexion Google impossible.");}}}><Link2 className="size-4"/>Autoriser Google</Button><Button type="button" variant="outline" onClick={()=>{setDiscover(true); if(discover)void properties.refetch();}}>Charger mes propriétés</Button></div>{properties.isFetching&&<p role="status" className="text-sm">Lecture de vos propriétés…</p>}{properties.error&&<p role="alert" className="text-sm text-destructive">{properties.error.message}</p>}{properties.data?.errors.map(e=><p key={e.source} className="text-sm text-destructive">{e.source} : {e.message}</p>)}{selectField("gscProperty","Propriété Search Console",[["","À connecter plus tard"],...(properties.data?.searchConsole.filter(p=>p.permissionLevel!=="siteUnverifiedUser").map(p=>[p.siteUrl,p.siteUrl] as [string,string])??(form.gscProperty?[[form.gscProperty,form.gscProperty] as [string,string]]:[]))])}{selectField("ga4Property","Propriété GA4",[["","À connecter plus tard"],...(properties.data?.analytics.map(p=>[p.name,p.displayName+" · "+p.name] as [string,string])??(form.ga4Property?[[form.ga4Property,form.ga4Property] as [string,string]]:[]))])}<p className="text-xs text-muted-foreground">Le crawl couvre jusqu’à 16 pages HTML. L’audit peut prendre quelques minutes ; les sources Google non connectées resteront indiquées comme absentes.</p></>}
      {notice&&<p role="status" className="text-sm text-primary">{notice}</p>}
      {error&&<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex justify-between gap-3">{onboarding&&step>0?<Button type="button" variant="outline" disabled={busy} onClick={()=>setStep(step-1)}>Retour</Button>:<span/>}<Button disabled={busy}>{busy?(onboarding?"Collecte et enregistrement en cours…":"Enregistrement…"):onboarding?(step<2?"Continuer":"Enregistrer et lancer l’audit"):"Enregistrer les modifications"}<ArrowRight className="size-4"/></Button></div>
    </form>
  </Card>;
}
