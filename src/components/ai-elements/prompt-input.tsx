"use client";
// Text-only adaptation of Vercel AI Elements PromptInput composition (MIT).
import type { ComponentProps, FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
export type PromptInputMessage={text:string};
export function PromptInput({onSubmit,className,...props}:Omit<ComponentProps<"form">,"onSubmit">&{onSubmit:(message:PromptInputMessage,event:FormEvent<HTMLFormElement>)=>void}){
  return <form className={cn("rounded-2xl border bg-background p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/40",className)} onSubmit={event=>{event.preventDefault();onSubmit({text:String(new FormData(event.currentTarget).get("message")??"")},event);}} {...props}/>;
}
export function PromptInputTextarea({className,onKeyDown,...props}:ComponentProps<typeof Textarea>){
  return <Textarea name="message" className={cn("min-h-24 max-h-64 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0",className)} onKeyDown={event=>{
    onKeyDown?.(event);
    if(!event.defaultPrevented&&event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit();}
  }} {...props}/>;
}
export function PromptInputFooter({className,...props}:ComponentProps<"div">){return <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-3",className)} {...props}/>;}
