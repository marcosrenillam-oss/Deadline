import {
  applyEffects,
  collectConditionRefs,
  emptyKnowledge,
  evaluateCondition,
  type Condition,
  type Effect,
  type Knowledge,
} from './conditions.ts';
import { caseFileSchema, type CaseFile, type StatementRef } from './schema.ts';

/**
 * Validación de expedientes en tres capas:
 *  1. Esquema (forma de los datos) con zod.
 *  2. Integridad referencial y reglas de diseño (ids únicos, referencias
 *     existentes, coherencia de modo, finales de reserva…).
 *  3. Resolubilidad: simulación de un investigador exhaustivo que comprueba
 *     que la solución es alcanzable solo con lo que el caso ofrece.
 *
 * Ningún expediente se publica con errores. Los avisos se revisan a mano.
 */

export interface Issue {
  path: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  caseId: string | undefined;
  errors: Issue[];
  warnings: Issue[];
  /** Expediente normalizado (con valores por defecto) si el esquema es válido. */
  data?: CaseFile;
}

export function validateCase(input: unknown): ValidationReport {
  const parsed = caseFileSchema.safeParse(input);
  const caseId = typeof input === 'object' && input !== null && 'id' in input ? String((input as { id: unknown }).id) : undefined;
  if (!parsed.success) {
    return {
      ok: false,
      caseId,
      errors: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      warnings: [],
    };
  }
  const c = parsed.data;
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  checkIntegrity(c, errors, warnings);
  if (errors.length === 0) checkSolvability(c, errors, warnings);
  return { ok: errors.length === 0, caseId: c.id, errors, warnings, data: c };
}

// ─── Integridad ──────────────────────────────────────────────────────────────

type Kind =
  | 'character'
  | 'location'
  | 'relationship'
  | 'fact'
  | 'evidence'
  | 'detail'
  | 'deduction'
  | 'contradiction'
  | 'secret'
  | 'interrogation'
  | 'topic'
  | 'question'
  | 'line'
  | 'event'
  | 'motive'
  | 'method'
  | 'ending'
  | 'hint'
  | 'objective'
  | 'asset';

function buildIndex(c: CaseFile, errors: Issue[]): Map<string, Kind> {
  const index = new Map<string, Kind>();
  const add = (id: string, kind: Kind, path: string) => {
    const prev = index.get(id);
    if (prev) errors.push({ path, message: `Identificador duplicado "${id}" (ya usado como ${prev})` });
    else index.set(id, kind);
  };
  c.characters.forEach((x, i) => add(x.id, 'character', `characters.${i}`));
  c.locations.forEach((x, i) => add(x.id, 'location', `locations.${i}`));
  c.relationships.forEach((x, i) => add(x.id, 'relationship', `relationships.${i}`));
  c.facts.forEach((x, i) => add(x.id, 'fact', `facts.${i}`));
  c.evidence.forEach((x, i) => {
    add(x.id, 'evidence', `evidence.${i}`);
    x.details.forEach((d, j) => add(d.id, 'detail', `evidence.${i}.details.${j}`));
    x.body.forEach((b, j) => {
      if (b.type === 'quote' && b.lineId) add(b.lineId, 'line', `evidence.${i}.body.${j}`);
    });
  });
  c.deductions.forEach((x, i) => add(x.id, 'deduction', `deductions.${i}`));
  c.contradictions.forEach((x, i) => add(x.id, 'contradiction', `contradictions.${i}`));
  c.secrets.forEach((x, i) => add(x.id, 'secret', `secrets.${i}`));
  c.interrogations.forEach((it, i) => {
    add(it.id, 'interrogation', `interrogations.${i}`);
    it.opening.forEach((l, j) => l.id && add(l.id, 'line', `interrogations.${i}.opening.${j}`));
    it.topics.forEach((tp, j) => {
      add(tp.id, 'topic', `interrogations.${i}.topics.${j}`);
      tp.questions.forEach((q, k) => {
        add(q.id, 'question', `interrogations.${i}.topics.${j}.questions.${k}`);
        q.responses.forEach((r, m) =>
          r.lines.forEach((l, n) => l.id && add(l.id, 'line', `interrogations.${i}.topics.${j}.questions.${k}.responses.${m}.lines.${n}`)),
        );
      });
    });
  });
  c.timeline.forEach((x, i) => add(x.id, 'event', `timeline.${i}`));
  c.accusation.motives.forEach((x, i) => add(x.id, 'motive', `accusation.motives.${i}`));
  c.accusation.methods.forEach((x, i) => add(x.id, 'method', `accusation.methods.${i}`));
  c.endings.forEach((x, i) => add(x.id, 'ending', `endings.${i}`));
  c.hints.forEach((x, i) => add(x.id, 'hint', `hints.${i}`));
  c.objectives.forEach((x, i) => add(x.id, 'objective', `objectives.${i}`));
  c.assets.forEach((x, i) => add(x.id, 'asset', `assets.${i}`));
  return index;
}

