import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { SHARE_KEYS, emptyShare, knowledgeShare, plainText, shareSize, unionShare, unshared, type Note, type SharePayload, type ShareKey } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { buildReport, otherRole, receive, saveSession, shareOnTable } from '../../cases/coopRepo.ts';
import { getInvestigation } from '../../cases/investigationRepo.ts';
import { listNotes } from '../../cases/notesRepo.ts';
import { lines } from '../../cases/labels.ts';
import type { CoopSession } from '../../cases/coopTypes.ts';
import { Sheet } from '../../ui/Sheet.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { CodeBox, PasteBox } from './CodeBox.tsx';
import s from './coop.module.css';

const CATEGORY: Record<ShareKey, string> = {
  evidence: 'Documentos y pruebas',
  details: 'Detalles advertidos',
  facts: 'Hechos establecidos',
  lines: 'Declaraciones',
  timeline: 'Fichas de cronología',
  deductions: 'Deducciones',
  contradictions: 'Contradicciones',
  secrets: 'Secretos',
  flags: 'Marcas',
};

interface Props {
  open: boolean;
  onClose: () => void;
  session: CoopSession;
  setSession: (s: CoopSession) => void;
  lastCode: { code: string; label: string } | null;
  onPass: () => void;
}

/**
 * PANEL DE PAREJA. Mesa compartida: poner cosas sobre la mesa y pasar el
 * turno. Correspondencia: preparar informes de campo, recibir los del
 * compañero, mensajes y propuestas de acusación.
 */
