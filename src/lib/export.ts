import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, ExternalHyperlink, type IRunOptions } from "docx";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import * as XLSX from "xlsx";

type Node = { type: string; value?: string; children?: Node[]; depth?: number; url?: string; alt?: string; ordered?: boolean; start?: number; checked?: boolean | null };
const parser = unified().use(remarkParse).use(remarkGfm);
const textOf = (node: Node): string => node.value ?? node.alt ?? node.children?.map(textOf).join("") ?? "";
const safeLink = (url: string) => /^(https?:\/\/|mailto:)/i.test(url);
function runs(node: Node, style: IRunOptions = {}): (TextRun | ExternalHyperlink)[] {
  if (node.type === "break") return [new TextRun({ break: 1 })];
  if (node.type === "link" && node.url && safeLink(node.url)) return [new ExternalHyperlink({ link: node.url, children: [new TextRun({ text: textOf(node), style: "Hyperlink" })] })];
  const next = { ...style, ...(node.type === "strong" ? { bold: true } : {}), ...(node.type === "emphasis" ? { italics: true } : {}), ...(node.type === "delete" ? { strike: true } : {}), ...(node.type === "inlineCode" ? { font: "Consolas" } : {}) };
  return node.children ? node.children.flatMap(child => runs(child, next)) : [new TextRun({ ...next, text: textOf(node) })];
}
function blocks(nodes: Node[], level = 0): (Paragraph | Table)[] {
  return nodes.flatMap(node => {
    if (node.type === "table") {
      const rows = (node.children ?? []).map((row, index) => new TableRow({
        tableHeader: index === 0,
        children: (row.children ?? []).map(cell => new TableCell({
          children: [new Paragraph({ children: runs(cell, { bold: index === 0 }) })],
        })),
      }));
      return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })];
    }
    if (node.type === "list") return (node.children ?? []).flatMap((item, index) => {
      const [first, ...rest] = item.children ?? [];
      const prefix = node.ordered ? `${(node.start ?? 1) + index}. ` : item.checked != null ? `${item.checked ? '☑' : '☐'} ` : "";
      return [new Paragraph({ children: [new TextRun(prefix), ...runs(first ?? { type: "text", value: "" })], ...(!node.ordered && item.checked == null ? { bullet: { level: Math.min(level, 8) } } : { indent: { left: 360 * (level + 1) } }) }), ...blocks(rest, level + 1)];
    });
    if (node.type === "blockquote") return (node.children ?? []).map(child => new Paragraph({ children: runs(child, { italics: true }), indent: { left: 360 } }));
    if (node.type === "code") return (node.value ?? "").split("\n").map(line => new Paragraph({ children: [new TextRun({ text: line || " ", font: "Consolas", size: 20 })], spacing: { after: 0 } }));
    if (node.type === "thematicBreak") return [new Paragraph({ text: "", spacing: { after: 200 } })];
    if (node.type === "definition") return [];
    const headings = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
    return [new Paragraph({ children: runs(node), ...(node.type === "heading" ? { heading: headings[(node.depth ?? 1) - 1] } : {}), spacing: { after: 160 } })];
  });
}
export async function exportDocument(content: string, format: "md" | "txt" | "docx" | "xlsx", locale: "en" | "fr" = "en") {
  if (format === "md") return { body: content, type: "text/markdown; charset=utf-8" };
  if (format === "txt") return { body: content, type: "text/plain; charset=utf-8" };
  const tree = parser.parse(content) as Node;
  if (format === "docx") return { body: new Uint8Array(await Packer.toBuffer(new Document({ sections: [{ children: blocks(tree.children ?? []) }] }))), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  const book = XLSX.utils.book_new();
  const rows = content.split("\n").map((text, i) => [String(i + 1), text]);
  const sheet = XLSX.utils.aoa_to_sheet([locale === "fr" ? ["Ligne", "Contenu exact du résultat"] : ["Line", "Exact result content"], ...rows]);
  sheet["!cols"] = [{ wch: 8 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(book, sheet, locale === "fr" ? "Résultat" : "Result");
  // Keep separate tables separate, parse escaped pipes correctly, never interpret formulas.
  let count = 0;
  function visit(node: Node) {
    if (node.type === "table") {
      const table = XLSX.utils.aoa_to_sheet((node.children ?? []).map(row => (row.children ?? []).map(textOf)));
      table["!cols"] = (node.children?.[0]?.children ?? []).map(() => ({ wch: 32 }));
      const name = locale === "fr" ? "Tableaux" : "Tables";
      XLSX.utils.book_append_sheet(book, table, count++ ? `${name} ${count}` : name);
    } else node.children?.forEach(visit);
  }
  visit(tree);
  return { body: new Uint8Array(XLSX.write(book, { bookType: "xlsx", type: "buffer" })), type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
}
