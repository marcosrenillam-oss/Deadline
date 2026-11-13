import { Link } from 'react-router';
import { evaluateCondition, formatCaseNumber } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { CRIME_CATEGORY_LABELS, DIFFICULTY_LABELS, ORIGIN_LABELS } from '../../cases/labels.ts';
import { Stamp } from '../../ui/Stamp.tsx';
import { ReopenPanel } from './ReopenPanel.tsx';
import s from './case.module.css';

/** 1 · EXPEDIENTE: contexto inicial y lo que ya se sabe. */
export function DossierTab() {
  const { c, k, closed, revealed, offline, inv, base, coop } = useCase();
  const myRole = c.coop?.roles.find((r) => r.id === inv?.role);
  const facts = c.facts.filter((f) => k.facts.has(f.id)).sort((a, b) => Number(b.important) - Number(a.important));
  const objectives = c.objectives.filter((o) => !o.hidden || evaluateCondition(o.completeWhen, k));
  return (
    <article className={`${s.sheet} ${s.scroll}`}>
      <header className={s.sheetHead}>
        <div>
          <p className={s.kicker}>
            {formatCaseNumber(c.id)} · {c.eraLabel} · {CRIME_CATEGORY_LABELS[c.category]}
          </p>
          <h1 className={s.title}>{c.title}</h1>
          {c.subtitle && <p className={s.subtitle}>{c.subtitle}</p>}
        </div>
        <div className={s.stamps}>
          <Stamp tilt={-4}>{ORIGIN_LABELS[c.origin]}</Stamp>
          <Stamp tilt={3} tone="ink">{`Dificultad: ${DIFFICULTY_LABELS[c.difficulty]}`}</Stamp>
        </div>
      </header>

      <div className={s.twoCol}>
        <section>
          <dl className={s.fields}>
            <div>
              <dt>Lugar</dt>
              <dd>{c.location.place}{c.location.country ? ` (${c.location.country})` : ''}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{c.briefing.incidentDisplay}</dd>
            </div>
          </dl>
          {myRole && (
            <>
              <h2 className={s.h2}>Tu papel · {myRole.id} · {myRole.title}</h2>
              <p className={s.hand}>{myRole.briefing}</p>
            </>
          )}
          {coop && !myRole && <p className={s.hand}>Investigación compartida: los dos veis todo el expediente.</p>}
          <h2 className={s.h2}>Resumen</h2>
          <p className={s.prose}>{c.briefing.summary}</p>
          <h2 className={s.h2}>Situación</h2>
          <p className={s.prose}>{c.briefing.context}</p>
          <h2 className={s.h2}>Antecedentes</h2>
          <p className={s.prose}>{c.briefing.background}</p>
          {c.historical && (
            <>
              <h2 className={s.h2}>Hechos documentados</h2>
              <ul className={s.list}>{c.historical.documented.map((x) => <li key={x}>{x}</li>)}</ul>
              <h2 className={s.h2}>Recreación narrativa</h2>
              <ul className={s.list}>{c.historical.dramatized.map((x) => <li key={x}>{x}</li>)}</ul>
            </>
          )}
        </section>
        <section>
          <h2 className={s.h2}>Hechos establecidos</h2>
          {facts.length === 0 ? (
            <p className={s.hand}>Todavía nada que se pueda dar por cierto.</p>
          ) : (
            <ul className={s.facts}>
              {facts.map((f) => (
                <li key={f.id} data-important={f.important || undefined}>
                  {f.text}
                </li>
              ))}
            </ul>
          )}
          {objectives.length > 0 && (
            <>
              <h2 className={s.h2}>Objetivos secundarios</h2>
              <ul className={s.objectives}>
                {objectives.map((o) => (
                  <li key={o.id} data-done={evaluateCondition(o.completeWhen, k) || undefined}>
                    {o.text}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h2 className={s.h2}>Documentación inicial</h2>
          <ul className={s.linkList}>
            {c.briefing.initialEvidence.filter((id) => revealed || k.evidence.has(id)).map((id) => (
              <li key={id}>
                <Link to={`${base}/evidencias/${id}`}>{c.evidence.find((e) => e.id === id)?.title}</Link>
              </li>
            ))}
          </ul>
          <p className={s.trayHelp}>
            {offline?.state === 'verified'
              ? '✓ Disponible sin conexión.'
              : offline?.state === 'downloading'
                ? 'Preparando el expediente para jugar sin conexión…'
                : offline?.state === 'partial' || offline?.state === 'corrupt'
                  ? 'Descarga incompleta: reinténtalo desde el archivo para jugar sin conexión.'
                  : 'Aún no está descargado para jugar sin conexión.'}
            {inv && inv.attempt > 1 ? ` Intento nº ${inv.attempt}.` : ''}
          </p>
          {closed && (
            <p className={s.hand}>
              Expediente cerrado. <Link to={`${base}/informe`}>Leer el informe final</Link>
            </p>
          )}
          <ReopenPanel />
        </section>
      </div>
    </article>
  );
}
