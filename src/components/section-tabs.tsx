"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
const groups = [
  [["keywords", "Keywords", "Mots-clés"], ["competitors", "Competitors", "Concurrents"], ["backlinks", "Backlinks", "Backlinks"]],
  [["audit", "Technical audit", "Audit technique"], ["local", "Local presence", "Présence locale"]],
  [["content", "Create content", "Créer un contenu"], ["reports", "Saved reports", "Rapports enregistrés"]],
  [["integrations", "Connections", "Connexions"], ["settings", "Project settings", "Paramètres du projet"]],
];
export function SectionTabs({ section }: { section: string }) {
  const locale = useLocale(), router = useRouter();
  const group = groups.find(items=>items.some(([id])=>id===section));
  if (!group) return null;
  return <Tabs value={section} onValueChange={value=>router.push(`/dashboard/${value}`)} className="min-w-0"><div className="max-w-full overflow-x-auto border-b pb-1"><TabsList variant="line" aria-label={locale==="fr"?"Pages associées":"Related pages"}>{group.map(([id,en,fr])=><TabsTrigger key={id} value={id} className="px-4">{locale==="fr"?fr:en}</TabsTrigger>)}</TabsList></div></Tabs>;
}
