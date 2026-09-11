// Use the canonical production origin, never an ephemeral preview deployment.
export const siteUrl = new URL(process.env.BETTER_AUTH_URL || 'https://better-seo-five.vercel.app').origin;
