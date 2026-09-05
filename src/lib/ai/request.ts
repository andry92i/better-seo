import { z } from 'zod';
export const chatRequestSchema = z.object({
  mode: z.enum(['demo', 'live']).default('demo'),
  action: z.string().max(80).default('content-plan'),
  profile: z.object({
    websiteUrl: z.string().max(2048).default(''), seoLevel: z.string().max(80).default(''),
    businessType: z.string().max(80).default(''), role: z.string().max(100).default(''),
    goals: z.array(z.string().max(200)).max(10).default([]),
    competitors: z.array(z.string().max(2048)).max(10).default([]),
  }).default({ websiteUrl: '', seoLevel: '', businessType: '', role: '', goals: [], competitors: [] }),
  messages: z.array(z.object({
    id: z.string().min(1).max(100), role: z.enum(['user', 'assistant']),
    parts: z.array(z.object({ type: z.literal('text'), text: z.string().max(20000) })).min(1).max(20),
  })).min(1).max(30),
}).refine(value => value.messages.at(-1)?.role === 'user', { message: 'Last message must be from the user' });
export type ChatRequest = z.infer<typeof chatRequestSchema>;