export function CoopPanel({ open, onClose, session, setSession, lastCode, onPass }: Props) {
  const { c, inv, refresh, notify, base, closed } = useCase();
  const navigate = useNavigate();
  const role = inv?.role;
  const same = session.mode === 'same-device';
  const [pending, setPending] = useState<SharePayload>(emptyShare());
  const [picked, setPicked] = useState<Record<ShareKey, boolean>>(() => Object.fromEntries(SHARE_KEYS.map((k) => [k, true])) as Record<ShareKey, boolean>);
  const [board, setBoard] = useState(true);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Qué hay por compartir: lo que yo sé y el compañero (o el canal) aún no.
  useEffect(() => {
    if (!open || !inv) return;
    void (async () => {
      if (same && role) {
        const theirs = await getInvestigation(session.investigationIds[otherRole(role)]!);
        setPending(theirs ? unshared(inv, knowledgeShare(theirs)) : emptyShare());
      } else {
        setPending(unshared(inv, unionShare(session.sharedOut, session.received)));
        setNotes(await listNotes(c.id));
      }
    })();
  }, [open, inv, same, role, session, c.id]);

  const names = useMemo(() => {
    const idx = lines(c);
    return {
      evidence: (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id,
      details: (id: string) => c.evidence.flatMap((e) => e.details).find((d) => d.id === id)?.label ?? id,
      facts: (id: string) => c.facts.find((f) => f.id === id)?.text ?? id,
      lines: (id: string) => `«${plainText(idx.get(id)?.line.text ?? id)}»`,
      timeline: (id: string) => c.timeline.find((t) => t.id === id)?.title ?? id,
      deductions: (id: string) => c.deductions.find((d) => d.id === id)?.title ?? id,
      contradictions: (id: string) => c.contradictions.find((x) => x.id === id)?.title ?? id,
      secrets: (id: string) => c.secrets.find((x) => x.id === id)?.text ?? id,
      flags: (id: string) => id,
    } satisfies Record<ShareKey, (id: string) => string>;
  }, [c]);

  const selection = (): SharePayload => {
    const out = emptyShare();
    for (const k of SHARE_KEYS) if (picked[k] || k === 'flags') out[k] = pending[k];
    return out;
  };

  const putOnTable = async () => {
    if (!role) return;
    const n = await shareOnTable(c, session, role, selection(), [], board);
    sound.play('paper');
    haptic('confirm');
    notify('info', n ? `Has puesto ${n} elementos sobre la mesa para ${otherRole(role)}.` : 'No había nada nuevo que compartir.');
    setPending(emptyShare());
  };

  const makeReport = async () => {
    setError(null);
    const out = await buildReport(session, {
      share: selection(),
      notes: notes.filter((n) => noteIds.includes(n.id)).map((n) => n.text).filter(Boolean),
      ...(message.trim() ? { message: message.trim() } : {}),
      board,
    });
    setSession(out.session);
    setReport(out.code);
    setMessage('');
    setNoteIds([]);
    sound.play('key');
  };

  const onReceive = async (code: string) => {
    setError(null);
    const r = await receive(c, session, code);
    if (!r.ok) return setError(r.error);
    setSession(r.value.session);
    await refresh();
    sound.play('stamp');
    haptic('confirm');
    if (r.value.kind === 'report') notify('info', r.value.added ? `Informe recibido: ${r.value.added} elementos nuevos.` : 'Informe recibido: nada nuevo.');
    if (r.value.kind === 'propose') {
      notify('info', 'Tu compañero propone una acusación.');
      onClose();
      void navigate(`${base}/acusacion`);
    }
    if (r.value.kind === 'answer') {
      if (r.value.session.status === 'closed') {
        onClose();
        void navigate(`${base}/informe`);
      } else notify('info', 'Tu compañero no está de acuerdo con la acusación.');
    }
  };

  const total = shareSize(pending);
  const partner = session.partner?.a ?? session.partner?.n ?? 'tu compañero';
  const roleTitle = (r: 'A' | 'B' | undefined) => c.coop?.roles.find((x) => x.id === r)?.title ?? '';

  return (
    <Sheet open={open} onClose={onClose} title={same ? 'Mesa compartida' : `Correspondencia con ${partner}`} side="center">
      <p className={s.p}>
        {role ? `Eres ${role} · ${roleTitle(role)}.` : 'Investigación compartida.'}
        {!same && session.partner ? ` ${partner} es ${otherRole(role ?? 'A')} · ${roleTitle(otherRole(role ?? 'A'))}.` : ''}
      </p>
      {role && c.coop && <p className={s.hand}>{c.coop.roles.find((r) => r.id === role)?.briefing}</p>}
      {!role && c.coop && (
        <p className={s.hand}>
          {c.coop.roles.map((r) => `${r.title}: ${r.briefing}`).join(' ')}
        </p>
      )}
      {error && <p className={s.error}>{error}</p>}

      {!closed && role && (
        <>
          <h2 className={s.h2}>{same ? `Poner sobre la mesa para ${otherRole(role)}` : 'Preparar un informe de campo'}</h2>
          {total === 0 ? (
            <p className={s.small}>Nada nuevo que compartir: tu compañero ya tiene todo lo que sabes.</p>
          ) : (
            SHARE_KEYS.filter((k) => k !== 'flags' && pending[k].length).map((k) => (
              <label key={k} className={s.check}>
                <input type="checkbox" checked={picked[k]} onChange={(e) => setPicked({ ...picked, [k]: e.target.checked })} />
                <span>
                  <strong>
                    {CATEGORY[k]} ({pending[k].length})
                  </strong>
                  {pending[k].slice(0, 4).map(names[k]).join(' · ')}
                  {pending[k].length > 4 ? ' …' : ''}
                </span>
              </label>
            ))
          )}
          <label className={s.check}>
            <input type="checkbox" checked={board} onChange={(e) => setBoard(e.target.checked)} />
            <span>
              <strong>Mi tablero</strong>Tarjetas e hilos (se añaden a su corcho sin mover lo suyo)
            </span>
          </label>
          {!same && notes.length > 0 && (
            <>
              <p className={s.label}>Notas de mi libreta</p>
              {notes.map((n) => (
                <label key={n.id} className={s.check}>
                  <input type="checkbox" checked={noteIds.includes(n.id)} onChange={(e) => setNoteIds(e.target.checked ? [...noteIds, n.id] : noteIds.filter((x) => x !== n.id))} />
                  <span>{n.text.slice(0, 120) || '(nota vacía)'}</span>
                </label>
              ))}
            </>
          )}
          {!same && <textarea className={s.message} placeholder="Mensaje para tu compañero (opcional)" value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} />}
          <div className={s.row}>
            {same ? (
              <>
                <button className={s.primary} onClick={() => void putOnTable()}>
                  Poner sobre la mesa
                </button>
                <button className={s.secondary} onClick={onPass}>
                  Pasar el turno a {otherRole(role)}
                </button>
              </>
            ) : (
              <button className={s.primary} onClick={() => void makeReport()}>
                Preparar el informe
              </button>
            )}
          </div>
          {report && <CodeBox code={report} label="Informe de campo para tu compañero" />}
        </>
      )}

      {!same && (
        <>
          {lastCode && <CodeBox code={lastCode.code} label={lastCode.label} />}
          <PasteBox label="Recibir un código de tu compañero" action="Recibir" onCode={onReceive} />
          {session.messages.length > 0 && (
            <>
              <p className={s.label}>Mensajes</p>
              <ul className={s.messages}>
                {session.messages.map((m, i) => (
                  <li key={i} data-from={m.from}>
                    {m.text}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {same && closed && (
        <button
          className={s.secondary}
          onClick={() =>
            void saveSession({ ...session, status: 'closed' }).then((x) => {
              setSession(x);
              onClose();
            })
          }
        >
          Cerrar
        </button>
      )}
    </Sheet>
  );
}
