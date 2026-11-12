import { Link } from 'react-router';
import { evaluateCondition, progressToNext, rankFor } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { characterName, evidenceTitle, formatDuration } from '../../cases/labels.ts';
import { Stamp } from '../../ui/Stamp.tsx';
import { ReopenPanel } from './ReopenPanel.tsx';
import s from './case.module.css';

const OUTCOME = {
  success: 'Caso resuelto',
  partial: 'Resuelto parcialmente',
  failure: 'Acusación fallida',
  expired: 'Cerrado por tiempo',
} as const;

/** INFORME FINAL. Tras cerrar el caso, todo el expediente queda abierto para consulta. */
export function ReportView() {
  const { c, k, inv, closed } = useCase();
  const { profile } = useProfile();
  const base = `/expediente/${c.id}`;
  if (!inv || !closed || !inv.result) {
    return (
      <div className={s.sheet}>
        <p className={s.hand}>El informe se redacta al cerrar el expediente.</p>
      </div>
    );
  }
  const r = inv.result;
  const ending = c.endings.find((e) => e.id === r.endingId);
  const a = inv.accusation;
  const sol = c.solution;
  const motive = (id?: string) => c.accusation.motives.find((m) => m.id === id)?.label ?? '—';
  const method = (id?: string) => c.accusation.methods.find((m) => m.id === id)?.label ?? '—';
  const placed = new Set(inv.timeline.flatMap((e) => (e.eventId ? [e.eventId] : [])));
  const trueTimeline = c.timeline.filter((t) => t.veracity === 'true').sort((x, y) => x.t - y.t);
  const evFound = c.evidence.filter((e) => k.evidence.has(e.id));
  const evMissed = c.evidence.filter((e) => !k.evidence.has(e.id));
  const rank = profile ? rankFor({ merit: profile.soloMerit, perfectSolves: 0, accuracy: 0, solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 } }) : null;
  const progress = profile ? progressToNext({ merit: profile.soloMerit, perfectSolves: 0, accuracy: 0, solvedByDifficulty: { detective: 0, inspector: 0, 'special-unit': 0 } }) : null;

  const row = (label: string, ok: boolean, yours: string, truth: string) => (
    <tr data-ok={ok || undefined}>
      <th>{label}</th>
      <td>{ok ? '✓' : '✗'}</td>
      <td>{yours}</td>
      <td>{truth}</td>
    </tr>
  );

  return (
    <article className={`${s.sheet} ${s.scroll} ${s.report}`}>
      <header className={s.sheetHead}>
        <div>
          <p className={s.kicker}>Informe final · {c.title}</p>
          <h1 className={s.title}>{ending?.title ?? OUTCOME[r.outcome]}</h1>
        </div>
        <Stamp tilt={-8}>{OUTCOME[r.outcome]}</Stamp>
      </header>
      {ending && <p className={s.prose}>{ending.text}</p>}

      {a && (
        <>
          <h2 className={s.h2}>Evaluación de la acusación</h2>
          <table className={s.evalTable}>
            <thead>
              <tr>
                <th />
                <th />
                <th>Tu acusación</th>
                <th>La verdad</th>
              </tr>
            </thead>
            <tbody>
              {row('Culpable', r.components.culprit, a.culprits.map((x) => characterName(c, x)).join(', '), sol.culprits.map((x) => characterName(c, x)).join(', '))}
              {row('Motivo', r.components.motive, motive(a.motive), motive(sol.motive))}
              {row('Método', r.components.method, method(a.method), method(sol.method))}
              {row('Prueba', r.components.proof, evidenceTitle(c, a.proof), sol.proof.map((x) => evidenceTitle(c, x)).join(' · '))}
            </tbody>
          </table>
        </>
      )}

      <h2 className={s.h2}>Qué ocurrió</h2>
      <p className={s.prose}>{sol.whatHappened}</p>
      <h2 className={s.h2}>Reconstrucción</h2>
      <ol className={s.list}>{sol.reconstruction.map((x) => <li key={x}>{x}</li>)}</ol>

      <h2 className={s.h2}>Cronología verdadera</h2>
      <p className={s.trayHelp}>Precisión de tu cronología: {Math.round(r.timelineAccuracy * 100)} %{r.falseEventsPlaced.length ? ` · diste por buenas ${r.falseEventsPlaced.length} versiones falsas` : ''}.</p>
      <ol className={s.trueTimeline}>
        {trueTimeline.map((t) => (
          <li key={t.id} data-placed={placed.has(t.id) || undefined} data-key={t.key || undefined}>
            <span className={s.eventTime}>{t.display}</span> {t.title}
          </li>
        ))}
      </ol>

      <div className={s.twoCol}>
        <section>
          <h2 className={s.h2}>Evidencias decisivas</h2>
          <ul className={s.linkList}>
            {sol.decisiveEvidence.map((id) => (
              <li key={id} data-missed={!k.evidence.has(id) || undefined}>
                <Link to={`${base}/evidencias/${id}`}>{evidenceTitle(c, id)}</Link>
                {!k.evidence.has(id) && ' (no la encontraste)'}
              </li>
            ))}
          </ul>
          <h2 className={s.h2}>Pistas encontradas ({evFound.length}) y omitidas ({evMissed.length})</h2>
          <ul className={s.linkList}>
            {evFound.map((e) => (
              <li key={e.id}>
                <Link to={`${base}/evidencias/${e.id}`}>{e.title}</Link>
              </li>
            ))}
            {evMissed.map((e) => (
              <li key={e.id} data-missed>
                <Link to={`${base}/evidencias/${e.id}`}>{e.title}</Link> — no encontrada
              </li>
            ))}
          </ul>
          <h2 className={s.h2}>Contradicciones</h2>
          <ul className={s.facts}>
            {c.contradictions.map((x) => (
              <li key={x.id} data-important={k.contradictions.has(x.id) || undefined} data-missed={!k.contradictions.has(x.id) || undefined}>
                <strong>{x.title}.</strong> {x.explanation}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className={s.h2}>Secretos</h2>
          <ul className={s.facts}>
            {c.secrets.map((x) => (
              <li key={x.id} data-important={k.secrets.has(x.id) || undefined} data-missed={!k.secrets.has(x.id) || undefined}>
                {x.text}
              </li>
            ))}
          </ul>
          <h2 className={s.h2}>Objetivos secundarios</h2>
          <ul className={s.objectives}>
            {c.objectives.map((o) => (
              <li key={o.id} data-done={evaluateCondition(o.completeWhen, k) || undefined}>
                {o.text}
              </li>
            ))}
          </ul>
          <h2 className={s.h2}>Hoja de servicio</h2>
          <dl className={s.fields}>
            <div>
              <dt>Tiempo empleado</dt>
              <dd>{formatDuration(r.elapsedMs)}</dd>
            </div>
            <div>
              <dt>Pistas usadas</dt>
              <dd>
                {inv.hintsUsed.length} de {c.maxHints}
              </dd>
            </div>
            <div>
              <dt>Intento</dt>
              <dd>{inv.attempt}</dd>
            </div>
          </dl>
          <table className={s.scoreTable}>
            <tbody>
              {r.score.map((l, i) => (
                <tr key={i}>
                  <td>{l.label}</td>
                  <td>{l.points > 0 ? `+${l.points}` : l.points}</td>
                </tr>
              ))}
              <tr className={s.scoreTotal}>
                <td>Total</td>
                <td>{r.total}</td>
              </tr>
            </tbody>
          </table>
          {r.total === 0 && r.outcome !== 'expired' && inv.attempt > 1 && <p className={s.trayHelp}>Las recompensas de este expediente ya se cobraron en un intento anterior.</p>}
          {rank && progress && (
            <p className={s.hand}>
              Rango: {rank.label}. {progress.next ? `Hacia ${progress.next.label}: ${Math.round(progress.progress * 100)} %.` : ''}
            </p>
          )}
        </section>
      </div>
      <p className={s.trayHelp}>Todo el expediente queda abierto para consulta: las piezas que no encontraste aparecen marcadas.</p>
      <ReopenPanel />
    </article>
  );
}
