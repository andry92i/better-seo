import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, resolveLocale } from "./locale";
export default getRequestConfig(async () => {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(store.get(localeCookie)?.value, requestHeaders.get("accept-language"));
  return { locale, timeZone: "UTC", messages: (await import(`../../messages/${locale}.json`)).default };
});
