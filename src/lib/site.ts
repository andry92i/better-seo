const productionOrigin = 'https://better-seo-five.vercel.app';
// An auth callback/dev origin must never leak into indexable production metadata.
export function canonicalOrigin(value?: string): string {
  try {
    const url = new URL(value || productionOrigin);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') || /^(localhost|127\.|0\.)/.test(url.hostname) || /\.(localhost|local|internal|test)$/.test(url.hostname)) return productionOrigin;
    return url.origin;
  } catch { return productionOrigin; }
}
export const siteUrl = canonicalOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL);