const CONDITION_KIND: Record<string, Kind> = {
  fact: 'fact',
  evidence: 'evidence',
  examined: 'evidence',
  detail: 'detail',
  contradiction: 'contradiction',
  secret: 'secret',
  asked: 'question',
};

function checkIntegrity(c: CaseFile, errors: Issue[], warnings: Issue[]): void {
  const index = buildIndex(c, errors);
  const expect = (id: string | undefined, kind: Kind | Kind[], path: string) => {
    if (id === undefined) return;
    const kinds = Array.isArray(kind) ? kind : [kind];
    const actual = index.get(id);
    if (!actual) errors.push({ path, message: `Referencia inexistente "${id}" (se esperaba ${kinds.join(' o ')})` });
    else if (!kinds.includes(actual)) errors.push({ path, message: `"${id}" es ${actual}, se esperaba ${kinds.join(' o ')}` });
  };

  const flagsSet = new Set<string>();
  const flagsRead: Array<{ flag: string; path: string }> = [];
  const checkCondition = (cond: Condition | undefined, path: string) => {
    for (const ref of collectConditionRefs(cond)) {
      if (ref.kind === 'flag') flagsRead.push({ flag: ref.id, path });
      else {
        const kind = CONDITION_KIND[ref.kind];
        if (kind) expect(ref.id, kind, path);
      }
    }
  };
  const checkEffects = (effects: readonly Effect[], path: string) => {
    effects.forEach((e, i) => {
      const p = `${path}.${i}`;
      if ('grantFact' in e) expect(e.grantFact, 'fact', p);
      else if ('grantEvidence' in e) expect(e.grantEvidence, 'evidence', p);
      else if ('revealSecret' in e) expect(e.revealSecret, 'secret', p);
      else if ('unlockTimelineEvent' in e) expect(e.unlockTimelineEvent, 'event', p);
      else if ('setFlag' in e) flagsSet.add(e.setFlag);
    });
  };
  const checkStatement = (ref: StatementRef, path: string) => {
    if ('evidence' in ref) expect(ref.evidence, 'evidence', path);
    else if ('line' in ref) expect(ref.line, 'line', path);
    else if ('fact' in ref) expect(ref.fact, 'fact', path);
    else expect(ref.detail, 'detail', path);
  };

  // Modo, origen y metadatos
  const modeLetter = { individual: 'I', daily: 'D', coop: 'C' }[c.mode];
  if (c.id.charAt(3) !== modeLetter) errors.push({ path: 'id', message: `El identificador ${c.id} no corresponde al modo ${c.mode} (${modeLetter})` });
  if (c.mode === 'daily' && c.dailyIndex === undefined) errors.push({ path: 'dailyIndex', message: 'Un expediente diario necesita dailyIndex' });
  if (c.mode !== 'daily' && c.dailyIndex !== undefined) errors.push({ path: 'dailyIndex', message: 'Solo los diarios llevan dailyIndex' });
  if (c.mode === 'coop' && !c.coop) errors.push({ path: 'coop', message: 'Un expediente cooperativo necesita el bloque coop' });
  if (c.mode !== 'coop' && c.coop) errors.push({ path: 'coop', message: 'Solo los cooperativos llevan bloque coop' });
  if (c.origin === 'real' && !c.historical) errors.push({ path: 'historical', message: 'Un caso inspirado en hechos reales debe separar hechos documentados, hipótesis y recreación' });
  if (c.origin !== 'real' && c.historical) warnings.push({ path: 'historical', message: 'Bloque historical en un caso que no es de origen real' });
  if (c.origin === 'linked' && c.links.length === 0) errors.push({ path: 'links', message: 'Un expediente vinculado debe enlazar al menos un caso' });
  c.links.forEach((l, i) => {
    if (l.caseId === c.id) errors.push({ path: `links.${i}`, message: 'Un expediente no puede enlazarse a sí mismo' });
    checkCondition(l.revealedWhen, `links.${i}.revealedWhen`);
  });
  const splitCoop = c.coop?.style === 'split';
  c.evidence.forEach((e, i) => {
    if (e.holder && !splitCoop) errors.push({ path: `evidence.${i}.holder`, message: 'holder solo se usa en cooperativos de información dividida' });
    if (splitCoop && !e.holder) errors.push({ path: `evidence.${i}.holder`, message: 'En información dividida cada evidencia debe indicar su receptor (A, B o both)' });
  });
  c.interrogations.forEach((it, i) => {
    if (it.holder && !splitCoop) errors.push({ path: `interrogations.${i}.holder`, message: 'holder solo se usa en cooperativos de información dividida' });
  });

  // Briefing
  expect(c.briefing.victim, 'character', 'briefing.victim');
  c.briefing.initialFacts.forEach((x, i) => expect(x, 'fact', `briefing.initialFacts.${i}`));
  c.briefing.initialEvidence.forEach((x, i) => expect(x, 'evidence', `briefing.initialEvidence.${i}`));
  c.briefing.initialTimeline.forEach((x, i) => expect(x, 'event', `briefing.initialTimeline.${i}`));
  if (c.briefing.initialEvidence.length === 0) warnings.push({ path: 'briefing.initialEvidence', message: 'El expediente no entrega ninguna evidencia inicial' });

  // Personajes, lugares, relaciones, secretos
  c.characters.forEach((ch, i) => {
    expect(ch.portrait, 'asset', `characters.${i}.portrait`);
    checkCondition(ch.appearsWhen, `characters.${i}.appearsWhen`);
    checkCondition(ch.motive?.visibleWhen, `characters.${i}.motive.visibleWhen`);
    checkCondition(ch.alibi?.visibleWhen, `characters.${i}.alibi.visibleWhen`);
  });
  if (!c.characters.some((ch) => ch.role === 'suspect')) errors.push({ path: 'characters', message: 'No hay ningún sospechoso' });
  c.locations.forEach((l, i) => {
    expect(l.asset, 'asset', `locations.${i}.asset`);
    checkCondition(l.appearsWhen, `locations.${i}.appearsWhen`);
  });
  c.relationships.forEach((r, i) => {
    expect(r.a, 'character', `relationships.${i}.a`);
    expect(r.b, 'character', `relationships.${i}.b`);
    if (r.a === r.b) errors.push({ path: `relationships.${i}`, message: 'Relación de un personaje consigo mismo' });
    checkCondition(r.visibleWhen, `relationships.${i}.visibleWhen`);
  });
  c.secrets.forEach((s, i) => {
    expect(s.characterId, 'character', `secrets.${i}.characterId`);
    checkCondition(s.revealedWhen, `secrets.${i}.revealedWhen`);
  });
  c.facts.forEach((f, i) => checkCondition(f.derivedWhen, `facts.${i}.derivedWhen`));

  // Evidencias
  c.evidence.forEach((e, i) => {
    const p = `evidence.${i}`;
    expect(e.asset, 'asset', `${p}.asset`);
    e.related.characters.forEach((x, j) => expect(x, 'character', `${p}.related.characters.${j}`));
    e.related.locations.forEach((x, j) => expect(x, 'location', `${p}.related.locations.${j}`));
    e.related.events.forEach((x, j) => expect(x, 'event', `${p}.related.events.${j}`));
    checkEffects(e.onExamine, `${p}.onExamine`);
    checkCondition(e.autoDiscoverWhen, `${p}.autoDiscoverWhen`);
    e.body.forEach((b, j) => {
      if (b.type === 'image') expect(b.asset, 'asset', `${p}.body.${j}.asset`);
      if (b.type === 'redacted') checkCondition(b.revealedWhen, `${p}.body.${j}.revealedWhen`);
    });
    e.details.forEach((d, j) => {
      checkCondition(d.requires, `${p}.details.${j}.requires`);
      checkEffects(d.effects, `${p}.details.${j}.effects`);
      if (d.region && !e.asset) warnings.push({ path: `${p}.details.${j}.region`, message: 'Detalle con región pero la evidencia no tiene imagen' });
      if (d.region && (d.region.x + d.region.w > 1 || d.region.y + d.region.h > 1))
        errors.push({ path: `${p}.details.${j}.region`, message: 'La región se sale de la imagen' });
    });
    if (e.body.length === 0 && !e.asset) errors.push({ path: p, message: 'Evidencia sin contenido (ni cuerpo ni imagen)' });
  });

  c.deductions.forEach((d, i) => {
    d.combine.forEach((x, j) => expect(x, ['evidence', 'detail', 'fact'], `deductions.${i}.combine.${j}`));
    if (new Set(d.combine).size !== d.combine.length) errors.push({ path: `deductions.${i}.combine`, message: 'Piezas repetidas' });
    checkEffects(d.effects, `deductions.${i}.effects`);
  });
  c.contradictions.forEach((x, i) => {
    checkStatement(x.a, `contradictions.${i}.a`);
    checkStatement(x.b, `contradictions.${i}.b`);
    checkEffects(x.effects, `contradictions.${i}.effects`);
  });

  // Interrogatorios
  c.interrogations.forEach((it, i) => {
    const p = `interrogations.${i}`;
    expect(it.characterId, 'character', `${p}.characterId`);
    checkCondition(it.availableWhen, `${p}.availableWhen`);
    it.topics.forEach((tp, j) => {
      expect(tp.about, 'character', `${p}.topics.${j}.about`);
      checkCondition(tp.availableWhen, `${p}.topics.${j}.availableWhen`);
      tp.questions.forEach((q, k) => {
        const qp = `${p}.topics.${j}.questions.${k}`;
        checkCondition(q.requires, `${qp}.requires`);
        if (q.kind === 'present') {
          if (!q.presentEvidence) errors.push({ path: qp, message: 'Una pregunta "present" debe indicar presentEvidence' });
          expect(q.presentEvidence, 'evidence', `${qp}.presentEvidence`);
        }
        if (q.kind === 'contradiction') {
          if (!q.contradiction) errors.push({ path: qp, message: 'Una pregunta "contradiction" debe indicar la contradicción' });
          expect(q.contradiction, 'contradiction', `${qp}.contradiction`);
        }
        const last = q.responses[q.responses.length - 1];
        if (last && last.when !== undefined) errors.push({ path: `${qp}.responses`, message: 'La última variante de respuesta debe ser incondicional' });
        q.responses.forEach((r, m) => {
          checkCondition(r.when, `${qp}.responses.${m}.when`);
          checkEffects(r.effects, `${qp}.responses.${m}.effects`);
        });
      });
    });
  });
  const suspectIds = new Set(c.characters.filter((ch) => ch.role === 'suspect').map((ch) => ch.id));
  for (const sid of suspectIds) {
    if (!c.interrogations.some((it) => it.characterId === sid)) warnings.push({ path: 'interrogations', message: `El sospechoso ${sid} no tiene interrogatorio` });
  }

  // Cronología
  c.timeline.forEach((ev, i) => {
    const p = `timeline.${i}`;
    ev.characters.forEach((x, j) => expect(x, 'character', `${p}.characters.${j}`));
    expect(ev.location, 'location', `${p}.location`);
    ev.evidence.forEach((x, j) => expect(x, 'evidence', `${p}.evidence.${j}`));
    expect(ev.claimedBy, 'character', `${p}.claimedBy`);
    checkCondition(ev.autoUnlockWhen, `${p}.autoUnlockWhen`);
    if (ev.veracity === 'false' && !ev.claimedBy) warnings.push({ path: p, message: 'Evento falso sin indicar quién lo afirma' });
  });
  if (!c.timeline.some((ev) => ev.key && ev.veracity === 'true')) errors.push({ path: 'timeline', message: 'La cronología verdadera no tiene eventos clave' });

  // Acusación y solución
  const accusable = new Set(c.accusation.suspects ?? [...suspectIds]);
  c.accusation.suspects?.forEach((x, i) => expect(x, 'character', `accusation.suspects.${i}`));
  c.accusation.motives.forEach((m, i) => checkCondition(m.availableWhen, `accusation.motives.${i}.availableWhen`));
  c.accusation.methods.forEach((m, i) => checkCondition(m.availableWhen, `accusation.methods.${i}.availableWhen`));
  c.solution.culprits.forEach((x, i) => {
    expect(x, 'character', `solution.culprits.${i}`);
    if (!accusable.has(x)) errors.push({ path: `solution.culprits.${i}`, message: `El culpable ${x} no está entre los acusables` });
  });
  expect(c.solution.motive, 'motive', 'solution.motive');
  expect(c.solution.method, 'method', 'solution.method');
  c.solution.proof.forEach((x, i) => expect(x, 'evidence', `solution.proof.${i}`));
  c.solution.decisiveEvidence.forEach((x, i) => expect(x, 'evidence', `solution.decisiveEvidence.${i}`));
  c.solution.alibiTruths.forEach((x, i) => expect(x.characterId, 'character', `solution.alibiTruths.${i}.characterId`));
  for (const proofId of c.solution.proof) {
    const ev = c.evidence.find((e) => e.id === proofId);
    if (ev && !ev.decisive) warnings.push({ path: 'solution.proof', message: `${proofId} es prueba aceptada pero no está marcada como decisive` });
  }

  // Finales
  c.endings.forEach((en, i) => {
    const w = en.when;
    if (w.culprit && w.culprit !== 'correct' && w.culprit !== 'incorrect') expect(w.culprit, 'character', `endings.${i}.when.culprit`);
    checkCondition(w.knowledge, `endings.${i}.when.knowledge`);
  });
  const fallback = c.endings[c.endings.length - 1];
  if (fallback && Object.keys(fallback.when).length > 0) errors.push({ path: 'endings', message: 'El último final debe ser de reserva (sin condiciones)' });
  if (!c.endings.some((en) => en.outcome === 'success')) errors.push({ path: 'endings', message: 'No hay final de éxito' });
  if (!c.endings.some((en) => en.outcome === 'failure')) errors.push({ path: 'endings', message: 'No hay final de fracaso' });

  // Pistas y objetivos
  c.hints.forEach((h, i) => checkCondition(h.relevantWhen, `hints.${i}.relevantWhen`));
  if (c.maxHints > 0 && c.hints.length === 0) errors.push({ path: 'maxHints', message: 'maxHints > 0 pero no hay líneas de pista' });
  c.objectives.forEach((o, i) => checkCondition(o.completeWhen, `objectives.${i}.completeWhen`));

  // Marcas que se leen pero nunca se activan
  for (const { flag, path } of flagsRead) {
    if (!flagsSet.has(flag)) errors.push({ path, message: `La marca "${flag}" se consulta pero ningún efecto la activa` });
  }

  // Recursos sin uso
  const usedAssets = new Set<string>();
  c.characters.forEach((x) => x.portrait && usedAssets.add(x.portrait));
  c.locations.forEach((x) => x.asset && usedAssets.add(x.asset));
  c.evidence.forEach((e) => {
    if (e.asset) usedAssets.add(e.asset);
    e.body.forEach((b) => b.type === 'image' && usedAssets.add(b.asset));
  });
  c.assets.forEach((a, i) => {
    if (a.kind === 'image' && !usedAssets.has(a.id)) warnings.push({ path: `assets.${i}`, message: `Recurso ${a.id} sin usar` });
  });
}

