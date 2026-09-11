import { appOrigin } from '../app-origin';
// Readiness validates configuration, not a successful model call.
export function getSeoConfig(env: NodeJS.ProcessEnv = process.env) {
  const model = env.SEO_MODEL?.trim() || 'grok-4.6';
  const modelValid = /^grok-[a-zA-Z0-9._-]+$/.test(model);
  const checks = {
    enabled: env.SEO_LIVE_ENABLED === 'true', model: modelValid,
    apiKey: Boolean(env.GROK_API_KEY?.trim()), database: Boolean(env.DATABASE_URL?.trim()),
    origin: Boolean(appOrigin(env)),
    authSecret: Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 32 && !env.BETTER_AUTH_SECRET.startsWith('replace-with-')),
  };
  return { provider: 'xai-direct' as const, model, modelValid, liveConfigured: Object.values(checks).every(Boolean), checks };
}
