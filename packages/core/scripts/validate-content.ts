/**
 * Valida todos los expedientes de /content/cases/<ID>/case.json.
 * Uso: npm run validate:content   (sale con código 1 si hay errores)
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { validateCase } from '../src/case/validate.ts';

const root = resolve(import.meta.dirname, '../../../content/cases');

async function main(): Promise<void> {
  let dirs: string[] = [];
  try {
    dirs = (await readdir(root)).filter((d) => !d.startsWith('.'));
  } catch {
    console.log(`No existe ${root}`);
  }
  let failed = 0;
  let checked = 0;
  for (const dir of dirs.sort()) {
    const file = join(root, dir, 'case.json');
    try {
      await stat(file);
    } catch {
      continue;
    }
    checked++;
    const report = validateCase(JSON.parse(await readFile(file, 'utf8')));
    if (report.caseId !== dir) report.errors.push({ path: 'id', message: `El directorio ${dir} no coincide con el id ${report.caseId}` });
    const ok = report.errors.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? '✔' : '✘'} ${dir}  (${report.errors.length} errores, ${report.warnings.length} avisos)`);
    for (const e of report.errors) console.log(`   error  ${e.path}: ${e.message}`);
    for (const w of report.warnings) console.log(`   aviso  ${w.path}: ${w.message}`);
  }
  console.log(`\n${checked} expedientes revisados, ${failed} con errores.`);
  if (failed > 0) process.exit(1);
}

await main();
