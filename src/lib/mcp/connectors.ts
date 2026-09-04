export type SeoConnector = "google-search-console" | "google-analytics" | "pagespeed" | "dataforseo" | "ahrefs";

export type McpConnectorStatus = { connector: SeoConnector; configured: boolean; mode: "oauth" | "api-key" | "public" };

export function getConnectorStatuses(): McpConnectorStatus[] {
  return [
    { connector: "google-search-console", configured: Boolean(process.env.GOOGLE_CLIENT_ID), mode: "oauth" },
    { connector: "google-analytics", configured: Boolean(process.env.GOOGLE_CLIENT_ID), mode: "oauth" },
    { connector: "pagespeed", configured: Boolean(process.env.GOOGLE_PAGESPEED_API_KEY), mode: "public" },
    { connector: "dataforseo", configured: Boolean(process.env.DATAFORSEO_LOGIN), mode: "api-key" },
    { connector: "ahrefs", configured: Boolean(process.env.AHREFS_API_KEY), mode: "api-key" },
  ];
}
