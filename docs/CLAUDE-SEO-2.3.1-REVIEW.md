# Claude SEO upgrade and Better SEO review

Review date: 11 September 2026. Audience: Better SEO maintainer. This report distinguishes repository claims, inspected application behavior and remaining integration limits.

## Decision and provenance

Upgrade the pinned repository from `a1480c7e590b16001bd9dc1627eacdcd44d580f9` (2.2.5) to `55c7914a3ed2869b217b5d5f360a4e7ba28b4848` (2.3.1). The comparison contains 97 commits and 185 changed files. The app compiles all 188 Markdown documents from skills, agents, docs and extensions, retaining content hashes and the exact revision. Source count is unchanged; content is not. The git submodule retains the complete upstream code and licenses. Production consumes the compiled bundle without fetching moving upstream branches during deployment.

Sources: [exact comparison](https://github.com/AgriciDaniel/claude-seo/compare/a1480c7e590b16001bd9dc1627eacdcd44d580f9...55c7914a3ed2869b217b5d5f360a4e7ba28b4848), [pinned changelog](https://github.com/AgriciDaniel/claude-seo/blob/55c7914a3ed2869b217b5d5f360a4e7ba28b4848/CHANGELOG.md), [plugin manifest](https://github.com/AgriciDaniel/claude-seo/blob/55c7914a3ed2869b217b5d5f360a4e7ba28b4848/.claude-plugin/plugin.json).

## Changes relevant to the app

| Upstream change | Meaning for Better SEO | Applied / limit |
| --- | --- | --- |
| Deterministic templated-metadata detector | Body copy uniqueness alone misses repetitive descriptions | Updated methodology bundled; public metadata reviewed. Python detector is not falsely exposed as a serverless tool. |
| Training bots separated from search bots | Training permission does not establish search visibility | Updated GEO/technical instructions; no guaranteed AI citation claims. |
| Canonical rel matching case-insensitive | Mixed-case attributes must not become false missing-canonical findings | Applied to the app's Cheerio crawler, regression tested. |
| CJK scoring coverage and English-only phrase lists | Language-specific scores are not universally comparable | Methodology updated; app does not fabricate content scores. |
| Untrusted fetched content and SSRF fixes | Website text must not control agent behavior or reach internal services | Existing app URL/DNS protections retained; updated instructions remain data; read-only allowlisted tools. No localhost exception added to SaaS crawler. |
| JSON-LD parser improvements | Attribute order and graphs must not hide structured data | App uses Cheerio and JSON parsing, already handles graphs and type arrays; malformed JSON retained as an observation. |
| Launcher moved under scripts | Old `bin/claude-seo` path no longer exists | Repository installation uses `scripts/claude-seo`; deployment does not execute optional installers. |
| Five upstream agents use Opus | Upstream Claude model selection is not an xAI capability | No model override: the user's configured API remains in use. Specialist documents guide one bounded AI SDK agent. |
| Optional Open PageRank fallback | A domain metric is not a backlink inventory | Not enabled without an account or verified endpoint. User's free/Google source policy preserved. |
| Google guidance refreshed | Date-sensitive claims need current primary verification | Stored revision shown; not every upstream policy statement independently certified in this review. |

The repository is a Claude Code plugin, not a drop-in Next.js execution engine. Installing its files does not create Google permissions, Chromium workers, paid data subscriptions or autonomous subagents inside AI SDK. The app integrates the full knowledge corpus and actual declared data tools. It must not claim every upstream script has run.

## Capability coverage and cover.svg requests

The supplied SVG contains audit, schema, geo, content and backlinks commands, and prompts about rankings, E-E-A-T, CWV and citations. The chatbot now offers six direct starters and recognizes both `/seo audit` and `/seo-audit` spellings. Additional aliases cover sitemap, images, content brief, programmatic, Google, SXO and FLOW.

| Request | Current evidence | Deliverable / boundary |
| --- | --- | --- |
| Audit website / CWV | Bounded HTML crawl, PageSpeed, CrUX if configured | Observed issues and prioritized fixes; server HTML is not a rendered whole-site audit. |
| Keywords / ranking opportunities | Own-property GSC queries, pages and comparison periods | Prioritize observed demand; no invented market volumes or guaranteed #1 ranking. |
| Competitive strategy | Public pages of confirmed competitors | Compare content, structure and messaging; private competitor GSC/GA4 unavailable. |
| Schema | Observed page types, offer details and collected structured-data types | Proposed JSON-LD with missing business facts marked; no fabricated reviews or rich-result guarantee. |
| Blog, page, landing page | Project evidence + Claude SEO + writing skills | Complete structured Markdown draft, headings, sections, code where requested; export MD/TXT/DOCX/XLSX. Review facts before publishing. |
| GEO / E-E-A-T | Page evidence, references and methodology | Concrete editorial/accessibility recommendations; no invented citation share or authority score. |
| Backlinks | User-imported GSC Links CSV | Partial own-property analysis and acquisition plan; no complete competitor profile or automatic disavow. |
| Local | Public site/business details | NAP/schema/content strategy; no live Maps geo-grid or unconnected Business Profile data. |
| International/ecommerce | Crawled URLs, provided catalogue/locales | Limited by crawl coverage and supplied product/locale data. |
| Monitoring | Stored dated audit and Google comparison data | Analysis of available snapshots; no claim of a scheduled monitoring service. |

## Writing skills and AI SDK

Complete copywriting and humanizer files are vendored with their MIT licenses and SHA-256 hashes. They were selected from the upstream repositories linked on skills.sh; popularity is not proof of objective writing quality. Runtime loads are limited to four exact paths and paginated until complete. Instructions require evidence first, copywriting for structure, and humanizer for an editorial pass that preserves meaning, citations and code. Embedded example statistics must never be reused as project facts.

AI SDK's installed 7.0.91 documentation lists `uploadSkill` support for OpenAI and Anthropic, not xAI. Using that method here would require changing provider, contrary to the user's requirement. The implemented alternative is an AI SDK `tool` named `loadSkill`, not a simulated upload. The agent remains bounded at 24 steps to accommodate full methodology and writing-reference reads.

Sources: [AI SDK skill uploads](https://ai-sdk.dev/docs/ai-sdk-core/skill-uploads), [copywriting](https://skills.sh/coreyhaines31/marketingskills/copywriting), [humanizer](https://skills.sh/blader/humanizer/humanizer). Version-matched API details verified against `node_modules/ai/docs/03-ai-sdk-core/41-skill-uploads.mdx`.

## Interface decisions

[Ahrefs Dashboard](https://ahrefs.com/dashboard) emphasizes summary metrics followed by search performance exploration. Better SEO adopts this hierarchy without inventing the competitor's paid datasets. [Vercel Analytics](https://vercel.com/docs/analytics) provides another reference for compact metrics and focused charts. The dashboard now separates overview, Google traffic, site health and content. The chart offers clicks/impressions and a keyboard-accessible data table; it plots available dated observations without fake samples or animation. Missing values remain missing, not zero.

The chat adopts familiar central reading/composer ergonomics, neutral user bubbles, collapsed source activity and exports attached to each completed answer. This is not claimed as a pixel-perfect or feature-complete ChatGPT clone. Related authenticated pages are grouped with shadcn tabs; the profile has personal/preferences tabs. Flexible layouts, bounded chart containers, horizontally scrollable tables and wrapping URLs address mobile overflow. Browser visual acceptance remained blocked during this review; code checks cannot establish pixel-perfect rendering on every device.

## Better SEO's own SEO

Source review found no robots route, sitemap route, homepage canonical or JSON-LD. Added these directly. Only the public homepage appears in the sitemap. Dashboard, workspace, onboarding and API paths are crawl-disallowed; account/login/signup layouts carry noindex. Authentication remains the actual access control: robots is not security and alone does not prevent indexing, as [Google documents](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

Homepage now declares SoftwareApplication structured data without fictional ratings or pricing. Open Graph and Twitter metadata are added. Canonical origin prefers NEXT_PUBLIC_SITE_URL, then a valid HTTPS public application origin, otherwise the existing production hostname. A post-deployment check found BETTER_AUTH_URL resolving to localhost in production; the canonical resolver now rejects that value rather than publishing localhost URLs. Authentication and AI configuration still need separate production correction. No invented last-modified timestamp. English/French use the same cookie/header-negotiated URL today, so fake language URLs/hreflang are deliberately not emitted. Separate crawlable locale URLs would be a distinct routing migration, not a cosmetic metadata edit.

Remaining evidence gaps: real production model configuration, authenticated Google end-to-end checks, mobile visual checks, field CWV and Search Console indexation for Better SEO itself. No ranking improvement or complete-site performance score is claimed without those measurements.

### Executed upstream checks

Installed the isolated runtime with `scripts/claude-seo setup --skip-browser`; core setup succeeded, Chromium was intentionally not installed. Executed the new `metadata_template.py` against the actual English title/description in source: zero templated flags, heuristic result in `docs/metadata-check.json`. This narrow check is not a whole-site SEO score. An upstream `fetch_page.py` request to production failed DNS resolution in this environment, so no live page evidence or field metrics are attributed to that failed request. Public SEO fixes above are grounded in the inspected Next.js source and build outputs.
