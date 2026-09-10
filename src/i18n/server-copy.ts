import { getTranslations } from "next-intl/server";
import sourceKeys from "./source-keys.json";
export async function serverCopy() {
  const t = await getTranslations("ui");
  return (source: string) => {
    const key = sourceKeys[source as keyof typeof sourceKeys];
    return key ? t(key) : source;
  };
}
