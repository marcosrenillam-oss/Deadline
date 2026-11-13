import {
  accuse,
  acceptPacket,
  answerPacket,
  decodeCode,
  emptyShare,
  encodeCode,
  exportBoard,
  invitePacket,
  mergeBoard,
  mergeShared,
  newId,
  newKey,
  proposePacket,
  reportPacket,
  sameAccusation,
  sessionPacket,
  shareSize,
  startInvestigation,
  unionShare,
  unshared,
  type CaseFile,
  type CaseRecord,
  type InvitePacket,
  type JointAccusation,
  type LocalProfile,
  type SharePayload,
} from '@deadline/core';
import { getDB } from '../storage/db.ts';
import { ensureProfile } from '../storage/profileRepo.ts';
import { loadCase } from './contentRepo.ts';
import { getInvestigation, saveInvestigation, settleCase } from './investigationRepo.ts';
import { draftNote, saveNote } from './notesRepo.ts';
import type { CoopSession } from './coopTypes.ts';

/**
 * COOPERATIVO SIN SERVIDOR (lógica de la app).
 *
 * Mesa compartida: dos investigaciones (A y B) en el mismo dispositivo; poner
 * algo sobre la mesa lo incorpora directamente a la investigación del otro.
 * Correspondencia: una investigación por dispositivo; todo viaja en códigos
 * DL1 firmados con la clave de la partida.
 */

export const otherRole = (r: 'A' | 'B'): 'A' | 'B' => (r === 'A' ? 'B' : 'A');

