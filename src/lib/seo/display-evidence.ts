// The full evidence remains in PostgreSQL for the agent. Keep dashboard payloads bounded.
export function displayEvidence(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  const trimSource = (source: unknown, key: string, size: number, stripText = false) => {
    const s = source as { data?: Record<string, unknown> } | undefined;
    if (!s?.data) return source;
    const rows = s.data[key] as Record<string, unknown>[] | undefined;
    return { ...s, data: { ...s.data, [key]: rows?.slice(0, size).map(row => stripText ? { ...row, text: undefined } : row), ...(key === "rows" ? { previous: undefined } : {}) } };
  };
  return {
    ...e, displayScope: "Extrait pour le tableau de bord. Preuves complètes conservées dans l’audit.",
    gsc: trimSource(e.gsc, "rows", 200), ga4: trimSource(e.ga4, "rows", 100),
    crawl: trimSource(e.crawl, "pages", 16, true),
    competitors: (e.competitors as { result: unknown }[] | undefined)?.map(c => ({ ...c, result: trimSource(c.result, "pages", 1, true) })),
  };
}
