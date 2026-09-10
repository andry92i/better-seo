export async function performanceReport(url: string) {
  const tasks = [
    ["PageSpeed", async () => {
      if (!process.env.GOOGLE_PAGESPEED_API_KEY) return { status: "unconfigured" };
      const params = new URLSearchParams({ url, strategy: "mobile", key: process.env.GOOGLE_PAGESPEED_API_KEY });
      const res = await fetch("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" + params + "&category=performance&category=seo&category=accessibility", { signal: AbortSignal.timeout(45000), cache: "no-store" });
      if (!res.ok) throw new Error("PageSpeed indisponible");
      const data = await res.json();
      return { status: "available", fetchedAt: data.analysisUTCTimestamp, categories: data.lighthouseResult?.categories, audits: Object.fromEntries(Object.entries(data.lighthouseResult?.audits ?? {}).filter(([id]) => ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "speed-index"].includes(id))), field: data.loadingExperience };
    }],
    ["CrUX", async () => {
      if (!process.env.GOOGLE_CRUX_API_KEY) return { status: "unconfigured" };
      const res = await fetch("https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" + encodeURIComponent(process.env.GOOGLE_CRUX_API_KEY), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: new URL(url).origin }),
        signal: AbortSignal.timeout(20000), cache: "no-store",
      });
      if (res.status === 404) return { status: "insufficient_traffic" };
      if (!res.ok) throw new Error("CrUX indisponible");
      return { status: "available", ...await res.json() };
    }],
  ] as const;
  return Promise.all(tasks.map(async ([source, run]) => { try { return { source, data: await run() }; } catch { return { source, data: { status: "unavailable" } }; } }));
}
