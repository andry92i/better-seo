import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const paths = ['copywriting/SKILL.md', 'copywriting/references/copy-frameworks.md', 'copywriting/references/natural-transitions.md', 'humanizer/SKILL.md'];
const documents = [];
for (const id of paths) {
  const content = await readFile(`vendor/writing-skills/${id}`, 'utf8');
  documents.push({ id, content, sha256: createHash('sha256').update(content).digest('hex') });
}
await writeFile('src/lib/ai/writing-skills.json', JSON.stringify({ documents }));
