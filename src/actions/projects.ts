"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/server-access";

export const updateFindingStatusAction = actionClient.inputSchema(z.object({
  findingId: z.string().min(1).max(100), status: z.enum(["OPEN", "DONE"]),
})).action(async ({ parsedInput }) => {
  const user = await requireUser(new Request(process.env.BETTER_AUTH_URL!, { headers: await headers() }), true);
  const finding = await db.finding.findFirst({ where: { id: parsedInput.findingId, audit: { project: { userId: user.id } } } });
  if (!finding) throw new HttpError(404, "Constat introuvable.");
  await db.finding.update({ where: { id: finding.id }, data: { status: parsedInput.status } });
  return { updated: true };
});
