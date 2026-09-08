import { freeDataPolicy } from '../seo-data-policy';

// Infrastructure configuration does not establish a user OAuth connection.
export function getConnectorStatuses() {
  const oauthConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return freeDataPolicy.sources.map(source => ({
    connector: source.id,
    configured: source.id === 'google-search-console' || source.id === 'google-analytics'
      ? oauthConfigured : source.id === 'pagespeed'
      ? Boolean(process.env.GOOGLE_PAGESPEED_API_KEY) : source.id === 'crux'
      ? Boolean(process.env.GOOGLE_CRUX_API_KEY) : false,
    connected: false,
    implemented: false,
    mode: source.access,
    status: source.id === 'gsc-links-export' || source.id === 'google-trends' ? 'manual-export-planned' : 'not-connected',
  }));
}
