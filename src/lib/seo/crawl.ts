import { load } from "cheerio";
import robotsParser from "robots-parser";
import { publicFetch, publicUrl } from "./public-fetch";

export type PageEvidence = { url: string; status: number; title: string; description: string; h1: string[]; canonical: string; robots: string; wordCount: number; images: number; missingAlt: number; internalLinks: string[]; externalLinks: string[]; schemaTypes: string[]; hreflang: string[]; text: string };
export type CrawlEvidence = { pages: PageEvidence[]; errors: { url: string; reason: string }[]; robots: { status: number; text: string }; sitemap: { url: string; status: number } | null; limit: number; rendering: string };
export function inspectHtml(url: string, html: string, status = 200, xRobots = ""): PageEvidence {
  const $ = load(html);
  const origin = new URL(url).origin;
  const links = $("a[href]").map((_, element) => { try { return new URL($(element).attr("href")!, url).href.split("#")[0]; } catch { return ""; } }).get().filter(href => href.startsWith("https://"));
  const schemaTypes: string[] = [];
  function walk(v: unknown) {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const record = v as Record<string, unknown>;
    if (record["@type"]) schemaTypes.push(...[record["@type"]].flat().filter((x): x is string => typeof x === "string"));
    if (record["@graph"]) walk(record["@graph"]);
  }
  $('script[type="application/ld+json"]').each((_, el) => { try { walk(JSON.parse($(el).text())); } catch { schemaTypes.push("JSON-LD invalide"); } });
  const evidence = {
    url, status, title: $("title").first().text().trim(), description: $('meta[name="description"]').attr("content") ?? "",
    h1: $("h1").map((_, el) => $(el).text().trim()).get(),
    canonical: $('link[rel="canonical" i]').attr("href") ?? "",
    robots: [$('meta[name="robots"]').attr("content") ?? "", xRobots].join(" "),
    images: $("img").length, missingAlt: $("img:not([alt])").length,
    internalLinks: [...new Set(links.filter(href => new URL(href).origin === origin))].slice(0, 200),
    externalLinks: [...new Set(links.filter(href => new URL(href).origin !== origin))].slice(0, 100),
    schemaTypes: [...new Set(schemaTypes)], hreflang: $("link[hreflang]").map((_, el) => $(el).attr("hreflang")!).get(),
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
  const sitemapUrl = parser.getSitemaps()[0] ?? new URL("/sitemap.xml", start).href;
  try {
    if (new URL(sitemapUrl).origin !== start.origin) throw new Error("Sitemap externe.");
    const result = await publicFetch(sitemapUrl);
    sitemap = { url: sitemapUrl, status: result.status };
    if (result.status === 200) {
      const xml = load(result.text, { xmlMode: true });
      xml("url > loc").each((_, el) => { const href = xml(el).text().trim(); try { if (new URL(href).origin === start.origin) urls.push(href); } catch {} });
    }
  } catch { sitemap = null; }
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
  return { pages, errors, robots: { status: robots.status, text: robots.status === 200 ? robots.text.slice(0, 15000) : "" }, sitemap, limit, rendering: "HTML serveur uniquement, JavaScript non exécuté" };
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
