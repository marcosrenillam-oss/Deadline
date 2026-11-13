import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { detailAtPoint, examine, findDetail, findableDetails, patchWorkspace, unlockedTimeline, visibleCharacters } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { EVIDENCE_KIND_LABELS } from '../../cases/labels.ts';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import { DocumentView } from './DocumentView.tsx';
import s from './case.module.css';

/** Una evidencia abierta sobre la mesa: leer, examinar con lupa, marcar y asociar. */
export function EvidenceViewer() {
  const { evidenceId = '' } = useParams();
  const { c, k, inv, closed, revealed, run, patch, notify, base } = useCase();
  const [lupa, setLupa] = useState(false);
  const [assoc, setAssoc] = useState(false);
  const e = c.evidence.find((x) => x.id === evidenceId);
  const visible = !!e && (revealed || k.evidence.has(e.id));

  useEffect(() => {
    if (e && visible && !closed) run((cf, i, now) => examine(cf, i, e.id, now));
  }, [e, visible, closed, run]);

  if (!e || !visible) {
    return (
      <div className={s.sheet}>
        <p className={s.hand}>Esa pieza no está en tu expediente.</p>
        <Link to={`${base}/evidencias`} className={s.link}>
          Volver a las evidencias
        </Link>
      </div>
    );
  }

  const onDetail = (id: string) => {
    const r = run((cf, i, now) => findDetail(cf, i, e.id, id, now));
    if (!r?.detail) notify('miss', 'Todavía no sabes qué buscar ahí.');
  };
  const onMiss = () => {
    sound.play('tap');
    notify('miss', 'Nada fuera de lo normal.');
  };
  const onPoint = (x: number, y: number) => {
    const d = detailAtPoint(e, k, x, y);
    if (d) onDetail(d.id);
    else onMiss();
  };
  // Detalles sin posición (ni en el texto ni en la imagen): se revelan al examinar a fondo.
  const loose = findableDetails(e, k).filter((d) => !d.region && !JSON.stringify(e.body).includes(`{{${d.id}|`));

  const mark = inv?.evidenceMarks[e.id];
  const setMark = (m: 'starred' | 'dismissed') =>
    patch((i) => {
      const marks = { ...i.evidenceMarks };
      if (marks[e.id] === m) delete marks[e.id];
      else marks[e.id] = m;
      return patchWorkspace(i, { evidenceMarks: marks }, Date.now());
    });
  const linked = new Set(inv?.associations.filter((a) => a.evidenceId === e.id).map((a) => a.targetId));
  const toggleAssoc = (targetId: string) =>
    patch((i) => {
      const has = i.associations.some((a) => a.evidenceId === e.id && a.targetId === targetId);
      const associations = has ? i.associations.filter((a) => !(a.evidenceId === e.id && a.targetId === targetId)) : [...i.associations, { evidenceId: e.id, targetId }];
      return patchWorkspace(i, { associations }, Date.now());
    });

  const foundDetails = e.details.filter((d) => k.details.has(d.id));
  const missed = revealed ? e.details.filter((d) => !k.details.has(d.id)) : [];

  return (
    <div className={s.viewer}>
      <div className={s.viewerBar}>
        <Link to={`${base}/evidencias`} className={s.link} onClick={() => sound.play('paper')}>
          ← Evidencias
        </Link>
        <span className={s.spacer} />
        {!closed && (
          <>
            <button
              className={s.toolToggle}
              aria-pressed={lupa}
              onClick={() => {
                setLupa((v) => !v);
                haptic('light');
              }}
            >
              {lupa ? 'Lupa activa' : 'Examinar con lupa'}
            </button>
            <button className={s.toolToggle} aria-pressed={mark === 'starred'} onClick={() => setMark('starred')}>
              ★ Destacar
            </button>
            <button className={s.toolToggle} aria-pressed={mark === 'dismissed'} onClick={() => setMark('dismissed')}>
              Descartar
            </button>
            <button className={s.toolToggle} aria-pressed={assoc} onClick={() => setAssoc((v) => !v)}>
              Asociar
            </button>
          </>
        )}
      </div>
      <article className={`${s.sheet} ${s.scroll} ${s.document}`} data-lupa={lupa || undefined}>
        <p className={s.kicker}>
          {EVIDENCE_KIND_LABELS[e.kind]}
          {e.dated ? ` · ${e.dated}` : ''}
          {e.source ? ` · ${e.source}` : ''}
        </p>
        <h1 className={s.title}>{e.title}</h1>
        {revealed && !k.evidence.has(e.id) && <p className={s.missedNote}>No llegaste a encontrar esta pieza.</p>}
        {lupa && <p className={s.lupaHelp}>Toca cualquier frase o zona de la imagen para examinarla de cerca.</p>}
        {assoc && (
          <div className={s.assoc}>
            <p className={s.trayHelp}>Asocia esta pieza a personas y acontecimientos (solo para tu organización; no revela nada).</p>
            <div className={s.chips}>
              {visibleCharacters(c, k).map((ch) => (
                <button key={ch.id} className={s.chip} aria-pressed={linked.has(ch.id)} onClick={() => toggleAssoc(ch.id)}>
                  {ch.name}
                </button>
              ))}
              {unlockedTimeline(c, k).map((t) => (
                <button key={t.id} className={s.chip} aria-pressed={linked.has(t.id)} onClick={() => toggleAssoc(t.id)}>
                  {t.display} · {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <DocumentView c={c} evidence={e} k={k} lupa={lupa} archive={revealed} onDetail={onDetail} onMiss={onMiss} onImagePoint={onPoint} />
        {lupa && loose.length > 0 && (
          <button className={s.primary} onClick={() => loose.forEach((d) => onDetail(d.id))}>
            Examinar a fondo
          </button>
        )}
        {(foundDetails.length > 0 || missed.length > 0) && (
          <section className={s.noticed}>
            <h2 className={s.h2}>Lo que has advertido</h2>
            <ul className={s.facts}>
              {foundDetails.map((d) => (
                <li key={d.id} data-important>
                  <strong>{d.label}.</strong> {d.description}
                </li>
              ))}
              {missed.map((d) => (
                <li key={d.id} data-missed>
                  <strong>Pasado por alto: {d.label}.</strong> {d.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
