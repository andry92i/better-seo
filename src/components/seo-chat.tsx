"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, CheckCircle2, Download, FileSpreadsheet, FileText, Send, Sparkles } from "lucide-react";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { recommendations } from "@/lib/mock-data";

const prompts: Record<string, string[]> = {
  "quick-wins": ["Classe les opportunités par impact", "Montre-moi les pages concernées", "Crée les nouveaux titres et descriptions"],
  "keyword-research": ["Crée les clusters complets", "Trouve les intentions commerciales", "Détecte la cannibalisation"],
  "competitor-gap": ["Compare notre architecture", "Trouve les contenus manquants", "Analyse leur stratégie de liens"],
  "rewrite-landing": ["Rédige la landing complète", "Adapte-la à des fondateurs SaaS", "Ajoute métadonnées et schema"],
  default: ["Donne-moi le plan d’action", "Explique les preuves", "Transforme cela en tâches"],
};

export function SeoChat({ action }: { action: string }) {
  const recommendation = recommendations.find((item) => item.slug === action) ?? { title: "Assistant SEO", description: "Analysez votre projet avec votre équipe SEO IA.", badge: "Assistant", impact: "", time: "" };
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { action } }), [action]);
  const { messages, sendMessage, status, error } = useChat({ transport });
  const suggestions = prompts[action] ?? prompts.default;

  function submit(text: string) {
    const value = text.trim();
    if (!value || status === "streaming" || status === "submitted") return;
    sendMessage({ text: value });
    setInput("");
  }

  const introduction = `## Voici votre point de départ\n\n${recommendation.description}\n\nJ’ai croisé les signaux techniques, le contenu, les données de performance simulées et les écarts concurrentiels. **Chaque recommandation sera accompagnée de sa preuve, de son impact et de l’effort estimé.**\n\nQue souhaitez-vous approfondir en premier ?`;

  return (
    <div className="grid min-h-[calc(100vh-7.5rem)] gap-5 xl:grid-cols-[1fr_310px]">
      <Card className="flex min-h-[720px] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4"><div><div className="flex items-center gap-2"><Badge>{recommendation.badge}</Badge><Badge variant="outline">Grok 4.6 · simulation</Badge></div><h1 className="mt-2 text-lg font-semibold">{recommendation.title}</h1></div><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bot className="size-5" /></span></div>
        <Conversation className="min-h-0"><ConversationContent className="p-5 sm:p-7">
          <Message from="assistant"><MessageContent className="w-full"><div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary"><Sparkles className="size-3.5" /> Analyse terminée</div><MessageResponse>{introduction}</MessageResponse></MessageContent></Message>
          {messages.map((message) => <Message key={message.id} from={message.role} className={message.role === "user" ? "user" : ""}><MessageContent className={message.role === "user" ? "rounded-xl bg-secondary px-4 py-3" : "w-full"}>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={`${message.id}-${index}`} isAnimating={status === "streaming"}>{part.text}</MessageResponse> : null)}</MessageContent></Message>)}
          {error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{error.message}</p> : null}
        </ConversationContent></Conversation>
        <div className="border-t bg-background p-4"><div className="mb-3 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => submit(suggestion)} className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); submit(input); }} className="relative"><Textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(input); } }} placeholder="Demandez une stratégie, un contenu ou une analyse…" className="min-h-24 pr-14" /><Button type="submit" size="icon" className="absolute bottom-3 right-3" disabled={!input.trim() || status === "streaming" || status === "submitted"} aria-label="Envoyer"><Send className="size-4" /></Button></form><p className="mt-2 text-center text-[11px] text-muted-foreground">Mode démo : les résultats illustrent le parcours sans appeler une API payante.</p></div>
      </Card>

      <aside className="space-y-4"><Card className="p-5"><h2 className="text-sm font-semibold">Contexte utilisé</h2><div className="mt-4 space-y-3 text-xs"><ContextRow label="Site" value="viralgrok.com" /><ContextRow label="Période" value="28 jours" /><ContextRow label="Requêtes" value="1 284" /><ContextRow label="Pages" value="96" /><ContextRow label="Concurrents" value="3" /></div></Card><Card className="p-5"><h2 className="text-sm font-semibold">Exporter le résultat</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Téléchargez un livrable prêt à partager ou modifier.</p><div className="mt-4 space-y-2"><ExportButton action={action} format="md" label="Markdown" icon={<FileText className="size-4" />} /><ExportButton action={action} format="docx" label="Document Word" icon={<FileText className="size-4" />} /><ExportButton action={action} format="xlsx" label="Feuille Excel" icon={<FileSpreadsheet className="size-4" />} /></div></Card><Card className="p-5"><h2 className="text-sm font-semibold">Qualité du résultat</h2><div className="mt-4 space-y-3 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Fondé sur les données</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Intentions vérifiées</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Contenu humanisé</p></div></Card></aside>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="font-mono font-medium">{value}</span></div>; }
function ExportButton({ action, format, label, icon }: { action: string; format: string; label: string; icon: React.ReactNode }) { return <a href={`/api/export?format=${format}&topic=${encodeURIComponent(action)}`} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors hover:bg-accent">{icon}{label}<Download className="ml-auto size-3.5 text-muted-foreground" /></a>; }