// ─── Resolubilidad ───────────────────────────────────────────────────────────

/**
 * Simula a un investigador que lo examina, pregunta y relaciona todo lo que
 * tiene a su alcance hasta que no puede avanzar más. Devuelve el conocimiento
 * máximo alcanzable y las líneas de diálogo escuchadas.
 *
 * Es una sobreaproximación: las condiciones `not` se consideran superables
 * (el jugador puede elegir el orden de sus acciones).
 */
export function exploreReachable(c: CaseFile): { knowledge: Knowledge; lines: Set<string>; unreachedQuestions: string[] } {
  let k = applyEffects(emptyKnowledge(), [
    ...c.briefing.initialFacts.map((x) => ({ grantFact: x })),
    ...c.briefing.initialEvidence.map((x) => ({ grantEvidence: x })),
    ...c.briefing.initialTimeline.map((x) => ({ unlockTimelineEvent: x })),
  ]);
  const lines = new Set<string>();
  const holds = (cond: Condition | undefined) => evaluateCondition(relaxNot(cond), k);
  const evidenceById = new Map(c.evidence.map((e) => [e.id, e]));

  for (let guard = 0; guard < 1000; guard++) {
    const before = knowledgeSize(k) + lines.size;
    const pending: Effect[] = [];

    for (const f of c.facts) if (f.derivedWhen && holds(f.derivedWhen)) pending.push({ grantFact: f.id });
    for (const s of c.secrets) if (s.revealedWhen && holds(s.revealedWhen)) pending.push({ revealSecret: s.id });
    for (const ev of c.timeline) if (ev.autoUnlockWhen && holds(ev.autoUnlockWhen)) pending.push({ unlockTimelineEvent: ev.id });
    for (const e of c.evidence) if (e.autoDiscoverWhen && holds(e.autoDiscoverWhen)) pending.push({ grantEvidence: e.id });

    const examinedNow: string[] = [];
    for (const evId of k.evidence) {
      const e = evidenceById.get(evId);
      if (!e) continue;
      examinedNow.push(evId);
      pending.push(...e.onExamine);
      e.body.forEach((b) => b.type === 'quote' && b.lineId && lines.add(b.lineId));
      for (const d of e.details) if (holds(d.requires)) {
        pending.push(...d.effects);
        (k.details as Set<string>).add(d.id);
      }
    }
    const askedNow: string[] = [];
    for (const it of c.interrogations) {
      const subject = c.characters.find((ch) => ch.id === it.characterId);
      if (!holds(it.availableWhen) || !holds(subject?.appearsWhen)) continue;
      it.opening.forEach((l) => l.id && lines.add(l.id));
      for (const tp of it.topics) {
        if (!holds(tp.availableWhen)) continue;
        for (const q of tp.questions) {
          if (!holds(q.requires)) continue;
          if (q.presentEvidence && !k.evidence.has(q.presentEvidence)) continue;
          if (q.contradiction && !k.contradictions.has(q.contradiction)) continue;
          askedNow.push(q.id);
          for (const r of q.responses) {
            if (!holds(r.when)) continue;
            pending.push(...r.effects);
            r.lines.forEach((l) => l.id && lines.add(l.id));
          }
        }
      }
    }
    const known = (ref: StatementRef) =>
      'evidence' in ref ? k.evidence.has(ref.evidence) : 'line' in ref ? lines.has(ref.line) : 'fact' in ref ? k.facts.has(ref.fact) : k.details.has(ref.detail);
    const contradictionsNow: string[] = [];
    for (const x of c.contradictions) if (known(x.a) && known(x.b)) {
      contradictionsNow.push(x.id);
      pending.push(...x.effects);
    }
    for (const d of c.deductions) {
      const ok = d.combine.every((p) => k.evidence.has(p) || k.details.has(p) || k.facts.has(p));
      if (ok) pending.push(...d.effects);
    }

    k = applyEffects(k, pending);
    const mutable = k as Record<keyof Knowledge, Set<string>>;
    examinedNow.forEach((x) => mutable.examined.add(x));
    askedNow.forEach((x) => mutable.asked.add(x));
    contradictionsNow.forEach((x) => mutable.contradictions.add(x));

    if (knowledgeSize(k) + lines.size === before) break;
  }

  const unreachedQuestions = c.interrogations.flatMap((it) => it.topics.flatMap((tp) => tp.questions.map((q) => q.id))).filter((q) => !k.asked.has(q));
  return { knowledge: k, lines, unreachedQuestions };
}

