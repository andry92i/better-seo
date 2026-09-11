"use client";
import { useCopy } from "@/i18n/copy";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Send, Square, FileText, Copy, Check, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";

import { PromptInput, PromptInputTextarea, PromptInputFooter } from "@/components/ai-elements/prompt-input";
import { Tool, ToolHeader, ToolContent } from "@/components/ai-elements/tool";
import { workflows, selectWorkflow } from "@/lib/claude-seo/workflows";
import { useProject, api, type ProjectRecord } from "@/lib/project-client";
import type { SeoAgentMessage } from "@/lib/ai/seo-agent";

export function SeoChat({action,initialPrompt="",conversationId}:{action:string;initialPrompt?:string;conversationId?:string}) {
const t = useTranslations("ui");


  const {project,error,isPending}=useProject();
  if(isPending)return <p role="status">{t("loading_project_d5b335")}</p>;
  if(error)return <p role="alert">{error.message}</p>;
  if(!project)return <Link href="/onboarding" className="text-primary">{t("create_a_project_to_start_71e2cc")}</Link>;
  return <ProjectChat key={project.id+action+(conversationId??"")} project={project} action={action} initialPrompt={initialPrompt} conversationId={conversationId}/>;
}
function projectTransport(projectId: string, action: string, conversationId?: string) {
    let activeConversation = conversationId;
    return new DefaultChatTransport<SeoAgentMessage>({
    api:"/api/chat",
    fetch:async(input,init)=>{const response=await fetch(input,init);if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error??`Request failed (${response.status})`);}const id=response.headers.get("X-Conversation-Id");if(id)activeConversation=id;return response;},
    prepareSendMessagesRequest:({messages})=>({body:{projectId,conversationId:activeConversation,action,messages:messages.filter(m=>m.role==="user").slice(-1).map(m=>({id:m.id,role:m.role,parts:m.parts.filter(p=>p.type==="text").map(p=>({type:"text",text:p.text}))}))}}),
  });
}
function ProjectChat({project,action,initialPrompt,conversationId}:{project:ProjectRecord;action:string;initialPrompt:string;conversationId?:string}) {
const t = useTranslations("ui");
const locale = useLocale();
const copy = useCopy();
const router = useRouter();

  const [lastRequest,setLastRequest]=useState("");
  const [copied,setCopied]=useState<string | null>(null);
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
  async function exportResult(format:string, content:string) {
    setExportError("");
    try {
      const response=await fetch("/api/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({format,topic:copy(workflow.title),content})});
      if(!response.ok)throw new Error(t("unable_to_export_a061ad"));
      const url=URL.createObjectURL(await response.blob()),a=document.createElement("a");a.href=url;a.download="better-seo-"+action+"."+format;a.click();URL.revokeObjectURL(url);
    }catch(e){setExportError(e instanceof Error?e.message:t("unable_to_export_a061ad"));}
  }
  return <div className="mx-auto flex h-[calc(100dvh-9rem)] min-h-[28rem] w-full min-w-0 flex-col">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><div><h1 className="text-lg font-semibold">{copy(workflow.title)}</h1><p className="mt-1 text-xs text-muted-foreground">{project.name} · <Link href="/dashboard/audit" className="underline underline-offset-4">{t("view_audit_f7b7a3")}</Link></p></div><Button variant="ghost" size="sm" onClick={()=>router.push("/workspace/assistant?fresh="+Date.now())}><Plus className="size-4"/>{locale==="fr"?"Nouvelle conversation":"New conversation"}</Button></header>
    <Conversation><ConversationContent className="mx-auto w-full max-w-[780px] px-1 py-8 sm:px-4">{loading?<p role="status">{t("loading_conversation_aff798")}</p>:!messages.length?<div className="py-12"><FileText className="mb-6 size-8 text-primary"/><h2 className="text-2xl">{t("what_would_you_like_to_2e0882")}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">{t("ask_for_an_action_plan_6ab646")}</p><div className="mt-8 grid gap-2 sm:grid-cols-2">{(locale==="fr" ? [["audit", "Auditer mon site"],["schema", "Créer mes données structurées"],["content", "Rédiger un article complet"],["geo", "Améliorer ma visibilité IA"],["technical", "Analyser mes Core Web Vitals"],["backlinks", "Construire un plan de backlinks"]] : [["audit", "Audit my website"],["schema", "Create structured data"],["content", "Write a complete article"],["geo", "Improve AI visibility"],["technical", "Analyze Core Web Vitals"],["backlinks", "Build a backlink plan"]]).map(([command,label])=><button key={command} className="rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>setInput(`/seo-${command} ${label}: ${project.websiteUrl}`)}>{label}</button>)}</div></div>:null}
    {messages.map(m=>{
      const text=m.parts.filter(p=>p.type==="text").map(p=>p.text).join("\n\n");
      const tools=m.parts.filter(isToolUIPart);
      const streaming=busy && m.id===messages.at(-1)?.id;
      return <Message key={m.id} from={m.role}><MessageContent className="min-w-0 w-full">
        {tools.length>0 && <details className="mb-4 text-xs text-muted-foreground"><summary className="py-2">{locale==="fr"?"Sources consultées":"Research activity"} ({tools.length})</summary>{tools.map((p,i)=><Tool key={i}><ToolHeader state={p.state} title={p.type==="tool-getProjectEvidence"?t("reading_project_evidence_ed17f1"):t("reading_claude_seo_methodology_e438e1")}/><ToolContent>{locale==="fr"?"Source consultée en lecture seule. Consultez les références dans la réponse pour les éléments utilisés.":"Read-only source. See the references in the response for the evidence used."}</ToolContent></Tool>)}</details>}
        {m.role==="user"?<p className="whitespace-pre-wrap">{text}</p>:text?<MessageResponse isAnimating={streaming}>{text}</MessageResponse>:null}
        {m.role==="assistant" && text && !streaming && <div className="mt-4 flex flex-wrap items-center gap-1"><Button type="button" size="sm" variant="ghost" onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(m.id);}catch{setExportError(locale==="fr"?"Copie impossible. Sélectionnez le texte pour le copier.":"Could not copy. Select the text to copy it.");}}}>{copied===m.id?<Check className="size-4"/>:<Copy className="size-4"/>}{locale==="fr"?(copied===m.id?"Copié":"Copier"):(copied===m.id?"Copied":"Copy")}</Button>{["md","txt","docx","xlsx"].map(format=><Button key={format} size="sm" variant="ghost" disabled={busy} aria-label={`${t("export_response_abc940")} ${format.toUpperCase()}`} onClick={()=>void exportResult(format,text)}><Download className="size-3"/>{format.toUpperCase()}</Button>)}</div>}
      </MessageContent></Message>;
    })}
    {busy&&<p role="status" className="text-sm text-muted-foreground">{t("analysis_in_progress_466456")}</p>}{error&&<div role="alert" className="rounded-xl border border-destructive/40 p-4"><p className="text-sm text-destructive">{error.message}</p><Button type="button" variant="outline" className="mt-3" onClick={()=>setInput(lastRequest)}>{locale==="fr"?"Reprendre ma demande":"Edit my request"}</Button></div>}
    </ConversationContent></Conversation>
    <div className="mx-auto mt-auto w-full max-w-[780px] pt-3 pb-1"><PromptInput onSubmit={({text})=>{if(text.trim()&&!busy&&!loading){setLastRequest(text.trim());void sendMessage({text:text.trim()});setInput("");}}}><PromptInputTextarea aria-label={t("your_seo_request_d9008c")} placeholder={t("describe_the_content_or_strategy_a2e7a2")} value={input} maxLength={12000} onChange={e=>setInput(e.target.value)}/><PromptInputFooter><p className="text-xs text-muted-foreground">{t("review_generated_content_before_publishing_77903b")}</p>{busy?<Button type="button" variant="outline" onClick={()=>void stop()}><Square className="size-4"/>{t("stop_1b1cd2")}</Button>:<Button disabled={!input.trim()||loading}><Send className="size-4"/>{t("send_e9ce24")}</Button>}</PromptInputFooter></PromptInput></div>
    {exportError&&<p role="alert" className="mx-auto mt-2 text-sm text-destructive">{exportError}</p>}
  </div>;
}
