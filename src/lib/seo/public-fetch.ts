import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";

export function publicUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("Seules les URL publiques HTTPS sont autorisées.");
  if (!url.hostname.includes(".") || /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname)) throw new Error("Adresse non publique.");
  url.hash = "";
  return url;
}
export function isPublicAddress(value: string) {
  try { return ipaddr.process(value).range() === "unicast"; } catch { return false; }
}
// Pin the verified address to the socket: DNS rebinding cannot reach private services.
export async function publicFetch(value: string, redirects = 0, deadline = Date.now() + 12000): Promise<{ url: string; status: number; headers: Record<string, string | string[] | undefined>; text: string }> {
  if (Date.now() >= deadline) throw new Error("Délai de lecture dépassé.");
  const url = publicUrl(value);
  let dnsTimer: ReturnType<typeof setTimeout> | undefined;
  const addresses = await Promise.race([
    lookup(url.hostname, { all: true }),
    new Promise<never>((_, reject) => { dnsTimer = setTimeout(() => reject(new Error("Délai DNS dépassé.")), Math.max(1, deadline - Date.now())); }),
  ]).finally(() => clearTimeout(dnsTimer));
  if (!addresses.length || addresses.some(a => !isPublicAddress(a.address))) throw new Error("Adresse réseau non publique.");
  const address = addresses[0];
  const response = await new Promise<{ status: number; headers: Record<string, string | string[] | undefined>; text: string }>((resolve, reject) => {
    const req = request(url, {
      lookup: (_hostname, options, cb) => options.all ? cb(null, [address]) : cb(null, address.address, address.family),
      headers: { "User-Agent": "BetterSEO/1.0 (SEO audit)", Accept: "text/html,application/xml,text/plain", "Accept-Encoding": "identity" },
    }, res => {
      const chunks: Buffer[] = []; let size = 0;
      res.on("data", (chunk: Buffer) => { size += chunk.length; if (size > 2000000) { res.destroy(); reject(new Error("Page trop volumineuse.")); } else chunks.push(chunk); });
      res.on("error", reject);
      res.on("end", () => resolve({ status: res.statusCode ?? 502, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") }));
    });
    const timer = setTimeout(() => req.destroy(new Error("Délai de lecture dépassé.")), Math.max(1, deadline - Date.now()));
    req.on("close", () => clearTimeout(timer));
    req.on("error", reject); req.end();
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 4 || typeof response.headers.location !== "string") throw new Error("Redirections excessives.");
    return publicFetch(new URL(response.headers.location, url).href, redirects + 1, deadline);
  }
  return { url: url.href, ...response };
}