export async function listSessions(): Promise<CoopSession[]> {
  return (await (await getDB()).getAll('coopSessions')).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getSession(id: string): Promise<CoopSession | undefined> {
  return (await getDB()).get('coopSessions', id);
}

export async function saveSession(s: CoopSession): Promise<CoopSession> {
  const next = { ...s, updatedAt: Date.now() };
  await (await getDB()).put('coopSessions', next);
  return next;
}

function me(p: LocalProfile): { n: string; a?: string } {
  return p.alias ? { n: p.investigatorNumber, a: p.alias } : { n: p.investigatorNumber };
}

function baseSession(c: CaseFile, mode: CoopSession['mode'], now: number): CoopSession {
  return {
    id: newId(),
    caseId: c.id,
    contentVersion: c.contentVersion,
    mode,
    style: c.coop?.style ?? 'shared',
    status: 'pending',
    createdAt: now,
    investigationIds: {},
    sharedOut: emptyShare(),
    received: emptyShare(),
    seqOut: 0,
    seenSeqs: [],
    messages: [],
    updatedAt: now,
  };
}

/** Registra en el expediente los intentos cooperativos (para el archivo y las recompensas). */
async function touchRecord(c: CaseFile, invIds: string[], now: number): Promise<void> {
  const db = await getDB();
  const prev = await db.get('caseRecords', c.id);
  const rec: CaseRecord = {
    caseId: c.id,
    mode: c.mode,
    firstOpenedAt: prev?.firstOpenedAt ?? now,
    attempts: [...(prev?.attempts ?? []), ...invIds],
    status: prev?.status === 'solved' ? 'solved' : 'in-progress',
    bestScore: prev?.bestScore ?? 0,
    rewardedKeys: prev?.rewardedKeys ?? [],
    ...(prev?.solvedAt !== undefined ? { solvedAt: prev.solvedAt } : {}),
  };
  await db.put('caseRecords', rec);
}

// ─── Mesa compartida ─────────────────────────────────────────────────────────

export async function createSameDevice(c: CaseFile, now = Date.now()): Promise<CoopSession> {
  const s = baseSession(c, 'same-device', now);
  const ids: CoopSession['investigationIds'] = {};
  if (s.style === 'split') {
    for (const role of ['A', 'B'] as const) {
      const inv = startInvestigation(c, { id: newId(), now, role, coopSessionId: s.id });
      await saveInvestigation(inv);
      ids[role] = inv.id;
    }
  } else {
    const inv = startInvestigation(c, { id: newId(), now, coopSessionId: s.id });
    await saveInvestigation(inv);
    ids.shared = inv.id;
  }
  await touchRecord(c, Object.values(ids) as string[], now);
  return saveSession({ ...s, status: 'active', startedAt: now, investigationIds: ids, ...(s.style === 'split' ? { activeRole: 'A' as const } : {}) });
}

/** Pone sobre la mesa (mismo dispositivo): lo elegido pasa a la investigación del compañero. */
export async function shareOnTable(c: CaseFile, s: CoopSession, from: 'A' | 'B', payload: SharePayload, notes: string[], withBoard: boolean): Promise<number> {
  const mineId = s.investigationIds[from];
  const theirsId = s.investigationIds[otherRole(from)];
  if (!mineId || !theirsId) return 0;
  const [mine, theirs] = await Promise.all([getInvestigation(mineId), getInvestigation(theirsId)]);
  if (!mine || !theirs || theirs.status !== 'active') return 0;
  const now = Date.now();
  let next = mergeShared(c, theirs, payload, now, from).inv;
  if (withBoard) next = mergeBoard(next, exportBoard(mine));
  await saveInvestigation(next);
  for (const text of notes) await saveNote(draftNote({ caseId: c.id, kind: 'observation', text: `De ${from}: ${text}` }));
  return shareSize(payload) + notes.length;
}

// ─── Correspondencia ─────────────────────────────────────────────────────────

export async function createInvite(c: CaseFile, myRole: 'A' | 'B', now = Date.now()): Promise<CoopSession> {
  const profile = await ensureProfile();
  const s = baseSession(c, 'correspondence', now);
  const key = newKey();
  const packet: InvitePacket = { t: 'invite', sid: s.id, caseId: c.id, cv: c.contentVersion, hostRole: myRole, host: me(profile), key, at: now };
  const inviteCode = await encodeCode(packet);
  return saveSession({ ...s, myRole, host: true, key, me: me(profile), inviteCode });
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Lee una invitación sin aceptarla todavía (para mostrar el caso y los papeles). */
export async function readInvite(code: string): Promise<Result<{ invite: InvitePacket; c: CaseFile }>> {
  const r = await decodeCode(code);
  if (!r.ok) return r;
  const parsed = invitePacket.safeParse(r.value);
  if (!parsed.success) return { ok: false, error: 'Eso no es una invitación de DEADLINE.' };
  if (await getSession(parsed.data.sid)) return { ok: false, error: 'Ya tienes esta partida en tu teléfono.' };
  try {
    const c = await loadCase(parsed.data.caseId);
    if (c.contentVersion < parsed.data.cv) return { ok: false, error: 'Tu copia del expediente es más antigua que la de tu compañero. Actualiza la app.' };
    return { ok: true, value: { invite: parsed.data, c } };
  } catch {
    return { ok: false, error: 'Ese expediente no está en tu archivo. Actualiza la app o conéctate para descargarlo.' };
  }
}

/** El invitado acepta: su reloj empieza ya y genera el código de aceptación. */
export async function acceptInvite(invite: InvitePacket, c: CaseFile, now = Date.now()): Promise<CoopSession> {
  const profile = await ensureProfile();
  const myRole = otherRole(invite.hostRole);
  const inv = startInvestigation(c, { id: newId(), now, role: myRole, coopSessionId: invite.sid });
  await saveInvestigation(inv);
  await touchRecord(c, [inv.id], now);
  const acceptCode = await encodeCode(acceptPacket.parse({ t: 'accept', sid: invite.sid, guest: me(profile), startedAt: now }), invite.key);
  return saveSession({
    ...baseSession(c, 'correspondence', now),
    id: invite.sid,
    status: 'active',
    startedAt: now,
    myRole,
    host: false,
    key: invite.key,
    me: me(profile),
    partner: invite.host,
    acceptCode,
    investigationIds: { [myRole]: inv.id },
  });
}

/** El anfitrión importa la aceptación: su reloj se alinea con el del invitado. */
export async function completeHandshake(s: CoopSession, code: string): Promise<Result<CoopSession>> {
  if (!s.key || !s.myRole) return { ok: false, error: 'Partida incompleta.' };
  const r = await decodeCode(code, s.key);
  if (!r.ok) return r;
  const p = acceptPacket.safeParse(r.value);
  if (!p.success || p.data.sid !== s.id) return { ok: false, error: 'Ese no es el código de aceptación de esta partida.' };
  const c = await loadCase(s.caseId);
  const inv = startInvestigation(c, { id: newId(), now: p.data.startedAt, role: s.myRole, coopSessionId: s.id });
  await saveInvestigation(inv);
  await touchRecord(c, [inv.id], Date.now());
  return { ok: true, value: await saveSession({ ...s, status: 'active', startedAt: p.data.startedAt, partner: p.data.guest, investigationIds: { [s.myRole]: inv.id } }) };
}

export interface ReportSelection {
  share: SharePayload;
  notes: string[];
  message?: string;
  board: boolean;
}

/** Lo que aún no has compartido ni recibido. */
export async function pendingToShare(s: CoopSession, role: 'A' | 'B'): Promise<SharePayload> {
  const id = s.investigationIds[role];
  const inv = id ? await getInvestigation(id) : undefined;
  return inv ? unshared(inv, unionShare(s.sharedOut, s.received)) : emptyShare();
}

/** Genera un informe de campo para enviar al compañero. */
export async function buildReport(s: CoopSession, sel: ReportSelection): Promise<{ code: string; session: CoopSession }> {
  if (!s.key || !s.myRole) throw new Error('Partida incompleta.');
  const inv = await getInvestigation(s.investigationIds[s.myRole]!);
  const seq = s.seqOut + 1;
  const packet = reportPacket.parse({
    t: 'report',
    sid: s.id,
    seq,
    from: s.myRole,
    share: sel.share,
    notes: sel.notes,
    ...(sel.message ? { message: sel.message } : {}),
    ...(sel.board && inv ? { board: exportBoard(inv) } : {}),
    at: Date.now(),
  });
  const code = await encodeCode(packet, s.key);
  const messages = sel.message ? [...s.messages, { from: 'me' as const, text: sel.message, at: Date.now() }] : s.messages;
  return { code, session: await saveSession({ ...s, seqOut: seq, sharedOut: unionShare(s.sharedOut, sel.share), messages }) };
}

export interface Received {
  kind: 'report' | 'propose' | 'answer';
  added: number;
  message?: string;
  session: CoopSession;
}

/** Incorpora un código del compañero (informe, propuesta o respuesta). Idempotente. */
export async function receive(c: CaseFile, s: CoopSession, code: string): Promise<Result<Received>> {
  if (!s.key || !s.myRole) return { ok: false, error: 'Partida incompleta.' };
  const r = await decodeCode(code, s.key);
  if (!r.ok) return r;
  const p = sessionPacket.safeParse(r.value);
  if (!p.success || p.data.sid !== s.id) return { ok: false, error: 'Ese código no es de esta partida.' };
  const pk = p.data;
  if (pk.from === s.myRole) return { ok: false, error: 'Ese código lo generaste tú: envíaselo a tu compañero.' };
  if (s.seenSeqs.includes(pk.seq) && pk.t === 'report') return { ok: true, value: { kind: 'report', added: 0, session: s } };
  const invId = s.investigationIds[s.myRole]!;
  let inv = await getInvestigation(invId);
  if (!inv) return { ok: false, error: 'No encuentro tu investigación.' };
  let session: CoopSession = { ...s, seenSeqs: [...s.seenSeqs, pk.seq] };

  if (pk.t === 'report') {
    let added = 0;
    if (inv.status === 'active') {
      const m = mergeShared(c, inv, pk.share, Date.now(), pk.from);
      inv = m.inv;
      added = shareSize(m.result.added);
      if (pk.board) {
        const before = inv.board.nodes.length + inv.board.edges.length;
        inv = mergeBoard(inv, pk.board);
        added += inv.board.nodes.length + inv.board.edges.length - before;
      }
      await saveInvestigation(inv);
    }
    const who = s.partner?.a ?? s.partner?.n ?? pk.from;
    for (const text of pk.notes) await saveNote(draftNote({ caseId: c.id, kind: 'observation', text: `De ${who}: ${text}` }));
    session = {
      ...session,
      received: unionShare(session.received, pk.share),
      ...(pk.message ? { messages: [...session.messages, { from: 'partner' as const, text: pk.message, at: pk.at }] } : {}),
    };
    return { ok: true, value: { kind: 'report', added: added + pk.notes.length, ...(pk.message ? { message: pk.message } : {}), session: await saveSession(session) } };
  }
  if (pk.t === 'propose') {
    session = { ...session, proposal: { from: pk.from, accusation: pk.accusation, at: pk.at, status: 'pending' } };
    return { ok: true, value: { kind: 'propose', added: 0, session: await saveSession(session) } };
  }
  // answer
  const mine = s.proposal;
  if (!mine || mine.from !== s.myRole || !sameAccusation(mine.accusation, pk.accusation)) return { ok: false, error: 'Esa respuesta no corresponde a tu propuesta actual.' };
  if (!pk.agree) {
    session = { ...session, proposal: { ...mine, status: 'rejected' }, messages: [...session.messages, { from: 'partner', text: 'No estoy de acuerdo con la acusación.', at: pk.at }] };
    return { ok: true, value: { kind: 'answer', added: 0, session: await saveSession(session) } };
  }
  await settleMine(c, session, pk.accusation, pk.result);
  session = { ...session, proposal: { ...mine, status: 'agreed' }, status: 'closed' };
  return { ok: true, value: { kind: 'answer', added: 0, session: await saveSession(session) } };
}

// ─── Acusación conjunta ──────────────────────────────────────────────────────

async function record(caseId: string): Promise<CaseRecord> {
  const r = await (await getDB()).get('caseRecords', caseId);
  if (!r) throw new Error('Falta el registro del expediente');
  return r;
}

/** Correspondencia: cierra la investigación de este dispositivo con la acusación acordada. */
async function settleMine(c: CaseFile, s: CoopSession, a: JointAccusation, shared?: SharedResult): Promise<SharedResult | undefined> {
  const inv = await getInvestigation(s.investigationIds[s.myRole!]!);
  if (!inv || inv.status !== 'active') return undefined;
  const out = accuse(c, inv, await record(c.id), a, Date.now());
  let result = out.inv.result!;
  let points = out.result.total;
  if (shared) {
    // Mismo informe que el compañero que firmó. Las recompensas ya cobradas en
    // intentos anteriores de este dispositivo siguen sin volver a pagarse.
    const already = points === 0 && inv.attempt > 1;
    result = { ...result, score: shared.score, total: already ? 0 : shared.total, timelineAccuracy: shared.timelineAccuracy, falseEventsPlaced: shared.falseEventsPlaced };
    points = result.total;
  }
  await settleCase(c, { ...out.inv, result }, out.record, points);
  return { score: result.score, total: result.total, timelineAccuracy: result.timelineAccuracy, falseEventsPlaced: result.falseEventsPlaced };
}

type SharedResult = { score: Array<{ label: string; points: number }>; total: number; timelineAccuracy: number; falseEventsPlaced: string[] };

/** Mesa compartida: se puntúa una sola vez, con lo que sabe el equipo entero. */
async function settleTable(c: CaseFile, s: CoopSession, a: JointAccusation): Promise<void> {
  const ids = s.investigationIds;
  if (ids.shared) {
    const inv = await getInvestigation(ids.shared);
    if (!inv || inv.status !== 'active') return;
    const out = accuse(c, inv, await record(c.id), a, Date.now());
    await settleCase(c, out.inv, out.record, out.result.total);
    return;
  }
  const [ia, ib] = await Promise.all([getInvestigation(ids.A!), getInvestigation(ids.B!)]);
  if (!ia || !ib || ia.status !== 'active') return;
  const team = mergeShared(c, ia, unshared(ib, emptyShare()), Date.now(), 'B').inv;
  const out = accuse(c, team, await record(c.id), a, Date.now());
  await settleCase(c, out.inv, out.record, out.result.total);
  await saveInvestigation({ ...ib, status: out.inv.status, accusation: out.inv.accusation!, result: out.inv.result!, closedAt: out.inv.closedAt!, rev: ib.rev + 1, updatedAt: Date.now() });
}

/** Propone la acusación. En correspondencia devuelve el código para el compañero. */
export async function propose(s: CoopSession, from: 'A' | 'B', a: JointAccusation): Promise<{ session: CoopSession; code?: string }> {
  const proposal = { from, accusation: a, at: Date.now(), status: 'pending' as const };
  if (s.mode === 'same-device') return { session: await saveSession({ ...s, proposal }) };
  const code = await encodeCode(proposePacket.parse({ t: 'propose', sid: s.id, seq: s.seqOut + 1, from, accusation: a, at: proposal.at }), s.key);
  return { session: await saveSession({ ...s, proposal, seqOut: s.seqOut + 1, outbox: { code, label: 'Propuesta de acusación para tu compañero' } }), code };
}

/** Retira mi propuesta pendiente (p. ej. si el código no llegó): se puede volver a proponer. */
export async function withdraw(s: CoopSession): Promise<CoopSession> {
  if (!s.proposal || s.proposal.status !== 'pending') return s;
  const { proposal: _p, outbox: _o, ...rest } = s;
  return saveSession(rest);
}

/** Responde a la propuesta del compañero. Si se acepta, el expediente se cierra. */
export async function answer(c: CaseFile, s: CoopSession, agree: boolean): Promise<{ session: CoopSession; code?: string }> {
  const prop = s.proposal;
  if (!prop || prop.status !== 'pending') return { session: s };
  if (s.mode === 'same-device') {
    if (agree) await settleTable(c, s, prop.accusation);
    return { session: await saveSession({ ...s, proposal: { ...prop, status: agree ? 'agreed' : 'rejected' }, ...(agree ? { status: 'closed' as const } : {}) }) };
  }
  // Primero se cierra este lado: su informe viaja en el código para que el otro cierre igual.
  const result = agree ? await settleMine(c, s, prop.accusation) : undefined;
  const code = await encodeCode(
    answerPacket.parse({ t: 'answer', sid: s.id, seq: s.seqOut + 1, from: s.myRole, agree, accusation: prop.accusation, ...(result ? { result } : {}), at: Date.now() }),
    s.key,
  );
  return {
    session: await saveSession({
      ...s,
      seqOut: s.seqOut + 1,
      proposal: { ...prop, status: agree ? 'agreed' : 'rejected' },
      outbox: { code, label: agree ? 'Firma de la acusación: envíasela a tu compañero para cerrar su expediente' : 'Rechazo para tu compañero' },
      ...(agree ? { status: 'closed' as const } : {}),
    }),
    code,
  };
}
