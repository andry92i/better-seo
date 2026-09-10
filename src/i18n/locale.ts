export const locales = ["en", "fr"] as const;
export type Locale = typeof locales[number];
export const localeCookie = "better-seo-locale";
export function isLocale(value: unknown): value is Locale { return value === "en" || value === "fr"; }
/** Explicit choice wins. Match browser preferences by quality, then source order. */
export function resolveLocale(override?: string, acceptLanguage?: string | null): Locale {
  if (isLocale(override)) return override;
  const preferences = (acceptLanguage ?? "").slice(0,4096).split(",").map((entry,index) => {
    const [tag,...parameters] = entry.trim().toLowerCase().split(";");
    const quality = parameters.find(p=>p.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return {language: tag.split("-")[0], q, index};
  }).filter(p=>Number.isFinite(p.q)&&p.q>0&&p.q<=1).sort((a,b)=>b.q-a.q||a.index-b.index);
  return preferences.find(p=>isLocale(p.language))?.language as Locale ?? "en";
}
