import type { CrawlEvidence, PageEvidence } from './crawl';

export const analysisFacets = ['technical', 'schema', 'international', 'links', 'content', 'images', 'opportunities', 'drift'] as const;
export type AnalysisFacet = typeof analysisFacets[number];
type Observation = { url: string; check: string; observed: unknown; interpretation: string };
type QueryRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type StoredEvidence = { crawl?: { status?: string; data?: CrawlEvidence }; gsc?: { status?: string; data?: { rows?: QueryRow[]; previous?: QueryRow[]; coverage?: string; range?: unknown } } };
function evidence(value: unknown): StoredEvidence { return value && typeof value === 'object' ? value as StoredEvidence : {}; }
function absolute(value: string, base: string) { try { return new URL(value, base).href; } catch { return ''; } }
function indexed(p: PageEvidence) { return p.status >= 200 && p.status < 300 && !/\b(noindex|none)\b/i.test(p.robots); }

/** Deterministic observations only: no invented score, rank, authority or forecast. */
export function analyzeEvidence(raw: unknown, facet: AnalysisFacet, previousRaw?: unknown, offset = 0) {
  const current = evidence(raw), previous = evidence(previousRaw);
  const pages = current.crawl?.data?.pages ?? [];
  const observations: Observation[] = [];
  const add = (p: PageEvidence, check: string, observed: unknown, interpretation: string) => observations.push({ url: p.url, check, observed, interpretation });
  if (facet === 'opportunities') {
    const data = current.gsc?.data;
    if (!data) return { status: 'unavailable', reason: 'No Search Console evidence in this audit.' };
    const before = new Map((data.previous ?? []).map(row => [JSON.stringify(row.keys), row]));
    const candidates = (data.rows ?? []).filter(row => row.keys.length >= 2 && row.impressions >= 100 && row.position >= 4 && row.position <= 20).sort((a,b) => b.impressions - a.impressions);
    for (const row of candidates) {
      const old = before.get(JSON.stringify(row.keys));
      observations.push({ url: row.keys[1], check: 'existing-query-opportunity', observed: { query: row.keys[0], clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position, previous: old ?? null, clickChange: old ? row.clicks - old.clicks : null }, interpretation: 'Heuristic shortlist: at least 100 impressions and average position 4–20. Review intent before editing; absence in the previous sample does not mean zero traffic.' });
    }
    return paginate(observations, offset, { range: data.range, coverage: data.coverage, candidateCount: candidates.length });
  }
  if (!current.crawl?.data || !pages.length) return { status: 'unavailable', reason: 'No crawled page evidence in this audit.' };
  if (facet === 'drift') {
    const older = previous.crawl?.data?.pages;
    if (!older?.length) return { status: 'unavailable', reason: 'Two completed audits with crawl evidence are required.' };
    const before = new Map(older.map(p => [p.url, p]));
    for (const p of pages) {
      const old = before.get(p.url);
      if (!old) { add(p, 'new-in-sample', p.url, 'New to this crawl sample, not proof of a newly published page.'); continue; }
      for (const key of ['status', 'title', 'description', 'canonical', 'robots', 'h1', 'schemaTypes'] as const) {
        if (JSON.stringify(old[key]) !== JSON.stringify(p[key])) add(p, 'changed-' + key, { before: old[key], after: p[key] }, 'Observed change between these two audit snapshots; assess intent and impact.');
      }
    }
    for (const p of older) if (!pages.some(n => n.url === p.url)) add(p, 'absent-from-sample', p.url, 'Not in the current sample. This does not establish deletion or deindexing.');
  }
  for (const p of pages) {
    if (facet === 'technical') {
      add(p, 'indexability-signals', { status: p.status, canonical: p.canonical, robots: p.robots, htmlIndexable: indexed(p) }, 'HTML signals only; actual Google index state requires URL Inspection.');
      if (p.canonical && absolute(p.canonical, p.url) !== p.url) add(p, 'alternate-canonical', p.canonical, 'Confirm that consolidation to this URL is intentional.');
      if (p.headings) for (let i = 1; i < p.headings.length; i++) if (p.headings[i].level > p.headings[i-1].level + 1) add(p, 'heading-level-gap', p.headings.slice(i-1,i+1), 'Review reading structure; not a direct ranking penalty.');
    }
    if (facet === 'schema') add(p, 'structured-data', { types: p.schemaTypes, blocks: p.structuredData ?? null }, 'JSON syntax and observed types only. Rich-result eligibility and factual accuracy still require review against the applicable Google feature documentation. Null blocks indicate an older audit.');
    if (facet === 'images') add(p, 'image-markup', { count: p.images, missingAlt: p.missingAlt, details: p.imageDetails ?? null }, 'Markup sample only. Empty alt can be intentional for decorative images. File sizes, visual quality and layout shift were not measured here.');
    if (facet === 'content') add(p, 'editorial-inventory', { title: p.title, description: p.description, wordCount: p.wordCount, headings: p.headings ?? null, schemaTypes: p.schemaTypes }, 'Inventory for editorial review, not an E-E-A-T score. Verify authorship, original experience and claims from the page text and business evidence.');
    if (facet === 'links') {
      const incoming = pages.filter(other => other.url !== p.url && other.internalLinks.includes(p.url)).map(other => other.url);
      const broken = p.internalLinks.filter(url => pages.some(target => target.url === url && target.status >= 400));
      add(p, 'internal-link-coverage', { incoming, outgoingCount: p.internalLinks.length, observedBrokenTargets: broken }, 'Links within this sample. Zero incoming links does not prove a site-wide orphan page. Uncrawled targets have unknown status.');
    }
    if (facet === 'international') {
      if (!p.alternates) { add(p, 'alternate-data-missing', null, 'Rerun the audit to collect alternate URLs.'); continue; }
      for (const alt of p.alternates) {
        if (!/^https?:\/\//i.test(alt.href)) add(p, 'non-absolute-hreflang', alt, 'Use a fully qualified alternate URL.');
        const target = pages.find(other => other.url === absolute(alt.href, p.url));
        if (!target) add(p, 'alternate-not-in-sample', alt, 'Reciprocity cannot be checked without the target page.');
        else if (target.alternates && !target.alternates.some(back => absolute(back.href,target.url) === p.url)) add(p, 'missing-return-alternate', alt, 'The sampled target does not link back to this page via hreflang.');
      }
      if (p.alternates.length && !p.alternates.some(alt => absolute(alt.href,p.url) === p.url)) add(p, 'missing-self-alternate', p.alternates, 'Include the current page alongside its language alternatives.');
    }
  }
  return paginate(observations, offset, { pagesExamined: pages.length, crawlLimit: current.crawl?.data?.limit, rendering: current.crawl?.data?.rendering }, facet === 'schema' || facet === 'images' ? 1 : 20);
}
function paginate(rows: Observation[], offset: number, coverage: Record<string, unknown>, size = 20) {
  const start = Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  return { status: 'available', method: 'deterministic-observations', coverage, total: rows.length, rows: rows.slice(start, start + size), nextOffset: start + size < rows.length ? start + size : null };
}
