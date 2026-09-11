import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, resolveLocale, isLocale } from "./locale";
export default getRequestConfig(async () => {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  const publicLocale = requestHeaders.get("x-better-seo-public-locale");
  const locale = isLocale(publicLocale) ? publicLocale : resolveLocale(store.get(localeCookie)?.value, requestHeaders.get("accept-language"));
  return { locale, timeZone: "UTC", messages: (await import(`../../messages/${locale}.json`)).default };
});
