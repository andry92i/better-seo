export function parseBacklinks(csv: string) {
  // RFC 4180 quoting, French semicolon exports, UTF-8 BOM.
  const text = csv.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/)[0];
  const separator = first.includes(";") ? ";" : ",";
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (c === separator && !quoted) { row.push(value); value = ""; }
    else if (c === "\n" && !quoted) { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += c;
  }
  if (value || row.length) rows.push([...row, value]);
  if (quoted || rows.length < 2) throw new Error("CSV invalide");
  const domains = new Set<string>();
  for (const cells of rows.slice(1)) for (const cell of cells) {
    try { const url = new URL(cell.trim().includes("://") ? cell.trim() : "https://" + cell.trim()); if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) domains.add(url.hostname.toLowerCase()); } catch {}
  }
  return { importedAt: new Date().toISOString(), source: "Import utilisateur du rapport Liens GSC, non vérifié automatiquement", headers: rows[0], rows: rows.slice(1, 5001), domainCount: domains.size, domains: [...domains].slice(0, 5000), truncated: rows.length > 5001, coverage: "Export partiel. Les domaines peuvent désigner des sources ou des cibles selon le rapport importé. Aucun score d’autorité calculé." };
}
