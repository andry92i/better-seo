import { useTranslations } from "next-intl";
import sourceKeys from "./source-keys.json";
/** Bridge for existing method labels. Never translate customer-authored content. */
export function useCopy() {
  const t = useTranslations("ui");
  return (source: string) => {
    const key = sourceKeys[source as keyof typeof sourceKeys];
    return key ? t(key) : source;
  };
}
