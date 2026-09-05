import { Document, Packer, Paragraph } from 'docx';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { readBoundedJson } from '@/lib/http';

export const runtime = 'nodejs';
const schema = z.object({
  format: z.enum(['md', 'docx', 'xlsx']),
  topic: z.string().max(100),
  content: z.string().min(1).max(50000),
});

export async function POST(request: Request) {
  let data;
  try { data = schema.parse(await readBoundedJson(request, 200000)); }
  catch { return Response.json({ error: 'Contenu absent, trop long ou format invalide.' }, { status: 400 }); }
  const filename = 'better-seo-' + (data.topic.replace(/[^a-z0-9-]/gi, '-').slice(0, 60) || 'rapport');
  const headers = { 'Content-Disposition': 'attachment; filename="' + filename + '.' + data.format + '"', 'Cache-Control': 'no-store' };
  if (data.format === 'docx') {
    const doc = new Document({ sections: [{ children: data.content.split('\n').map(text => new Paragraph(text)) }] });
    return new Response(new Uint8Array(await Packer.toBuffer(doc)), { headers: { ...headers, 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } });
  }
  if (data.format === 'xlsx') {
    // Explicit strings: formula-like user content must never become executable Excel formulas.
    const rows = data.content.split('\n').map((text, index) => [String(index + 1), text]);
    const sheet = XLSX.utils.aoa_to_sheet([['Ligne', 'Contenu exact du résultat'], ...rows]);
    sheet['!cols'] = [{ wch: 8 }, { wch: 110 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Résultat');
    return new Response(new Uint8Array(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })), { headers: { ...headers, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } });
  }
  return new Response(data.content, { headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' } });
}
