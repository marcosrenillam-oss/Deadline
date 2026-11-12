import { useState } from 'react';
import { Link } from 'react-router';
import { compare } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { EVIDENCE_KIND_LABELS } from '../../cases/labels.ts';
import { sound } from '../../audio/sound.ts';
import s from './case.module.css';

/**
 * 2 · EVIDENCIAS. Con el expediente cerrado se muestran todas, distinguiendo
 * las encontradas de las que se pasaron por alto.
 */
export function EvidenceTab() {
  const { c, k, inv, closed, run, notify } = useCase();
  const [filter, setFilter] = useState<'all' | 'starred' | 'dismissed'>('all');
  const [relating, setRelating] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<{ ok: boolean; title: string; text: string } | null>(null);
  const marks = inv?.evidenceMarks ?? {};

  const list = c.evidence.filter((e) => (closed || k.evidence.has(e.id)) && (filter === 'all' || marks[e.id] === filter));
  const details = c.evidence.flatMap((e) => e.details.filter((d) => k.details.has(d.id)).map((d) => ({ ...d, evidence: e.title })));

  const toggle = (id: string) => {
    setResult(null);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));
  };

  const relate = () => {
    const r = run((cf, i, now) => compare(cf, i, picked, now));
    if (r?.deduction) {
      setResult({ ok: true, title: r.already ? `Ya relacionado: ${r.deduction.title}` : r.deduction.title, text: r.deduction.explanation });
      setPicked([]);
    } else {
      sound.play('tap');
      setResult({ ok: false, title: 'Sin relación concluyente', text: 'Esas piezas no se iluminan entre sí. Prueba con otras.' });
      notify('miss', 'Sin relación concluyente');
    }
  };

  return (
    <div className={s.tabLayout}>
      <div className={s.tabBar}>
        <div className={s.segmented} role="radiogroup" aria-label="Filtrar evidencias">
          {(['all', 'starred', 'dismissed'] as const).map((f) => (
            <button key={f} role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}>
              {{ all: 'Todas', starred: 'Destacadas', dismissed: 'Descartadas' }[f]}
            </button>
          ))}
        </div>
        {!closed && (
          <button
            className={s.toolToggle}
            aria-pressed={relating}
            onClick={() => {
              setRelating((v) => !v);
              setPicked([]);
              setResult(null);
            }}
          >
            {relating ? 'Terminar' : 'Relacionar piezas'}
          </button>
        )}
      </div>

      {relating && (
        <div className={s.relateTray}>
          <p className={s.trayHelp}>Elige de 2 a 4 piezas (documentos o detalles advertidos) que creas que se explican entre sí.</p>
          {details.length > 0 && (
            <div className={s.chips}>
              {details.map((d) => (
                <button key={d.id} className={s.chip} aria-pressed={picked.includes(d.id)} onClick={() => toggle(d.id)}>
                  {d.label}
                </button>
              ))}
            </div>
          )}
          <div className={s.trayActions}>
            <span className={s.trayCount}>{picked.length} elegidas</span>
            <button className={s.primary} disabled={picked.length < 2} onClick={relate}>
              Relacionar
            </button>
          </div>
          {result && (
            <div className={s.verdict} data-ok={result.ok || undefined} role="status">
              <strong>{result.title}</strong> {result.text}
            </div>
          )}
        </div>
      )}

      <ul className={`${s.cards} ${s.scroll}`}>
        {list.map((e) => {
          const found = k.evidence.has(e.id);
          const content = (
            <>
              <span className={s.cardKind}>{EVIDENCE_KIND_LABELS[e.kind]}</span>
              <span className={s.cardTitle}>{e.title}</span>
              <span className={s.cardSummary}>{e.summary}</span>
              {found && !k.examined.has(e.id) && !closed && <span className={s.cardNew}>Sin leer</span>}
              {marks[e.id] === 'starred' && <span className={s.cardStar} aria-label="Destacada">★</span>}
              {closed && !found && <span className={s.cardMissed}>No encontrada</span>}
            </>
          );
          return (
            <li key={e.id} className={s.card} data-missed={(closed && !found) || undefined} data-dismissed={marks[e.id] === 'dismissed' || undefined}>
              {relating ? (
                <button className={s.cardInner} aria-pressed={picked.includes(e.id)} onClick={() => toggle(e.id)}>
                  {content}
                </button>
              ) : (
                <Link className={s.cardInner} to={`/expediente/${c.id}/evidencias/${e.id}`} onClick={() => sound.play('paper')}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
        {list.length === 0 && <li className={s.hand}>Nada en este cajón.</li>}
      </ul>
    </div>
  );
}
