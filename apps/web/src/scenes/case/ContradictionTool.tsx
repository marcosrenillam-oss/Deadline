import { useMemo, useState } from 'react';
import { pointContradiction, statementKey, type StatementRef } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { statementLabel } from '../../cases/labels.ts';
import { sound } from '../../audio/sound.ts';
import { Sheet } from '../../ui/Sheet.tsx';
import s from './tools.module.css';

/**
 * Señalar una contradicción: el jugador elige dos afirmaciones que conoce y
 * sostiene que no pueden ser ciertas a la vez. Solo cuenta si de verdad lo son.
 */
export function ContradictionTool({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c, k, inv, run } = useCase();
  const [a, setA] = useState<StatementRef | null>(null);
  const [b, setB] = useState<StatementRef | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; title: string; text: string } | null>(null);

  const groups = useMemo(() => {
    if (!inv) return [];
    const heard: StatementRef[] = inv.heardLines.map((line) => ({ line }));
    const docs: StatementRef[] = c.evidence.filter((e) => k.evidence.has(e.id)).map((e) => ({ evidence: e.id }));
    const details: StatementRef[] = c.evidence.flatMap((e) => e.details).filter((d) => k.details.has(d.id)).map((d) => ({ detail: d.id }));
    const facts: StatementRef[] = c.facts.filter((f) => k.facts.has(f.id)).map((f) => ({ fact: f.id }));
    return [
      { label: 'Declaraciones', items: heard },
      { label: 'Detalles advertidos', items: details },
      { label: 'Documentos', items: docs },
      { label: 'Hechos establecidos', items: facts },
    ].filter((g) => g.items.length);
  }, [c, k, inv]);

  const submit = () => {
    if (!a || !b) return;
    const r = run((cf, i, now) => pointContradiction(cf, i, a, b, now));
    if (r?.contradiction) {
      setVerdict({ ok: true, title: r.already ? `Ya señalada: ${r.contradiction.title}` : r.contradiction.title, text: r.contradiction.explanation });
    } else {
      sound.play('tap');
      setVerdict({ ok: false, title: 'No se sostiene', text: 'Esas dos afirmaciones pueden ser ciertas a la vez, o no basta con ellas para demostrar que alguien miente.' });
    }
  };

  const column = (label: string, value: StatementRef | null, set: (r: StatementRef) => void) => (
    <div className={s.column}>
      <h3 className={s.colTitle}>{label}</h3>
      {groups.map((g) => (
        <div key={g.label}>
          <p className={s.groupLabel}>{g.label}</p>
          <ul className={s.picks}>
            {g.items.map((ref) => {
              const l = statementLabel(c, ref);
              const key = statementKey(ref);
              return (
                <li key={key}>
                  <button className={s.pick} aria-pressed={value !== null && statementKey(value) === key} onClick={() => (set(ref), setVerdict(null))}>
                    {l.who && <span className={s.who}>{l.who}</span>}
                    <span>{l.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <Sheet
      open={open}
      onClose={() => {
        setVerdict(null);
        onClose();
      }}
      title="Señalar una contradicción"
      side="center"
    >
      <div className={s.cols}>
        {column('Esta afirmación…', a, setA)}
        {column('…choca con esta', b, setB)}
      </div>
      <div className={s.footer}>
        {verdict && (
          <div className={s.verdict} data-ok={verdict.ok || undefined} role="status">
            <strong>{verdict.title}</strong>
            <span>{verdict.text}</span>
          </div>
        )}
        <button className={s.primary} disabled={!a || !b || (a && b && statementKey(a) === statementKey(b))} onClick={submit}>
          Señalar
        </button>
      </div>
    </Sheet>
  );
}
