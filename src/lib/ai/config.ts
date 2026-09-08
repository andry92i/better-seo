// No credentials are returned to the browser. Explicit xAI model IDs only.
export function getSeoConfig(env: NodeJS.ProcessEnv = process.env) {
  const model = env.SEO_MODEL?.trim() || 'grok-4.6';
  const modelValid = /^grok-[a-zA-Z0-9._-]+$/.test(model);
  return {
    provider: 'xai-direct' as const,
    model,
    modelValid,
    liveConfigured: env.SEO_LIVE_ENABLED === 'true' && modelValid && Boolean(
      env.GROK_API_KEY?.trim() && env.DATABASE_URL && env.BETTER_AUTH_URL &&
      env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 32 &&
      !env.BETTER_AUTH_SECRET.startsWith('replace-with-')
    ),
  };
}
