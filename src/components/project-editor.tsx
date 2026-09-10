"use client";
import { useCopy } from "@/i18n/copy";
import { useTranslations } from "next-intl";
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
const t = useTranslations("ui");
const copy = useCopy();

  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [form, setForm] = useState({ name: project?.name ?? "", websiteUrl: project?.websiteUrl ?? "", role: project?.role ?? t("founder_69d237"), seoLevel: project?.seoLevel ?? "BEGINNER", businessType: project?.businessType ?? "SAAS", goals: project?.goals.join("\n") ?? "", competitors: project?.competitors.map(c => c.domain).join("\n") ?? "", gscProperty: project?.gscProperty ?? "", ga4Property: project?.ga4Property ?? "" });
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
      setNotice(t("project_saved_9350d9"));
      select(result.project.id); await cache.invalidateQueries({ queryKey: ["projects"] });
      if (onboarding) {
        const resultAudit = await api<{ status: string }>("/api/projects/" + result.project.id + "/audit", { method: "POST" });
        await cache.invalidateQueries({ queryKey: ["projects"] });
        if (resultAudit.status === "FAILED") { setError(t("your_project_was_saved_but_6dec3c")); return; }
        router.push("/dashboard");
      }
    } catch (e) { setError(e instanceof Error ? e.message : t("unable_to_save_206044")); }
    finally { setBusy(false); }
  }
  function field(key: keyof typeof form, label: string, placeholder = "") {
    return <label className="grid gap-2 text-sm font-medium">{label}<Input value={form[key]} required={["name","websiteUrl"].includes(key)} placeholder={placeholder} onChange={e => set(key,e.target.value)} /></label>;
  }
  function selectField(key: keyof typeof form, label: string, options: [string,string][]) {
    return <label className="grid gap-2 text-sm font-medium">{label}<select className="form-select" value={form[key]} onChange={e => set(key,e.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>;
  }
  return <Card className="mx-auto max-w-3xl p-6 sm:p-10">
    {onboarding && <ol className="mb-10 grid grid-cols-3 gap-3 border-b pb-6 text-xs sm:text-sm">{[t("your_business_edfc7a"),t("your_website_78b04e"),t("your_sources_7a0e84")].map((label,i) => <li key={label} aria-current={i === step ? "step" : undefined} className={i === step ? "font-semibold text-primary" : "text-muted-foreground"}>{i < step ? <Check className="inline size-4"/> : i+1} · {label}</li>)}</ol>}
    <form onSubmit={e => { e.preventDefault(); if (onboarding && step < 2) setStep(step+1); else void save(); }} className="space-y-6">
      {(!onboarding || step===0) && <><div><h2 className="text-2xl">{t("a_strategy_that_fits_your_76ba08")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("these_details_shape_your_recommendations_8e626b")}</p></div><div className="grid gap-5 sm:grid-cols-2">{field("role",t("your_role_f27bb6"))}{selectField("seoLevel",t("your_seo_level_5b9f3c"),[["BEGINNER",t("beginner_8ead10")],["INTERMEDIATE",t("intermediate_614ecb")],["ADVANCED",t("advanced_3ddcc5")],["EXPERT",t("expert_d7a501")]])}{selectField("businessType",t("your_business_edfc7a"),[["SAAS",t("software__saas_1a841a")],["ECOMMERCE",t("ecommerce_c991b7")],["LOCAL_SERVICE",t("local_service_eda23f")],["PUBLISHER",t("publisher__blog_671178")],["AGENCY",t("agency_37c580")]])}</div><label className="grid gap-2 text-sm">{t("your_goals_industry_and_audience_163b7f")}<textarea required className="form-select min-h-28" value={form.goals} onChange={e=>set("goals",e.target.value)} placeholder={t("eg_generate_quote_requests_for_a3704d")}/></label></>}
      {(!onboarding || step===1) && <><h2 className="text-2xl">{t("the_website_you_want_to_26c6fe")}</h2>{field("name",t("project_name_12dd0c"),t("my_business_e950c2"))}{field("websiteUrl",t("website_https_url_f764df"),t("httpsyoursitecom_d4684d"))}<label className="grid gap-2 text-sm">{t("competitors_to_compare_optional_up_88fbd1")}<textarea className="form-select min-h-24" value={form.competitors} onChange={e=>set("competitors",e.target.value)} placeholder={t("one_https_url_per_line_208608")}/></label><p className="text-xs text-muted-foreground">{t("their_public_pages_will_be_c6dcb6")}</p></>}
      {(!onboarding || step===2) && <><h2 className="text-2xl">{t("connect_your_google_data_f7266a")}</h2><p className="text-sm text-muted-foreground">{t("authorize_readonly_access_to_search_fe7322")}</p><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={async()=>{setError("");try{const session=await authClient.getSession();try{sessionStorage.setItem("better-seo-google-draft",JSON.stringify({userId:session.data?.user.id,projectId:project?.id,form,createdAt:Date.now()}));}catch{}const r=await authClient.linkSocial({provider:"google",callbackURL:project?"/dashboard/integrations":"/onboarding",scopes:["https://www.googleapis.com/auth/webmasters.readonly","https://www.googleapis.com/auth/analytics.readonly"]});if(r.error)setError(r.error.message??t("unable_to_connect_to_google_544609"));}catch{setError(t("unable_to_connect_to_google_544609"));}}}><Link2 className="size-4"/>{t("authorize_google_41ba01")}</Button><Button type="button" variant="outline" onClick={()=>{setDiscover(true); if(discover)void properties.refetch();}}>{t("load_my_properties_b1b812")}</Button></div>{properties.isFetching&&<p role="status" className="text-sm">{t("loading_your_properties_003aba")}</p>}{properties.error&&<p role="alert" className="text-sm text-destructive">{properties.error.message}</p>}{properties.data?.errors.map(e=><p key={e.source} className="text-sm text-destructive">{e.source} : {copy(e.message)}</p>)}{selectField("gscProperty",t("search_console_property_8af500"),[["",t("connect_later_a527a1")],...(properties.data?.searchConsole.filter(p=>p.permissionLevel!=="siteUnverifiedUser").map(p=>[p.siteUrl,p.siteUrl] as [string,string])??(form.gscProperty?[[form.gscProperty,form.gscProperty] as [string,string]]:[]))])}{selectField("ga4Property",t("ga4_property_f341a6"),[["",t("connect_later_a527a1")],...(properties.data?.analytics.map(p=>[p.name,p.displayName+" · "+p.name] as [string,string])??(form.ga4Property?[[form.ga4Property,form.ga4Property] as [string,string]]:[]))])}<p className="text-xs text-muted-foreground">{t("the_crawl_covers_up_to_cc1e97")}</p></>}
      {notice&&<p role="status" className="text-sm text-primary">{notice}</p>}
      {error&&<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">{onboarding&&step>0?<Button type="button" variant="outline" disabled={busy} onClick={()=>setStep(step-1)}>{t("back_e5befb")}</Button>:<span/>}<Button disabled={busy}>{busy?(onboarding?t("collecting_and_saving_2e0bae"):t("saving_e7d5f2")):onboarding?(step<2?t("continue_129fff"):t("save_and_run_audit_14254e")):t("save_changes_2a9459")}<ArrowRight className="size-4"/></Button></div>
    </form>
  </Card>;
}

