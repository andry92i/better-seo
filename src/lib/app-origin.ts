import { canonicalOrigin } from './site';
// OAuth and CSRF use one configured origin, never an incoming Host header.
export function appOrigin(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env.VERCEL_ENV === 'production') return canonicalOrigin(env.NEXT_PUBLIC_SITE_URL || env.BETTER_AUTH_URL);
  try {
    if (!env.BETTER_AUTH_URL) return undefined;
    const url = new URL(env.BETTER_AUTH_URL);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
    return url.origin;
  } catch { return undefined; }
}
