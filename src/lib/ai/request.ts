import { z } from "zod";
export const chatRequestSchema = z.object({
  projectId: z.string().min(1).max(100), conversationId: z.string().max(100).optional(),
  action: z.string().max(80).default("content-plan"),
  messages: z.array(z.object({
    id: z.string().min(1).max(100), role: z.enum(["user", "assistant"]),
    parts: z.array(z.object({ type: z.literal("text"), text: z.string().max(20000) })).min(1).max(20),
  })).min(1).max(30),
}).refine(value => value.messages.at(-1)?.role === "user", { message: "Dernier message utilisateur requis" });
export type ChatRequest = z.infer<typeof chatRequestSchema>;
