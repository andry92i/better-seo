import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Compile the pinned, reviewed submodule. Never fetch or execute upstream scripts.
const root = path.resolve('vendor/claude-seo');
const documents = [];
async function walk(directory) {
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink refused: ${relative}`);
    if (entry.isDirectory()) await walk(relative);
    else if (entry.name.endsWith('.md')) {
      const content = await readFile(path.join(root, relative), 'utf8');
      documents.push({ id: relative, content, sha256: createHash('sha256').update(content).digest('hex') });
    }
  }
}
for (const directory of ['skills', 'agents', 'docs', 'extensions']) await walk(directory);
const metadata = JSON.parse(await readFile(path.join(root, '.claude-plugin/plugin.json'), 'utf8'));
const revision = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const license = await readFile(path.join(root, 'LICENSE'), 'utf8');
await mkdir('src/lib/claude-seo/generated', { recursive: true });
await writeFile('src/lib/claude-seo/generated/knowledge.json', JSON.stringify({ version: metadata.version, revision, repository: metadata.repository, license, documents }));
console.log(`Claude SEO ${metadata.version}: ${documents.length} documents, revision ${revision}`);