function checkSolvability(c: CaseFile, errors: Issue[], warnings: Issue[]): void {
  const { knowledge: k, unreachedQuestions } = exploreReachable(c);
  const holds = (cond: Condition | undefined) => evaluateCondition(relaxNot(cond), k);

  for (const cid of c.solution.culprits) {
    const ch = c.characters.find((x) => x.id === cid);
    if (ch && !holds(ch.appearsWhen)) errors.push({ path: 'solution.culprits', message: `El culpable ${cid} nunca llega a aparecer en la investigación` });
  }
  const motive = c.accusation.motives.find((m) => m.id === c.solution.motive);
  if (motive && !holds(motive.availableWhen)) errors.push({ path: 'solution.motive', message: 'El motivo correcto nunca llega a estar disponible' });
  const method = c.accusation.methods.find((m) => m.id === c.solution.method);
  if (method && !holds(method.availableWhen)) errors.push({ path: 'solution.method', message: 'El método correcto nunca llega a estar disponible' });
  if (!c.solution.proof.some((p) => k.evidence.has(p))) errors.push({ path: 'solution.proof', message: 'Ninguna prueba definitiva es alcanzable' });
  for (const d of c.solution.decisiveEvidence) if (!k.evidence.has(d)) warnings.push({ path: 'solution.decisiveEvidence', message: `La evidencia decisiva ${d} no es alcanzable` });

  for (const e of c.evidence) if (!k.evidence.has(e.id)) warnings.push({ path: `evidence`, message: `La evidencia ${e.id} no es alcanzable` });
  for (const f of c.facts) if (!k.facts.has(f.id)) warnings.push({ path: 'facts', message: `El hecho ${f.id} no es alcanzable` });
  for (const s of c.secrets) if (!k.secrets.has(s.id)) warnings.push({ path: 'secrets', message: `El secreto ${s.id} no es alcanzable` });
  for (const x of c.contradictions) if (!k.contradictions.has(x.id)) warnings.push({ path: 'contradictions', message: `La contradicción ${x.id} no es detectable` });
  for (const ev of c.timeline) if (ev.key && !k.timelineEvents.has(ev.id)) warnings.push({ path: 'timeline', message: `El evento clave ${ev.id} nunca se desbloquea` });
  for (const o of c.objectives) if (!holds(o.completeWhen)) warnings.push({ path: 'objectives', message: `El objetivo ${o.id} no es completable` });
  for (const q of unreachedQuestions) warnings.push({ path: 'interrogations', message: `La pregunta ${q} nunca está disponible` });
}

/** Sustituye `not X` por "cierto" para la sobreaproximación de alcanzabilidad. */
function relaxNot(cond: Condition | undefined): Condition | undefined {
  if (cond === undefined) return undefined;
  if ('not' in cond) return undefined;
  if ('all' in cond) return { all: cond.all.map((x) => relaxNot(x) ?? TRUE) };
  if ('any' in cond) return { any: cond.any.map((x) => relaxNot(x) ?? TRUE) };
  if ('atLeast' in cond) return { atLeast: cond.atLeast, of: cond.of.map((x) => relaxNot(x) ?? TRUE) };
  return cond;
}
const TRUE: Condition = { all: [{ not: { flag: '__never__' } }] };

function knowledgeSize(k: Knowledge): number {
  return k.facts.size + k.evidence.size + k.examined.size + k.details.size + k.contradictions.size + k.secrets.size + k.asked.size + k.flags.size + k.timelineEvents.size;
}
