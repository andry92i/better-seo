import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import * as XLSX from "xlsx";
export async function exportDocument(content: string, format: "md" | "docx" | "xlsx") {
  if (format === "md") return { body: content, type: "text/markdown; charset=utf-8" };
  if (format === "docx") {
    const headings = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3];
    const paragraphs = content.split("\n").map(text => {
      const heading = /^(#{1,3})\s+(.+)$/.exec(text);
      if (heading) return new Paragraph({ text: heading[2], heading: headings[heading[1].length - 1] });
      if (/^[-*] /.test(text)) return new Paragraph({ text: text.slice(2), bullet: { level: 0 } });
      return new Paragraph(text);
    });
    return { body: new Uint8Array(await Packer.toBuffer(new Document({sections:[{children:paragraphs}]}))), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }
  const book = XLSX.utils.book_new();
  const rows = content.split("\n").map((text, i) => [String(i+1), text]);
  const sheet = XLSX.utils.aoa_to_sheet([["Ligne", "Contenu exact du résultat"], ...rows]);
  sheet["!cols"] = [{wch:8}, {wch:110}];
  XLSX.utils.book_append_sheet(book, sheet, "Résultat");
  // Markdown tables also become usable spreadsheet columns. All content stays literal.
  const tableRows = content.split("\n").filter(line => /^\s*\|/.test(line) && !/^\s*\|[\s:|-]+$/.test(line))
    .map(line => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim()));
  if (tableRows.length) XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(tableRows), "Tableaux");
  return { body: new Uint8Array(XLSX.write(book, {bookType:"xlsx",type:"buffer"})), type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
}
