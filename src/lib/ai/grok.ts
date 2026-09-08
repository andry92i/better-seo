import { createXai } from '@ai-sdk/xai';

export function createGrokModel(model: string, options: { apiKey?: string; fetch?: typeof fetch } = {}) {
  const apiKey = options.apiKey ?? process.env.GROK_API_KEY;
  if (!apiKey?.trim()) throw new Error('GROK_API_KEY manquante.');
  if (!/^grok-[a-zA-Z0-9._-]+$/.test(model)) throw new Error('SEO_MODEL doit être un identifiant Grok direct.');
  // Explicit key prevents a fallback to XAI_API_KEY; no string model/Gateway routing.
  return createXai({ apiKey, fetch: options.fetch })(model);
}
