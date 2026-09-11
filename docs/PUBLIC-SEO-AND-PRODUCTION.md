# Public SEO and production readiness

## Implemented

- Five distinct resources, each written in English and French: technical audit, Search Console opportunities, content brief, Search Console versus Analytics, and evidence methodology. Two resource index pages make every article discoverable through internal links.
- Explicit `/en/resources/...` and `/fr/resources/...` routes. URL locale wins over browser preferences, while the existing app keeps its preferred-language behavior. Language switch preserves the selected resource. Invalid locales and slugs return 404.
- Unique titles, descriptions, self-canonicals, reciprocal hreflang, Article and BreadcrumbList JSON-LD. No invented author credentials, ratings, dates or traffic statistics. Sitemap contains public resources only. A generated Open Graph image provides a real share preview.
- A single production origin is used for Better Auth baseURL, trusted origins and API mutation checks. A localhost BETTER_AUTH_URL no longer directs production callbacks and CSRF expectations to a developer machine. Incoming Host headers never establish trust.
- `vercel.json` explicitly sets the nonsecret `SEO_LIVE_ENABLED=true` runtime switch, as requested. Valid model configuration, API key, database and session secret remain mandatory. This flag does not bypass authentication, ownership or rate limiting. Local `.env.example` remains disabled. To pause deployed generation, change the deployed switch to false and redeploy.
- Authenticated Connections page shows configuration checks and Google authorization scope presence, without secret values. Configuration presence is not a successful API request.

## Evidence and method

Applied Claude SEO page, content and sitemap guidance from the pinned 2.3.1 repository. The pages explain actual app capabilities: sampled server HTML, authorized Google reports, imported GSC links, and reviewable AI drafts. They do not advertise full competitor datasets, guaranteed rankings or automatic publication.

Primary references checked:
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/essentials/technical
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://support.google.com/analytics/answer/9191807
- https://vercel.com/docs/project-configuration/vercel-json#env

Vercel recommends project settings rather than the legacy env property. The versioned nonsecret switch is used because the available connector cannot edit project environment variables. Secrets are never put into this configuration file. To migrate it into project settings later, remove the repository switch after configuring the equivalent runtime value.

## Verification scope

Production build, TypeScript, lint and integration tests cover public routing, language, metadata, configuration validation, exports and unauthenticated access protection. The new origin function is regression-tested against localhost production configuration and local development.

Browser login layout was observed at 1363px with no horizontal overflow. The browser did not apply the requested device toolbar shortcut; this is not mobile emulation evidence. Authenticated visual and Google-data checks require the user's secure sign-in. No private session was fabricated and no access control was bypassed.

The existing chat already exposes SEO skills. An additional personal Claude SEO package was prepared and validated, but its save failed; it is not reported as installed. This does not remove the pinned repository or skills used in the app.
