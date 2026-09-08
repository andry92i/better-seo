"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
import { Download, Send } from "lucide-react";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { workflows, selectWorkflow } from "@/lib/claude-seo/workflows";
import type { SeoAgentMessage } from "@/lib/ai/seo-agent";

type Capabilities = { knowledge: { version: string; documents: number; skills: string[]; agents: string[] }; execution: { liveConfigured: boolean } };

export function SeoChat({ action, initialPrompt = "" }: { action: string; initialPrompt?:string }) {
  const profile = useAppStore(state => state.profile);
  const [input, setInput] = useState(initialPrompt);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const { data: capabilities } = useQuery<Capabilities>({
    queryKey: ["seo-capabilities"],
    queryFn: async () => { const response = await fetch("/api/seo/capabilities"); if (!response.ok) throw new Error("Capacités indisponibles"); return response.json(); },
  });
  const transport = useMemo(() => new DefaultChatTransport<SeoAgentMessage>({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages }) => ({
      body: { action, mode, profile, messages: messages
        .filter(message => message.role !== "system")
        .map(message => ({ id: message.id, role: message.role, parts: message.parts.filter(part => part.type === "text").map(part => ({ type: "text", text: part.text })) }))
        .filter(message => message.parts.length > 0) },
    }),
  }), [action, mode, profile]);
  const { messages, sendMessage, status, error, setMessages, stop } = useChat<SeoAgentMessage>({ transport });
  const busy = status === "streaming" || status === "submitted";
  const selected = workflows[selectWorkflow(action, "")];
  const latest = [...messages].reverse().find(message => message.role === "assistant");
  const content = latest?.parts.filter(part => part.type === "text").map(part => part.text).join("\n") ?? "";

  function submit(text: string) {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
    setInput("");
  }

  async function exportResult(format: string) {
    setExportError("");
    setExporting(true);
    try {
      const response = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format, topic: action, content }) });
      if (!response.ok) throw new Error("Export impossible : vérifiez la longueur du résultat.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "better-seo-" + action.replace(/[^a-z0-9-]/gi, "-").slice(0, 60) + "." + format;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setExportError(error instanceof Error ? error.message : "Export impossible."); }
    finally { setExporting(false); }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
      <Card className="flex min-h-[720px] flex-col overflow-hidden">
        <div className="border-b p-5">
          <Badge>{mode === "demo" ? "Grok simulé · aucun appel IA" : "IA réelle · propositions à vérifier"}</Badge>
          <h1 className="mt-3 text-xl font-semibold">{selected.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Instructions Claude SEO disponibles. Aucun audit de votre site exécuté dans cette conversation.</p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={mode === "live"} disabled={busy || !capabilities?.execution.liveConfigured}
              onChange={event => { setMode(event.target.checked ? "live" : "demo"); setMessages([]); }} />
            Activer l’IA réelle (connexion et configuration serveur requises)
          </label>
        </div>
        <Conversation className="min-h-0"><ConversationContent className="p-5">
          {!messages.length && <p className="text-sm text-muted-foreground">Décrivez votre demande. En démo, vous recevrez le plan de collecte correspondant au workflow. En mode réel, l’agent pourra lire les instructions et leurs références.</p>}
          {messages.map(message => <Message key={message.id} from={message.role}>
            <MessageContent className="w-full">
              {message.parts.map((part, index) => {
                if (part.type === "text") return <MessageResponse key={index} isAnimating={busy}>{part.text}</MessageResponse>;
                if (part.type === "tool-readDocument" || part.type === "tool-searchDocuments") return <p key={index} className="my-2 rounded border p-2 text-xs text-muted-foreground">{part.type === "tool-readDocument" ? "Lecture documentaire" : "Recherche documentaire"} · {part.state}</p>;
                return null;
              })}
            </MessageContent>
          </Message>)}
          {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
        </ConversationContent></Conversation>
        <form className="border-t p-4" onSubmit={event => { event.preventDefault(); submit(input); }}>
          <Textarea aria-label="Votre demande SEO" value={input} maxLength={12000} onChange={event => setInput(event.target.value)} placeholder="Votre objectif, une page à rédiger, une question…"/>
          <div className="mt-3 flex justify-end gap-2">
            {busy && <Button type="button" variant="outline" onClick={() => void stop()}>Arrêter</Button>}
            <Button disabled={busy || !input.trim()}><Send className="size-4"/> Envoyer</Button>
          </div>
        </form>
      </Card>
      <aside className="space-y-4">
        <Card className="p-5">
          <h2 className="font-semibold">Contexte déclaré</h2>
          <p className="mt-3 break-all text-sm">{profile.websiteUrl || "Site non renseigné"}</p>
          <p className="mt-2 text-sm">{profile.businessType} · {profile.seoLevel}</p>
          <p className="mt-2 text-sm">{profile.goals.join(", ") || "Objectifs à préciser"}</p>
          <p className="mt-3 text-xs text-muted-foreground">GSC, GA4, crawl et SERP : aucune donnée collectée ici. Les concurrents renseignés ne sont pas vérifiés.</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Base Claude SEO</h2>
          {capabilities ? <p className="mt-3 text-sm">v{capabilities.knowledge.version} · {capabilities.knowledge.documents} documents · {capabilities.knowledge.skills.length} skills · {capabilities.knowledge.agents.length} descriptions de spécialistes.</p> : <p className="mt-3 text-sm">Chargement des capacités…</p>}
          <nav className="mt-3 grid gap-2" aria-label="Workflows SEO">{Object.entries(workflows).map(([id, item]) => <a key={id} href={"/workspace/" + id} className="text-sm text-primary underline">{item.title}</a>)}</nav>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Exporter la dernière réponse</h2>
          <p className="mt-2 text-xs text-muted-foreground">Contenu exact du message, pas un rapport prédéfini. Excel conserve le texte ligne par ligne.</p>
          <div className="mt-3 grid gap-2">{["md", "docx", "xlsx"].map(format => <Button type="button" key={format} variant="outline" disabled={!content || busy || exporting} onClick={() => void exportResult(format)}><Download className="size-4"/>{format.toUpperCase()}</Button>)}</div>
          {exportError && <p role="alert" className="mt-2 text-sm text-red-700">{exportError}</p>}
        </Card>
      </aside>
    </div>
  );
}
