import { useEffect, useRef, useState } from 'react';
import type { Note } from '@deadline/core';
import { deleteNote, draftNote, listNotes, saveNote } from '../../cases/notesRepo.ts';
import { sound } from '../../audio/sound.ts';
import styles from './NotebookEditor.module.css';

const KINDS: Array<{ value: Note['kind']; label: string }> = [
  { value: 'note', label: 'Nota' },
  { value: 'hypothesis', label: 'Hipótesis' },
  { value: 'suspicion', label: 'Sospecha' },
  { value: 'observation', label: 'Observación' },
  { value: 'reminder', label: 'Recordatorio' },
];

/**
 * Libreta: notas personales con guardado automático. Nada de lo que se
 * escribe aquí influye en el caso ni revela la solución.
 * - caseId definido: notas de ese expediente.
 * - caseId === null: libreta general (notas sin expediente) — o todas si `all`.
 */
export function NotebookEditor({ caseId, all = false, caseTitles }: { caseId: string | null; all?: boolean; caseTitles?: Record<string, string> }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [filter, setFilter] = useState<Note['kind'] | 'all'>('all');
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    void listNotes(caseId ?? undefined).then((list) => setNotes(all || caseId ? list : list.filter((n) => !n.caseId)));
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, [caseId, all]);

  const add = async () => {
    sound.play('page');
    const n = await saveNote(draftNote({ ...(caseId ? { caseId } : {}), kind: filter === 'all' ? 'note' : filter }));
    setNotes((prev) => [n, ...(prev ?? [])]);
  };

  const update = (n: Note, patch: Partial<Note>) => {
    const next = { ...n, ...patch };
    setNotes((prev) => prev?.map((x) => (x.id === n.id ? next : x)) ?? null);
    const old = timers.current.get(n.id);
    if (old) clearTimeout(old);
    timers.current.set(
      n.id,
      setTimeout(() => void saveNote(next), patch.text !== undefined ? 500 : 0),
    );
  };

  const remove = async (n: Note) => {
    await deleteNote(n);
    setNotes((prev) => prev?.filter((x) => x.id !== n.id) ?? null);
  };

  if (!notes) return <p className={styles.empty}>Abriendo la libreta…</p>;
  const visible = notes.filter((n) => filter === 'all' || n.kind === filter);
  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="radiogroup" aria-label="Tipo de nota">
          {[{ value: 'all' as const, label: 'Todas' }, ...KINDS].map((k) => (
            <button key={k.value} role="radio" aria-checked={filter === k.value} className={styles.filter} onClick={() => setFilter(k.value)}>
              {k.label}
            </button>
          ))}
        </div>
        <button className={styles.add} onClick={() => void add()}>
          + Nueva
        </button>
      </div>
      {visible.length === 0 && <p className={styles.empty}>Página en blanco. Anota lo que no quieras olvidar.</p>}
      <ul className={styles.list}>
        {visible.map((n) => (
          <li key={n.id} className={styles.note} data-kind={n.kind} data-done={n.done || undefined}>
            <div className={styles.noteHead}>
              <select value={n.kind} onChange={(e) => update(n, { kind: e.target.value as Note['kind'] })} aria-label="Tipo">
                {KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              {all && n.caseId && <span className={styles.caseTag}>{caseTitles?.[n.caseId] ?? n.caseId}</span>}
              <span className={styles.spacer} />
              {n.kind === 'reminder' && (
                <button className={styles.mini} aria-pressed={n.done} onClick={() => update(n, { done: !n.done })}>
                  {n.done ? 'Hecho ✓' : 'Pendiente'}
                </button>
              )}
              <button className={styles.mini} aria-pressed={n.pinned} onClick={() => update(n, { pinned: !n.pinned })} aria-label={n.pinned ? 'Desfijar' : 'Fijar arriba'}>
                {n.pinned ? '📌' : 'Fijar'}
              </button>
              <button className={styles.mini} onClick={() => void remove(n)} aria-label="Borrar nota">
                Borrar
              </button>
            </div>
            <textarea
              className={styles.text}
              value={n.text}
              placeholder="Escribe aquí…"
              rows={Math.max(2, Math.min(10, n.text.split('\n').length + 1))}
              onChange={(e) => update(n, { text: e.target.value })}
              aria-label="Texto de la nota"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
