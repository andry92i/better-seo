import { serverCopy } from "@/i18n/server-copy";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { RequestBodyError } from "@/lib/http";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function requireUser(request: Request, mutation = false) {
  if (mutation) {
    const origin = request.headers.get("origin");
    const expected = process.env.BETTER_AUTH_URL;
    if (!origin || !expected || origin !== new URL(expected).origin) {
      throw new HttpError(403, "Origine refusée. Ouvrez l’application sur son URL officielle.");
    }
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new HttpError(401, "Connectez-vous pour accéder à votre projet.");
  return session.user;
}
export async function ownedProject(userId: string, id: string) {
  const project = await db.project.findFirst({ where: { id, userId }, include: { competitors: true } });
  if (!project) throw new HttpError(404, "Projet introuvable.");
  return project;
}
export async function apiError(error: unknown) {
  const copy = await serverCopy();
  if (error instanceof RequestBodyError) return Response.json({ error: copy("Corps de requête absent, invalide ou trop volumineux.") }, { status: 400 });
  if (error instanceof HttpError) return Response.json({ error: copy(error.message) }, { status: error.status });
  if (error instanceof z.ZodError) return Response.json({ error: copy("Vérifiez les champs du formulaire.") }, { status: 400 });
  // Never expose upstream messages, database URLs or OAuth tokens.
  console.error("better-seo request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: copy("Service indisponible. Réessayez dans un instant.") }, { status: 503 });
}

