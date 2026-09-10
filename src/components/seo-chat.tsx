"use client";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Send, Square, FileText } from "lucide-react";
import Link from "next/link";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { workflows, selectWorkflow } from "@/lib/claude-seo/workflows";
import { useProject, api, type ProjectRecord } from "@/lib/project-client";
import type { SeoAgentMessage } from "@/lib/ai/seo-agent";

export function SeoChat({action,initialPrompt="",conversationId}:{action:string;initialPrompt?:string;conversationId?:string}) {
  const {project,error,isPending}=useProject();
  if(isPending)return <p role="status">Chargement du projet…</p>;
  if(error)return <p role="alert">{error.message}</p>;
  if(!project)return <Link href="/onboarding" className="text-primary">Créez un projet pour démarrer une analyse.</Link>;
  return <ProjectChat key={project.id+action+(conversationId??"")} project={project} action={action} initialPrompt={initialPrompt} conversationId={conversationId}/>;
}
function projectTransport(projectId: string, action: string, conversationId?: string) {
    let activeConversation = conversationId;
    return new DefaultChatTransport<SeoAgentMessage>({
    api:"/api/chat",
    fetch:async(input,init)=>{const response=await fetch(input,init);const id=response.headers.get("X-Conversation-Id");if(id)activeConversation=id;return response;},
    prepareSendMessagesRequest:({messages})=>({body:{projectId,conversationId:activeConversation,action,messages:messages.filter(m=>m.role==="user").slice(-1).map(m=>({id:m.id,role:m.role,parts:m.parts.filter(p=>p.type==="text").map(p=>({type:"text",text:p.text}))}))}}),
  });
}
function ProjectChat({project,action,initialPrompt,conversationId}:{project:ProjectRecord;action:string;initialPrompt:string;conversationId?:string}) {
  const [input,setInput]=useState(initialPrompt),[exportError,setExportError]=useState(""),[loading,setLoading]=useState(Boolean(conversationId));
  const cache=useQueryClient();
  const transport=useMemo(()=>projectTransport(project.id,action,conversationId),[project.id,action,conversationId]);
  const {messages,sendMessage,status,error,setMessages,stop}=useChat<SeoAgentMessage>({transport,onFinish:()=>{void cache.invalidateQueries({queryKey:["projects"]});}});
  useEffect(()=>{
    if(!conversationId)return;
    let cancelled=false;
    api<{conversation:{messages:SeoAgentMessage[]}}>("/api/conversations/"+conversationId).then(data=>{if(!cancelled)setMessages(data.conversation.messages);}).catch(e=>{if(!cancelled)setExportError(e.message);}).finally(()=>{if(!cancelled)setLoading(false);});
    return()=>{cancelled=true;};
  },[conversationId,setMessages]);
  const busy=status==="submitted"||status==="streaming";
  const workflow=workflows[selectWorkflow(action,"")];
  const latest=[...messages].reverse().find(m=>m.role==="assistant");
  const content=latest?.parts.filter(p=>p.type==="text").map(p=>p.text).join("\n")??"";
  async function exportResult(format:string) {
    setExportError("");
    try {
      const response=await fetch("/api/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({format,topic:workflow.title,content})});
      if(!response.ok)throw new Error("Export impossible.");
      const url=URL.createObjectURL(await response.blob()),a=document.createElement("a");a.href=url;a.download="better-seo-"+action+"."+format;a.click();URL.revokeObjectURL(url);
    }catch(e){setExportError(e instanceof Error?e.message:"Export impossible.");}
  }
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><Card className="flex min-h-[75vh] min-w-0 flex-col overflow-hidden">
    <header className="border-b p-6"><p className="text-xs font-medium uppercase tracking-widest text-primary">Votre analyste SEO</p><h1 className="mt-3 text-2xl">{workflow.title}</h1><p className="mt-2 text-sm text-muted-foreground">Recommandations fondées sur votre projet et ses preuves enregistrées.</p></header>
    <Conversation><ConversationContent className="p-6">{loading?<p role="status">Chargement de la conversation…</p>:!messages.length?<div className="py-12"><FileText className="mb-6 size-8 text-primary"/><h2 className="text-2xl">Quel résultat souhaitez-vous obtenir ?</h2><p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">Demandez un plan d’action, un article ou une optimisation de page. L’assistant consulte les données de votre audit et la méthode Claude SEO.</p><button className="mt-6 rounded-lg border px-4 py-3 text-left text-sm hover:bg-accent" onClick={()=>setInput("Analyse les données de mon projet et propose les trois actions prioritaires, avec leurs preuves et les résultats à mesurer.")}>Identifier mes trois prochaines actions →</button></div>:null}
    {messages.map(m=><Message key={m.id} from={m.role}><MessageContent className="min-w-0 w-full">{m.parts.map((p,i)=>p.type==="text"?<MessageResponse key={i} isAnimating={busy}>{p.text}</MessageResponse>:p.type.startsWith("tool-")?<p key={i} className="my-2 rounded border bg-muted/40 p-2 text-xs text-muted-foreground">{p.type==="tool-getProjectEvidence"?"Consultation des preuves du projet":"Lecture de la méthode Claude SEO"}</p>:null)}</MessageContent></Message>)}
    {busy&&<p role="status" className="text-sm text-muted-foreground">Analyse en cours…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error.message}</p>}
    </ConversationContent></Conversation>
    <form className="mt-auto border-t p-5" onSubmit={e=>{e.preventDefault();if(input.trim()&&!busy&&!loading){void sendMessage({text:input.trim()});setInput("");}}}><Textarea aria-label="Votre demande SEO" placeholder="Décrivez le contenu ou la stratégie à préparer…" value={input} maxLength={12000} onChange={e=>setInput(e.target.value)}/><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Les propositions éditoriales restent à relire avant publication.</p>{busy?<Button type="button" variant="outline" onClick={()=>void stop()}><Square className="size-4"/>Arrêter</Button>:<Button disabled={!input.trim()||loading}><Send className="size-4"/>Envoyer</Button>}</div></form>
  </Card><aside className="space-y-5"><Card className="p-5"><h2 className="font-medium">{project.name}</h2><p className="mt-3 break-all text-sm text-muted-foreground">{project.websiteUrl}</p><p className="mt-3 text-sm">{project.goals.join(" · ")}</p><p className="mt-4 text-xs text-muted-foreground">{project.audits[0]?"Dernier audit : "+new Date(project.audits[0].createdAt).toLocaleDateString("fr-FR"):"Aucun audit. Lancez une collecte pour fournir des preuves."}</p><Link href="/dashboard/audit" className="mt-4 inline-block text-sm text-primary">Consulter l’audit →</Link></Card><Card className="p-5"><h2 className="font-medium">Exporter la réponse</h2><div className="mt-4 grid gap-2">{["md","docx","xlsx"].map(format=><Button key={format} variant="outline" disabled={!content||busy} onClick={()=>void exportResult(format)}><Download className="size-4"/>{format.toUpperCase()}</Button>)}</div>{exportError&&<p role="alert" className="mt-3 text-sm text-destructive">{exportError}</p>}</Card><p className="px-2 text-xs leading-6 text-muted-foreground">Claude SEO fournit la méthode. Grok exécute l’analyse avec les outils de lecture du projet. Les données Google sont accessibles uniquement avec votre autorisation.</p></aside></div>;
}
