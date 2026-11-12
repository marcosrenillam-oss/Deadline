/**
 * Compila los expedientes de /content/cases:
 *  1. Importa cada case.ts (fuente tipada) y genera sus recursos (generate.ts).
 *  2. Calcula tamaño y SHA-256 de cada recurso y los escribe en el manifiesto.
 *  3. Valida el expediente (esquema, integridad, resolubilidad).
 *  4. Escribe content/cases/<ID>/case.json y publica en apps/web/public/content:
 *     catalog.json + cases/<ID>/{case.json, recursos}.
 *
 * Uso: node --experimental-strip-types scripts/build-content.ts
 * Sale con código 1 si algún expediente tiene errores.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateCase } from '../packages/core/src/case/validate.ts';
import { toCatalogEntry, type CaseFileInput } from '../packages/core/src/case/schema.ts';

const root = resolve(import.meta.dirname, '..');
const casesDir = join(root, 'content/cases');
const publicDir = join(root, 'apps/web/public/content');

const sha256 = (buf: Buffer | string) => createHash('sha256').update(buf).digest('hex');

async function main(): Promise<void> {
  rmSync(publicDir, { recursive: true, force: true });
  mkdirSync(join(publicDir, 'cases'), { recursive: true });
  const catalog = [];
  let failed = 0;
  const dirs = existsSync(casesDir) ? readdirSync(casesDir).filter((d) => /^DL-[IDC]-\d{4}$/.test(d)).sort() : [];
  for (const id of dirs) {
    const dir = join(casesDir, id);
    const source = join(dir, 'case.ts');
    if (!existsSync(source)) continue;
    const mod = (await import(pathToFileURL(source).href)) as { default: CaseFileInput };
    const data = structuredClone(mod.default);
    const out = join(publicDir, 'cases', id);
    mkdirSync(out, { recursive: true });

    const generator = join(dir, 'generate.ts');
    const generated: Record<string, string> = existsSync(generator)
      ? ((await import(pathToFileURL(generator).href)) as { generateAssets: () => Record<string, string> }).generateAssets()
      : {};
    for (const [name, content] of Object.entries(generated)) writeFileSync(join(dir, name), content);

    for (const asset of data.assets ?? []) {
      const file = join(dir, asset.src);
      if (!existsSync(file)) {
        console.log(`✘ ${id}: falta el recurso ${asset.src}`);
        failed++;
        continue;
      }
      const buf = readFileSync(file);
      asset.bytes = buf.length;
      asset.sha256 = sha256(buf);
      copyFileSync(file, join(out, asset.src));
    }

    const report = validateCase(data);
    const ok = report.ok;
    if (!ok) failed++;
    console.log(`${ok ? '✔' : '✘'} ${id}  ${report.errors.length} errores · ${report.warnings.length} avisos`);
    for (const e of report.errors) console.log(`   error  ${e.path}: ${e.message}`);
    for (const w of report.warnings) console.log(`   aviso  ${w.path}: ${w.message}`);
    if (!ok || !report.data) continue;

    const json = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(join(dir, 'case.json'), json);
    writeFileSync(join(out, 'case.json'), json);
    catalog.push({ ...toCatalogEntry(report.data), sha256: sha256(json) });
  }
  writeFileSync(join(publicDir, 'catalog.json'), JSON.stringify({ generatedAt: new Date().toISOString(), cases: catalog }, null, 2));
  console.log(`\n${catalog.length} expedientes publicados en apps/web/public/content${failed ? ` · ${failed} con errores` : ''}.`);
  if (failed) process.exit(1);
}

await main();
