import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { availableInterrogations, evaluateCondition, visibleCharacters } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { characterName, lines } from '../../cases/labels.ts';
import { Portrait } from '../../ui/Portrait.tsx';
import { portraitUrl } from '../../cases/contentRepo.ts';
import { PhotoViewer } from '../../ui/PhotoViewer.tsx';
import { sound } from '../../audio/sound.ts';
import s from './case.module.css';

const ROLE: Record<string, string> = { victim: 'Víctima', suspect: 'Sospechoso', witness: 'Testigo', investigator: 'Investigador', other: 'Otro' };

/** 3 · PERSONAS: víctima, sospechosos y testigos con su ficha. */
export function PeopleTab() {
  const { characterId } = useParams();
  const { c, k, inv, closed, revealed, base } = useCase();
  const [viewing, setViewing] = useState(false);
  const people = revealed ? c.characters : visibleCharacters(c, k);
  const current = people.find((p) => p.id === characterId) ?? people.find((p) => p.role === 'suspect') ?? people[0];
  if (!current) return null;
  const canInterrogate = !closed && availableInterrogations(c, k, inv?.role).some((it) => it.characterId === current.id);
  const heard = (inv?.heardLines ?? []).map((id) => ({ id, ...lines(c).get(id) })).filter((l) => l.characterId === current.id);
  const secrets = c.secrets.filter((x) => x.characterId === current.id && (k.secrets.has(x.id) || revealed));
  const rels = c.relationships.filter((r) => (r.a === current.id || r.b === current.id) && (revealed || (evaluateCondition(r.visibleWhen, k) && people.some((p) => p.id === (r.a === current.id ? r.b : r.a)))));
  const truth = revealed ? c.solution.alibiTruths.find((t) => t.characterId === current.id) : undefined;

  return (
    <div className={s.people}>
      <ul className={`${s.peopleList} ${s.scroll}`} aria-label="Personas del caso">
        {people.map((p) => (
          <li key={p.id}>
            <Link to={`${base}/personas/${p.id}`} className={s.personCard} aria-current={p.id === current.id ? 'true' : undefined} onClick={() => sound.play('paper')}>
              <Portrait character={p} size={46} src={portraitUrl(c, p)} />
              <span>
                <span className={s.personName}>{p.name}</span>
                <span className={s.personRole}>{ROLE[p.role]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <article className={`${s.sheet} ${s.scroll} ${s.dossierCard}`}>
        <div className={s.dossierHead}>
          {portraitUrl(c, current) ? (
            <button type="button" className={s.portraitButton} onClick={() => setViewing(true)} aria-label={`Ver el retrato de ${current.name}`}>
              <Portrait character={current} size={110} src={portraitUrl(c, current)} />
            </button>
          ) : (
            <Portrait character={current} size={110} />
          )}
          <div>
            <p className={s.kicker}>{ROLE[current.role]}</p>
            <h1 className={s.title}>{current.name}</h1>
            <p className={s.subtitle}>
              {current.occupation}
              {current.age ? ` · ${current.age} años` : current.ageLabel ? ` · ${current.ageLabel}` : ''}
            </p>
            {current.relationToVictim && <p className={s.meta}>{current.relationToVictim}</p>}
            {canInterrogate && (
              <Link to={`${base}/interrogatorio/${current.id}`} className={s.primaryLink} onClick={() => sound.play('phone')}>
                Interrogar
              </Link>
            )}
          </div>
        </div>
        <p className={s.prose}>{current.biography}</p>
        {current.personality.length > 0 && <p className={s.hand}>Notas del investigador: {current.personality.join(' · ')}.</p>}
        <dl className={s.fields}>
          {current.alibi && evaluateCondition(current.alibi.visibleWhen, k) && (
            <div>
              <dt>Coartada declarada</dt>
              <dd>{current.alibi.claim}</dd>
            </div>
          )}
          {current.motive && (revealed || evaluateCondition(current.motive.visibleWhen, k)) && (
            <div>
              <dt>Posible motivo</dt>
              <dd>{current.motive.text}</dd>
            </div>
          )}
          {truth && (
            <div>
              <dt>La verdad</dt>
              <dd>{truth.truth}</dd>
            </div>
          )}
        </dl>
        {rels.length > 0 && (
          <>
            <h2 className={s.h2}>Relaciones</h2>
            <ul className={s.list}>
              {rels.map((r) => (
                <li key={r.id}>
                  <strong>{r.label}</strong> con {characterName(c, r.a === current.id ? r.b : r.a)}
                  {r.description ? ` — ${r.description}` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
        {secrets.length > 0 && (
          <>
            <h2 className={s.h2}>Secretos</h2>
            <ul className={s.facts}>
              {secrets.map((x) => (
                <li key={x.id} data-important={k.secrets.has(x.id) || undefined} data-missed={!k.secrets.has(x.id) || undefined}>
                  {x.text}
                </li>
              ))}
            </ul>
          </>
        )}
        {heard.length > 0 && (
          <>
            <h2 className={s.h2}>Declaraciones anotadas</h2>
            <ul className={s.quotes}>
              {heard.map((l) => (
                <li key={l.id}>«{l.line?.text}»</li>
              ))}
            </ul>
          </>
        )}
      </article>
      {viewing && portraitUrl(c, current) && <PhotoViewer src={portraitUrl(c, current)!} alt={`Retrato de ${current.name}`} caption={current.name} onClose={() => setViewing(false)} />}
    </div>
  );
}
