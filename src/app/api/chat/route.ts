import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";

export const runtime = "nodejs";

const report = [
  "## Stratégie recommandée",
  "",
  "### 1. Priorité immédiate — gains rapides",
  "",
  "Optimisez d’abord les pages qui génèrent déjà des impressions en positions **8 à 20**. C’est le segment où une amélioration on-page produit généralement le retour le plus rapide.",
  "",
  "- Réaligner le title sur l’intention dominante",
  "- Renforcer les premiers 150 mots avec une réponse directe",
  "- Ajouter 3 à 5 liens internes depuis les pages fortes",
  "- Consolider les pages qui se cannibalisent",
  "",
  "### 2. Preuves à suivre",
  "",
  "| Signal | Situation | Cible |",
  "|---|---:|---:|",
  "| CTR moyen | 1,4 % | 2,5 % |",
  "| Position moyenne | 14,2 | < 10 |",
  "| Pages concernées | 14 | 14 optimisées |",
  "",
  "### 3. Plan d’exécution",
  "",
  "**Cette semaine :** corriger les métadonnées, le maillage et les données structurées.",
  "",
  "**Sous 30 jours :** publier les pages manquantes du cluster et obtenir les premiers liens pertinents.",
  "",
  "**Sous 90 jours :** mesurer les cohortes de pages, conserver ce qui progresse et retravailler le reste.",
  "",
  "> Confiance : élevée. Cette démonstration utilise des données simulées; connectez GSC et GA4 pour obtenir les URLs, requêtes et estimations propres au projet.",
].join("\n");

export async function POST(request: Request) {
  const body = await request.json() as { messages?: UIMessage[]; action?: string };
  const stream = createUIMessageStream<UIMessage>({
    originalMessages: body.messages,
    async execute({ writer }) {
      const id = crypto.randomUUID();
      writer.write({ type: "text-start", id });
      const chunks = report.match(/.{1,48}(?:\s|$)/g) ?? [report];
      for (const delta of chunks) {
        writer.write({ type: "text-delta", id, delta });
        await new Promise((resolve) => setTimeout(resolve, 12));
      }
      writer.write({ type: "text-end", id });
      writer.setOutcome({ status: "completed" });
    },
    onError: () => "La simulation n’a pas pu produire le rapport.",
  });
  return createUIMessageStreamResponse({ stream });
}
