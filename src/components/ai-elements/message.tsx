"use client";

// Adapted from Vercel AI Elements (MIT): packages/elements/src/message.tsx
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { UIMessage } from "ai";
import { memo, type ComponentProps, type HTMLAttributes } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

export function Message({ className, from, ...props }: HTMLAttributes<HTMLDivElement> & { from: UIMessage["role"] }) {
  return <div className={cn("group flex w-full max-w-[94%] flex-col gap-2", from === "user" ? "ml-auto items-end" : "items-start", className)} {...props} />;
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 max-w-full text-sm leading-6", className)} {...props} />;
}

const plugins = { cjk, code, math, mermaid };
export type MessageResponseProps = ComponentProps<typeof Streamdown>;
export const MessageResponse = memo(({ className, ...props }: MessageResponseProps) => <Streamdown className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)} plugins={plugins} {...props} />, (previous, next) => previous.children === next.children && previous.isAnimating === next.isAnimating);
MessageResponse.displayName = "MessageResponse";
