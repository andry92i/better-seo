export const connectors = [
  { id: "gsc", label: "Google Search Console", implemented: true, configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), protocol: "Google API + OAuth" },
  { id: "ga4", label: "Google Analytics 4", implemented: true, configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), protocol: "Google API + OAuth" },
];
