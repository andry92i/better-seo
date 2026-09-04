import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const actions = [
  { priority: 1, action: "Optimiser les pages en positions 8–20", impact: "Élevé", effort: "Moyen", owner: "SEO", deadline: "7 jours" },
  { priority: 2, action: "Consolider les pages en cannibalisation", impact: "Élevé", effort: "Moyen", owner: "Content", deadline: "14 jours" },
  { priority: 3, action: "Compléter les données structurées", impact: "Moyen", effort: "Faible", owner: "Dev", deadline: "7 jours" },
  { priority: 4, action: "Lancer une campagne de liens ciblée", impact: "Élevé", effort: "Élevé", owner: "Growth", deadline: "30 jours" },
];

function safeTopic(value: string | null) {
  return (value ?? "strategie-seo").replace(/[^a-z0-9-]/gi, "-").slice(0, 60);
}

function markdown(topic: string) {
  return [
    `# Rapport Better SEO — ${topic}`,
    "",
    "## Synthèse exécutive",
    "",
    "L’analyse recommande de concentrer le prochain sprint sur les pages déjà visibles en positions 8–20, puis de résoudre la cannibalisation et les données structurées.",
    "",
    "## Plan d’action",
    "",
    ...actions.map((item) => `${item.priority}. **${item.action}** — impact ${item.impact}, effort ${item.effort}, responsable ${item.owner}, délai ${item.deadline}.`),
    "",
    "> Démonstration avec données simulées. Connectez GSC et GA4 avant toute décision de production.",
  ].join("\n");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "md";
  const topic = safeTopic(url.searchParams.get("topic"));
  const filename = `better-seo-${topic}`;

  if (format === "docx") {
    const document = new Document({ sections: [{ children: [
      new Paragraph({ text: `Rapport Better SEO — ${topic}`, heading: HeadingLevel.TITLE }),
      new Paragraph({ text: "Synthèse exécutive", heading: HeadingLevel.HEADING_1 }),
      new Paragraph("Priorisez les pages en positions 8–20, corrigez la cannibalisation et complétez les données structurées."),
      new Paragraph({ text: "Plan d’action", heading: HeadingLevel.HEADING_1 }),
      ...actions.map((item) => new Paragraph({ text: `${item.priority}. ${item.action} — impact ${item.impact}, effort ${item.effort}, responsable ${item.owner}.`, bullet: { level: 0 } })),
    ] }] });
    const buffer = await Packer.toBuffer(document);
    return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${filename}.docx"` } });
  }

  if (format === "xlsx") {
    const sheet = XLSX.utils.json_to_sheet(actions.map((item) => ({ Priorité: item.priority, Action: item.action, Impact: item.impact, Effort: item.effort, Responsable: item.owner, Délai: item.deadline })));
    sheet["!cols"] = [{ wch: 10 }, { wch: 48 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Plan SEO");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
    return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${filename}.xlsx"` } });
  }

  return new Response(markdown(topic), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.md"` } });
}
