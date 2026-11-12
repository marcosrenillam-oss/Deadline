import {
  CRIME_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  ERA_LABELS,
  EVIDENCE_KIND_LABELS,
  ORIGIN_LABELS,
  lineIndex,
  plainText,
  type CaseFile,
  type StatementRef,
} from '@deadline/core';

export { CRIME_CATEGORY_LABELS, DIFFICULTY_LABELS, ERA_LABELS, EVIDENCE_KIND_LABELS, ORIGIN_LABELS };

export function characterName(c: CaseFile, id: string): string {
  return c.characters.find((x) => x.id === id)?.name ?? id;
}

export function evidenceTitle(c: CaseFile, id: string): string {
  return c.evidence.find((x) => x.id === id)?.title ?? id;
}

const lineCache = new WeakMap<CaseFile, ReturnType<typeof lineIndex>>();
export function lines(c: CaseFile): ReturnType<typeof lineIndex> {
  let m = lineCache.get(c);
  if (!m) lineCache.set(c, (m = lineIndex(c)));
  return m;
}

/** Texto legible de una afirmación (para el selector de contradicciones y el informe). */
export function statementLabel(c: CaseFile, ref: StatementRef): { who: string; text: string } {
  if ('line' in ref) {
    const l = lines(c).get(ref.line);
    const who = l?.characterId ? characterName(c, l.characterId) : l?.evidenceId ? evidenceTitle(c, l.evidenceId) : '';
    return { who, text: l ? plainText(l.line.text) : ref.line };
  }
  if ('evidence' in ref) return { who: 'Documento', text: evidenceTitle(c, ref.evidence) };
  if ('fact' in ref) return { who: 'Hecho', text: c.facts.find((f) => f.id === ref.fact)?.text ?? ref.fact };
  const d = c.evidence.flatMap((e) => e.details).find((x) => x.id === ref.detail);
  return { who: 'Detalle', text: d?.label ?? ref.detail };
}

export function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${m} min ${String(s).padStart(2, '0')} s`;
}
