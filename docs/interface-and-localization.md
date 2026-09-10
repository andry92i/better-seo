# Interface and localization

The visual direction follows `design/stripe-design/stripe-DESIGN.md`: indigo actions (#533afd), navy narrative sections (#1c1e54), ink text (#0d253d), quiet surfaces (#f6f9fc) and a cream inset (#f5e9d4). The SEO workspace prioritizes evidence, data tables and useful next actions. The landing page retains the four-stage action plan as its main visual; the chat separates requests, evidence-reading states and generated content.

The design audit identified transparent secondary text on navy, class/media theme disagreement, cramped navigation, non-wrapping actions and inaccessible horizontal tables. Corrections use semantic colors, a shared navigation control, wrapped mobile layouts, keyboard-focusable table regions and contained Markdown overflow. Motion honors reduced-motion preferences.

## Locale resolution

`next-intl` uses request configuration without changing route paths. Existing OAuth callbacks and private application URLs therefore remain stable. English is the default. A validated preference cookie wins, otherwise weighted `Accept-Language` preferences select English or French. Regional variants such as fr-CA and en-GB use the corresponding supported language. Unsupported languages fall back to English. No geolocation permission, IP lookup or paid translation API is used.

The header language control persists an explicit choice for one year and refreshes server components. The root HTML language, rendered UI, number/date formatting, API errors and Grok's default output language share this preference. Dates use UTC consistently to avoid server/client hydration differences; Google reporting dates retain their source period.

UI translations live in `messages/en.json` and `messages/fr.json`. `source-keys.json` bridges existing method labels and known service errors to catalog keys. Customer names, URLs, search queries, page content and existing conversations are preserved. Legacy technical findings receive a presentation-only translation; original evidence is unchanged.

Grok is accessed directly through `@ai-sdk/xai` and `GROK_API_KEY`. `SEO_MODEL` identifies the xAI model; it is not a second API key. Claude SEO is a pinned method bundle read by the agent's tools. Model-generated deliverables default to the active interface language and can follow an explicit request for another language.

## Verification

Run `npm run build`, `npm run lint` and `npm run test:seo`. Locale tests cover weighted browser preferences, explicit overrides, invalid inputs, catalog parity and rendering in both languages. Authentication and cross-origin access checks remain required. Browser checks must exercise both themes and narrow layouts; production Google and Grok calls require the deployment's real credentials.
