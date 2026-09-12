import { load } from "cheerio";
import robotsParser from "robots-parser";
import { publicFetch, publicUrl } from "./public-fetch";

export type PageEvidence = { url: string; status: number; title: string; description: string; h1: string[]; canonical: string; robots: string; wordCount: number; images: number; missingAlt: number; internalLinks: string[]; externalLinks: string[]; schemaTypes: string[]; hreflang: string[]; text: string;
  // Optional for compatibility with previously stored audits. Missing means unmeasured.
  language?: string; headings?: { level: number; text: string }[];
  alternates?: { language: string; href: string }[];
  structuredData?: { valid: boolean; json?: unknown }[];
  imageDetails?: { src: string; alt: string | null; width: string; height: string; loading: string }[];
  social?: { title: string; description: string; image: string };
};
export type CrawlEvidence = { pages: PageEvidence[]; errors: { url: string; reason: string }[]; robots: { status: number; text: string }; sitemap: { url: string; status: number } | null; limit: number; rendering: string; sitemapDocuments?: { url: string; status: number }[]; discoveredUrls?: number };
export function inspectHtml(url: string, html: string, status = 200, xRobots = ""): PageEvidence {
  const $ = load(html);
  const origin = new URL(url).origin;
  const links = $("a[href]").map((_, element) => { try { return new URL($(element).attr("href")!, url).href.split("#")[0]; } catch { return ""; } }).get().filter(href => href.startsWith("https://"));
  const schemaTypes: string[] = [];
  const structuredData: NonNullable<PageEvidence['structuredData']> = [];
  function walk(v: unknown) {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const record = v as Record<string, unknown>;
    if (record["@type"]) schemaTypes.push(...[record["@type"]].flat().filter((x): x is string => typeof x === "string"));
    if (record["@graph"]) walk(record["@graph"]);
  }
  $('script[type="application/ld+json"]').slice(0, 4).each((_, el) => { try {
    const raw = $(el).text();
    const json: unknown = JSON.parse(raw); walk(json);
    structuredData.push(raw.length <= 4000 ? { valid: true, json } : { valid: true });
  } catch { schemaTypes.push("JSON-LD invalide"); structuredData.push({ valid: false }); } });
  const evidence = {
    url, status, title: $("title").first().text().trim(), description: $('meta[name="description"]').attr("content") ?? "",
    h1: $("h1").map((_, el) => $(el).text().trim()).get(),
    canonical: $('link[rel="canonical" i]').attr("href") ?? "",
    robots: [$('meta[name="robots"]').attr("content") ?? "", xRobots].join(" "),
    images: $("img").length, missingAlt: $("img:not([alt])").length,
    internalLinks: [...new Set(links.filter(href => new URL(href).origin === origin))].slice(0, 200),
    externalLinks: [...new Set(links.filter(href => new URL(href).origin !== origin))].slice(0, 100),
    schemaTypes: [...new Set(schemaTypes)], hreflang: $("link[hreflang]").map((_, el) => $(el).attr("hreflang")!).get(),
    language: $('html').attr('lang') ?? '',
    headings: $('h1,h2,h3,h4,h5,h6').slice(0, 100).map((_, el) => ({ level: Number(el.tagName.slice(1)), text: $(el).text().trim().slice(0, 300) })).get(),
    alternates: $('link[hreflang]').slice(0, 100).map((_, el) => ({ language: $(el).attr('hreflang') ?? '', href: $(el).attr('href') ?? '' })).get(),
    structuredData,
    imageDetails: $('img').slice(0, 50).map((_, el) => ({ src: ($(el).attr('src') ?? '').slice(0, 1000), alt: $(el).attr('alt')?.slice(0, 300) ?? null, width: $(el).attr('width') ?? '', height: $(el).attr('height') ?? '', loading: $(el).attr('loading') ?? ($(el).attr('data-src') ? 'javascript' : 'unspecified') })).get(),
    social: { title: $('meta[property="og:title"]').attr('content') ?? '', description: $('meta[property="og:description"]').attr('content') ?? '', image: $('meta[property="og:image"]').attr('content') ?? '' },
  };
  $("script,style,noscript,svg,nav,footer").remove();
  const text = $("main").text().trim() || $("body").text();
  const normalized = text.replace(/\s+/g, " ").trim();
  return { ...evidence, wordCount: normalized ? normalized.split(/\s+/).length : 0, text: normalized.slice(0, 14000) };
}
export async function crawlSite(website: string, limit = 16): Promise<CrawlEvidence> {
  const deadline = Date.now() + 220000;
  const start = publicUrl(website);
  const robotsUrl = new URL("/robots.txt", start).href;
  const robots = await publicFetch(robotsUrl);
  if (robots.status === 429 || robots.status >= 500) throw new Error("robots.txt indisponible, crawl différé.");
  const parser = robotsParser(robotsUrl, robots.status === 200 ? robots.text : "");
  const urls = [start.href]; const seen = new Set<string>();
  const pages: PageEvidence[] = []; const errors: CrawlEvidence["errors"] = [];
  let sitemap: CrawlEvidence["sitemap"] = null;
  const sitemapDocuments: { url: string; status: number }[] = [];
  const sitemapQueue = [...parser.getSitemaps(), new URL("/sitemap.xml", start).href];
  const visitedSitemaps = new Set<string>();
  // At most three same-origin XML documents, including indexes, within the audit deadline.
  while (sitemapQueue.length && visitedSitemaps.size < 3 && Date.now() < deadline - 12000) {
    const sitemapUrl = sitemapQueue.shift()!;
    if (visitedSitemaps.has(sitemapUrl)) continue;
    visitedSitemaps.add(sitemapUrl);
    try {
      if (new URL(sitemapUrl).origin !== start.origin) continue;
      const result = await publicFetch(sitemapUrl);
      if (new URL(result.url).origin !== start.origin) continue;
      sitemapDocuments.push({ url: result.url, status: result.status });
      if (!sitemap || result.status === 200) sitemap = { url: result.url, status: result.status };
      if (result.status !== 200) continue;
      const parsed = inspectSitemap(result.text, start.origin);
      urls.push(...parsed.pages);
      sitemapQueue.push(...parsed.sitemaps);
    } catch { /* Keep other source results and the observed sitemap statuses. */ }
  }
  const discoveredUrls = new Set(urls).size;
  // Bounded breadth-first crawl. No browser JS and no unbounded sitemap expansion.
  while (urls.length && seen.size < limit && Date.now() < deadline - 12000) {
    const url = urls.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    if (parser.isAllowed(url, "BetterSEO") === false) { errors.push({ url, reason: "Interdit par robots.txt" }); continue; }
    try {
      const result = await publicFetch(url);
      if (new URL(result.url).origin !== start.origin) { errors.push({ url, reason: "Redirection vers un autre domaine : ajoutez l’URL finale au projet." }); continue; }
      if (!String(result.headers["content-type"] ?? "").includes("text/html")) { errors.push({ url, reason: "Réponse non HTML" }); continue; }
      const page = inspectHtml(result.url, result.text, result.status, String(result.headers["x-robots-tag"] ?? ""));
      pages.push(page);
      urls.push(...page.internalLinks.filter(href => !seen.has(href) && !/\.(pdf|png|jpg|zip|xml)(\?|$)/i.test(href) && !new URL(href).search).slice(0, limit));
    } catch { errors.push({ url, reason: "Page inaccessible, délai dépassé ou adresse non publique." }); }
  }
  return { pages, errors, sitemapDocuments, discoveredUrls, robots: { status: robots.status, text: robots.status === 200 ? robots.text.slice(0, 15000) : "" }, sitemap, limit, rendering: "HTML serveur uniquement, JavaScript non exécuté" };
}
export function technicalFindings(crawl: CrawlEvidence) {
  const findings: { category: string; title: string; description: string; impact: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL"; confidence: number; effort: number; evidence: { url: string; observed: string } }[] = [];
  for (const p of crawl.pages) {
    const add = (title: string, observed: string, impact: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" = "MEDIUM") =>
      findings.push({ category: "Technique", title, description: title + " sur " + p.url, impact, confidence: 1, effort: 1, evidence: { url: p.url, observed } });
    if (p.status >= 400) add("Page en erreur HTTP", String(p.status), "CRITICAL");
    if (!p.title) add("Balise title absente", "title vide", "HIGH");
    if (!p.description) add("Meta description absente", "description vide", "LOW");
    if (!p.h1.length) add("Titre principal H1 absent", "0 H1");
    if (!p.canonical) add("URL canonique non déclarée", "link canonical absent", "LOW");
    if (/noindex/i.test(p.robots)) add("Page exclue de l’indexation : intention à confirmer", p.robots, "HIGH");
    if (p.missingAlt) add("Images sans attribut alt", String(p.missingAlt) + " image(s)");
    if (p.schemaTypes.includes("JSON-LD invalide")) add("Données structurées illisibles", "Erreur de syntaxe JSON-LD");
  }
  const titles = new Map<string, string[]>();
  for (const p of crawl.pages) if (p.title) titles.set(p.title, [...(titles.get(p.title) ?? []), p.url]);
  for (const [title, urls] of titles) if (urls.length > 1) findings.push({ category: "On-page", title: "Title partagé par plusieurs pages", description: urls.join("\n"), impact: "MEDIUM", confidence: 1, effort: 2, evidence: { url: urls[0], observed: title } });
  return findings;
}

export function inspectSitemap(text: string, origin: string) {
  const xml = load(text, { xmlMode: true });
  const read = (selector: string) => xml(selector).slice(0, 5000).map((_, el) => xml(el).text().trim()).get().filter(value => {
    try { const url = publicUrl(value); return url.origin === origin; } catch { return false; }
  });
  return { pages: read('url > loc'), sitemaps: read('sitemap > loc') };
}
