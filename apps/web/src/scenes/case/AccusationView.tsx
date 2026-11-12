import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { accusableSuspects, methodsAvailable, motivesAvailable } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { Portrait } from '../../ui/Portrait.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './case.module.css';

/**
 * ACTA DE ACUSACIÓN: culpable(s), motivo, método y prueba definitiva.
 * Se puede acusar en cualquier momento; una acusación errónea cierra el
 * expediente con un final negativo.
 */
export function AccusationView() {
  const { c, k, closed, accuse } = useCase();
  const navigate = useNavigate();
  const [culprits, setCulprits] = useState<string[]>([]);
  const [motive, setMotive] = useState<string>('');
  const [method, setMethod] = useState<string>('');
  const [proof, setProof] = useState<string>('');
  const [confirm, setConfirm] = useState(false);
  const [sealing, setSealing] = useState(false);
  const base = `/expediente/${c.id}`;

  if (closed) {
    return (
      <div className={s.sheet}>
        <p className={s.hand}>Este expediente ya está cerrado.</p>
        <Link to={`${base}/informe`} className={s.link}>
          Leer el informe final
        </Link>
      </div>
    );
  }

  const suspects = accusableSuspects(c, k);
  const motives = motivesAvailable(c, k);
  const methods = methodsAvailable(c, k);
  const evidence = c.evidence.filter((e) => k.evidence.has(e.id));
  const ready = culprits.length > 0 && motive && method && proof;

  const seal = async () => {
    setSealing(true);
    sound.play('stamp');
    haptic('confirm');
    await accuse({ culprits, motive, method, proof });
    setTimeout(() => void navigate(`${base}/informe`), 700);
  };

  return (
    <article className={`${s.sheet} ${s.scroll} ${s.accusation}`} data-sealing={sealing || undefined}>
      <p className={s.kicker}>Acta de acusación · {c.title}</p>
      <h1 className={s.title}>Formular la acusación</h1>
      <p className={s.warn}>
        Puedes acusar cuando quieras, aunque no lo hayas descubierto todo. Si la acusación es errónea, el expediente se cierra.
      </p>

      <h2 className={s.h2}>1 · Culpable{culprits.length > 1 ? 's' : ''}</h2>
      <p className={s.trayHelp}>Si crees que fue más de una persona, señálalas a todas.</p>
      <div className={s.suspects}>
        {suspects.map((p) => (
          <button
            key={p.id}
            className={s.suspect}
            aria-pressed={culprits.includes(p.id)}
            onClick={() => {
              sound.play('tap');
              setCulprits((cs) => (cs.includes(p.id) ? cs.filter((x) => x !== p.id) : [...cs, p.id]));
            }}
          >
            <Portrait character={p} size={64} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <h2 className={s.h2}>2 · Motivo</h2>
      <Options name="motive" value={motive} onChange={setMotive} options={motives} empty="Aún no tienes base para formular un motivo." />

      <h2 className={s.h2}>3 · Método</h2>
      <Options name="method" value={method} onChange={setMethod} options={methods} empty="Aún no sabes cómo se hizo." />

      <h2 className={s.h2}>4 · Prueba definitiva</h2>
      <Options name="proof" value={proof} onChange={setProof} options={evidence.map((e) => ({ id: e.id, label: e.title }))} empty="No tienes pruebas." />

      <div className={s.sealRow}>
        {!confirm ? (
          <button className={s.primary} disabled={!ready} onClick={() => setConfirm(true)}>
            Firmar el acta
          </button>
        ) : (
          <>
            <span className={s.warn}>¿Seguro? Esta decisión cierra el expediente.</span>
            <button className={s.secondary} onClick={() => setConfirm(false)}>
              Revisar
            </button>
            <button className={s.primary} disabled={sealing} onClick={() => void seal()}>
              Sellar la acusación
            </button>
          </>
        )}
      </div>
      {sealing && <div className={s.bigStamp}>Acusación presentada</div>}
    </article>
  );
}

function Options({ name, value, onChange, options, empty }: { name: string; value: string; onChange: (v: string) => void; options: Array<{ id: string; label: string }>; empty: string }) {
  if (options.length === 0) return <p className={s.hand}>{empty}</p>;
  return (
    <div className={s.options} role="radiogroup">
      {options.map((o) => (
        <label key={o.id} className={s.option} data-checked={value === o.id || undefined}>
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => {
              sound.play('tap');
              onChange(o.id);
            }}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
