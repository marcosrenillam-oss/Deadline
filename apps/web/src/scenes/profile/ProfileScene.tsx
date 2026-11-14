import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, encodeCode, isValidUsername, normalizeUsername, progressToNext, rankStatsFor, type InvestigatorCard, type LocalProfile, type RankDefinition, type RankStats } from '@deadline/core';
import { useProgress } from '../../progression/useProgress.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { saveProfile } from '../../storage/profileRepo.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { PlayerAvatar } from '../../ui/PlayerAvatar.tsx';
import { Portrait } from '../../ui/Portrait.tsx';
import { CodeBox } from '../coop/CodeBox.tsx';
import { sound } from '../../audio/sound.ts';
import surface from '../../ui/Surface.module.css';
import s from './ProfileScene.module.css';
import { Ambience } from '../../ui/Ambience.tsx';

/** Requisitos del siguiente rango como sellos: entintados cuando se cumplen. Sin barras. */
function Requirements({ stats, next }: { stats: RankStats; next: RankDefinition }) {
  const r = next.requirement;
  const items: Array<{ label: string; have: string; met: boolean }> = [
    { label: 'Mérito', have: `${stats.merit}/${r.merit}`, met: stats.merit >= r.merit },
  ];
  if (r.perfectSolves) items.push({ label: 'Actas impecables', have: `${stats.perfectSolves}/${r.perfectSolves}`, met: stats.perfectSolves >= r.perfectSolves });
  if (r.minAccuracy) items.push({ label: 'Precisión', have: `${Math.round(stats.accuracy * 100)}/${Math.round(r.minAccuracy * 100)} %`, met: stats.accuracy >= r.minAccuracy });
  const diff: Array<[keyof typeof r.solvedByDifficulty, string]> = [
    ['detective', 'Nivel Detective'],
    ['inspector', 'Nivel Inspector'],
    ['special-unit', 'Unidad Especial'],
  ];
  for (const [d, label] of diff) {
    const need = r.solvedByDifficulty[d];
    if (need) items.push({ label, have: `${stats.solvedByDifficulty[d]}/${need}`, met: stats.solvedByDifficulty[d] >= need });
  }
  return (
    <div className={s.reqs} aria-label={`Requisitos para ${next.label}`}>
      <span className={s.kicker}>Para ascender a {next.label}</span>
      <ul className={s.stamps}>
        {items.map((it) => (
          <li key={it.label} className={s.stampItem} data-met={it.met || undefined}>
            <span className={s.stampLabel}>{it.label}</span>
            <span className={s.stampValue}>{it.have}</span>
            {it.met && <span className={s.stampInk} aria-label="cumplido">Cumplido</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vitrina de insignias: cada logro es una medalla; los que faltan, un hueco en el terciopelo. */
function Insignias({ got }: { got: Map<string, number> }) {
  const [open, setOpen] = useState<string | null>(null);
  const shown = ACHIEVEMENTS.filter((a) => !a.secret || got.has(a.id));
  const hidden = ACHIEVEMENTS.length - shown.length;
  const current = ACHIEVEMENTS.find((a) => a.id === open);
  return (
    <div className={s.case}>
      <ul className={s.velvet}>
        {shown.map((a) => {
          const at = got.get(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                className={s.medal}
                data-got={at ? 'true' : undefined}
                aria-pressed={open === a.id}
                aria-label={`${a.label}${at ? ' (conseguida)' : ' (pendiente)'}`}
                onClick={() => setOpen(open === a.id ? null : a.id)}
              >
                <span className={s.ribbon} aria-hidden="true" />
                <span className={s.disc} aria-hidden="true">
                  {a.label
                    .split(/\s+/)
                    .filter((w) => w.length > 2)
                    .slice(0, 2)
                    .map((w) => w[0]!.toUpperCase())
                    .join('')}
                </span>
              </button>
            </li>
          );
        })}
        {Array.from({ length: hidden }, (_, i) => (
          <li key={`secret-${i}`}>
            <span className={s.medal} data-secret="true" aria-label="Insignia secreta sin descubrir">
              <span className={s.disc} aria-hidden="true">?</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={s.caseLabel} aria-live="polite">
        {current ? (
          <>
            <strong>{current.label}</strong> — {current.description}
            {got.get(current.id) ? ` Conseguida el ${new Date(got.get(current.id)!).toLocaleDateString('es-ES')}.` : ' Aún no conseguida.'}
          </>
        ) : (
          `${got.size} de ${ACHIEVEMENTS.length} insignias. Toca una para leer su placa.`
        )}
      </p>
    </div>
  );
}

const PRESETS = Array.from({ length: 8 }, (_, i) => `preset:${i + 1}`);

/** Reduce una foto a 240 px de ancho en el propio dispositivo (no sale de él). */
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const w = 240;
    const h = 288;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const scale = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, (w - img.width * scale) / 2, (h - img.height * scale) / 2, img.width * scale, img.height * scale);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** FICHA DEL INVESTIGADOR (la placa de la mesa): identidad, rangos y tarjeta para amigos. */
export function ProfileScene() {
  const { profile, reload } = useProfile();
  const [alias, setAlias] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const progress = useProgress();

  useEffect(() => {
    setAlias(profile?.alias ?? '');
  }, [profile?.alias]);

  if (!profile || !progress) return <main className={surface.wood} />;
  const { stats, soloRank: solo, coopRank: coop } = progress;
  const solved = { solo: stats.solo.solvedCases, coop: stats.coop.solvedCases };
  const soloNext = progressToNext(rankStatsFor(stats, 'solo', profile.soloMerit));
  const coopNext = progressToNext(rankStatsFor(stats, 'coop', profile.coopMerit));

  const save = async (patch: Partial<LocalProfile>) => {
    await saveProfile({ ...profile, ...patch, updatedAt: Date.now() });
    await reload();
    sound.play('stamp');
  };

  const saveAlias = async () => {
    const a = normalizeUsername(alias);
    if (a && !isValidUsername(a)) return setMsg('El alias admite de 3 a 20 letras minúsculas, números o «_».');
    const next = { ...profile };
    if (a) next.alias = a;
    else delete next.alias;
    await saveProfile({ ...next, updatedAt: Date.now() });
    await reload();
    setMsg(a ? `Alias guardado: ${a}` : 'Alias eliminado.');
  };

  const makeCard = async () => {
    const c: InvestigatorCard = {
      t: 'card',
      n: profile.investigatorNumber,
      ...(profile.alias ? { a: profile.alias } : {}),
      soloRank: solo.id,
      coopRank: coop.id,
      soloMerit: profile.soloMerit,
      coopMerit: profile.coopMerit,
      solved: solved.solo + solved.coop,
      perfect: stats.solo.perfect + stats.coop.perfect,
      ach: profile.achievements.length,
      at: Date.now(),
    };
    setCard(await encodeCode(c));
  };

  return (
    <main className={surface.wood}>
      <Ambience />
      <div className={`${surface.safe} ${s.layout}`}>
        <aside className={s.side}>
          <BackToDesk label="Escritorio" />
          <div className={s.wallet}>
            <div className={s.idCard}>
              <PlayerAvatar profile={profile} size={96} />
              <span className={s.idLines}>
                <span className={s.kicker}>Archivo DEADLINE</span>
                <span className={s.alias}>{profile.alias ?? 'Sin alias'}</span>
                <span className={s.number}>{profile.investigatorNumber}</span>
              </span>
            </div>
            <div className={s.shield} aria-label={`Placa: ${solo.label}`}>
              <span className={s.shieldRank}>{solo.label}</span>
              <span className={s.shieldNo}>{profile.investigatorNumber.slice(-4)}</span>
            </div>
          </div>
        </aside>
        <section className={`${s.sheet} ${surface.scroll}`}>
          <h1 className={s.title}>Hoja de servicio</h1>

          <div className={s.ranks}>
            <div className={s.rank}>
              <span className={s.kicker}>Rango individual</span>
              <strong>{solo.label}</strong>
              <span className={s.small}>{solo.description}</span>
              {soloNext.next && <Requirements stats={rankStatsFor(stats, 'solo', profile.soloMerit)} next={soloNext.next} />}
            </div>
            <div className={s.rank}>
              <span className={s.kicker}>Rango en pareja</span>
              <strong>{coop.label}</strong>
              <span className={s.small}>{coop.description}</span>
              {coopNext.next && <Requirements stats={rankStatsFor(stats, 'coop', profile.coopMerit)} next={coopNext.next} />}
            </div>
          </div>
          <dl className={s.stats}>
            <div>
              <dt>Puntos</dt>
              <dd>{profile.points}</dd>
            </div>
            <div>
              <dt>Mérito individual</dt>
              <dd>{profile.soloMerit}</dd>
            </div>
            <div>
              <dt>Mérito en pareja</dt>
              <dd>{profile.coopMerit}</dd>
            </div>
            <div>
              <dt>Casos resueltos</dt>
              <dd>
                {solved.solo} solo · {solved.coop} en pareja
              </dd>
            </div>
          </dl>

          <h2 className={s.h2}>Insignias</h2>
          <Insignias got={new Map(profile.achievements.map((a) => [a.id, a.at]))} />

          <h2 className={s.h2}>Alias</h2>
          <p className={s.small}>Con él te reconocen tus compañeros en las partidas en pareja. No hay registro central: nadie comprueba que sea único.</p>
          <div className={s.row}>
            <input className={s.input} value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="p. ej. inspectora_lane" autoCapitalize="none" autoCorrect="off" maxLength={20} aria-label="Alias" />
            <button className={s.primary} onClick={() => void saveAlias()}>
              Guardar
            </button>
          </div>
          {msg && <p className={s.hand}>{msg}</p>}

          <h2 className={s.h2}>Retrato</h2>
          <div className={s.presets}>
            {PRESETS.map((p) => (
              <button key={p} className={s.preset} aria-pressed={profile.avatar === p} onClick={() => void save({ avatar: p })} aria-label={`Silueta ${p.slice(7)}`}>
                <Portrait character={{ id: p, name: profile.alias ?? profile.investigatorNumber }} size={56} />
              </button>
            ))}
            <label className={s.upload}>
              Usar una foto
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await save({ avatar: await shrink(f) });
                }}
              />
            </label>
          </div>
          <p className={s.small}>La foto se reduce y se guarda solo en este dispositivo (y en tus copias). Se muestra con el tono del archivo.</p>

          <h2 className={s.h2}>Tarjeta de investigador</h2>
          <p className={s.small}>Un código con tu número, alias, rangos, méritos y logros. Tus amigos lo pegan en la máquina de escribir → Clasificación. Son datos declarados por ti: nadie los verifica. Genera una nueva cuando quieras actualizarla.</p>
          {card ? <CodeBox code={card} label="Tu tarjeta" /> : <button className={s.secondary} onClick={() => void makeCard()}>Generar mi tarjeta</button>}
        </section>
      </div>
    </main>
  );
}
