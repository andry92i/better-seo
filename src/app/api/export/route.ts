import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/locale";
import { z } from "zod";
import { readBoundedJson } from "@/lib/http";
import { requireUser, apiError } from "@/lib/server-access";
import { exportDocument } from "@/lib/export";
export const runtime = "nodejs";
const schema = z.object({ format:z.enum(["md","txt","docx","xlsx"]), topic:z.string().max(100), content:z.string().min(1).max(50000) });
export async function POST(request: Request) {
  try { await requireUser(request, true); } catch (e) { return apiError(e); }
  const locale = await getLocale() as Locale;
  let data;
  try { data = schema.parse(await readBoundedJson(request, 200000)); }
  catch { return Response.json({error:locale === "fr" ? "Contenu absent, trop long ou format invalide." : "Content is missing, too long or in an invalid format."},{status:400}); }
  try {
    const file = await exportDocument(data.content, data.format, locale);
    const name = "better-seo-" + (data.topic.replace(/[^a-z0-9-]/gi,"-").slice(0,60)||"rapport") + "." + data.format;
    return new Response(file.body, {headers:{"Content-Type":file.type,"Content-Disposition":'attachment; filename="'+name+'"',"Cache-Control":"private, no-store"}});
  } catch (e) { return apiError(e); }
}

