import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ACHIEVEMENTS,
  DIFFICULTY_LABELS,
  RANK_DEFINITIONS,
  dedupeCoop,
  formatCaseNumber,
  plainText,
  type CaseCatalogEntry,
  type CaseFile,
  type Friend,
  type Investigation,
} from '@deadline/core';
import { getDB } from '../../storage/db.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { useProgress } from '../../progression/useProgress.ts';
import { importCard, listFriends, removeFriend } from '../../progression/friendsRepo.ts';
import { PasteBox } from '../coop/CodeBox.tsx';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import { sound } from '../../audio/sound.ts';
import { formatDuration } from '../../cases/labels.ts';
import surface from '../../ui/Surface.module.css';
import tabs from '../settings/SettingsScene.module.css';
import s from './HistoryScene.module.css';

const TABS = [
  { id: 'log', label: 'Historial' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'achievements', label: 'Logros' },
  { id: 'friends', label: 'Clasificación' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const OUTCOME: Record<string, string> = { success: 'Resuelto', partial: 'Resuelto a medias', failure: 'Acusación fallida', expired: 'Cerrado por tiempo' };
const MODE: Record<string, string> = { individual: 'Individual', daily: 'Diario', coop: 'En pareja' };
const rankLabel = (id: string) => RANK_DEFINITIONS.find((r) => r.id === id)?.label ?? id;
const dateTime = (t: number) => new Date(t).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

interface Data {
  investigations: Investigation[];
  catalog: Map<string, CaseCatalogEntry>;
  coopRoute: Map<string, string>;
}

async function loadData(): Promise<Data> {
  const db = await getDB();
  const [investigations, catalog, sessions] = await Promise.all([db.getAll('investigations'), db.getAll('catalog'), db.getAll('coopSessions')]);
  return {
    investigations: dedupeCoop(investigations).sort((a, b) => b.startedAt - a.startedAt),
    catalog: new Map(catalog.map((e) => [e.id, e])),
    coopRoute: new Map(sessions.map((x) => [x.id, `/pareja/${x.id}`])),
  };
}

/** Traduce una línea del diario de actividad a texto mecanografiado. */
function describe(c: CaseFile | undefined, type: string, ref: string | undefined): string {
  const ev = (id?: string) => (c && id ? c.evidence.find((e) => e.id === id)?.title : undefined);
  switch (type) {
    case 'open':
      return 'Se abre el expediente.';
    case 'reopen':
      return 'Se reabre el expediente.';
    case 'examine':
      return `Examina: ${ev(ref) ?? 'una evidencia'}.`;
    case 'detail': {
      const d = c?.evidence.flatMap((e) => e.details).find((x) => x.id === ref);
      return `Detalle hallado: ${d?.label ?? 'un detalle oculto'}.`;
    }
    case 'ask': {
      const qid = ref?.split('#')[0];
      for (const i of c?.interrogations ?? [])
        for (const t of i.topics)
          for (const q of t.questions)
            if (q.id === qid) return `Pregunta a ${c?.characters.find((x) => x.id === i.characterId)?.name ?? 'un testigo'}: «${plainText(q.prompt)}»`;
      return 'Formula una pregunta.';
    }
    case 'deduction':
      return `Deducción: ${c?.deductions.find((d) => d.id === ref)?.title ?? 'relaciona dos piezas'}.`;
    case 'compare-miss':
      return 'Relaciona dos piezas sin resultado.';
    case 'contradiction':
      return `Contradicción: ${c?.contradictions.find((x) => x.id === ref)?.title ?? 'señalada'}.`;
    case 'contradiction-miss':
      return 'Señala una contradicción que no se sostiene.';
    case 'hint':
      return `Consulta una pista (nivel ${ref?.split(':')[1] ?? '?'}).`;
    case 'received':
      return 'Recibe material del compañero.';
    case 'accuse':
      return `Acusación formal: ${OUTCOME[ref ?? ''] ?? ref}.`;
    case 'expire':
      return 'Se agota el tiempo.';
    default:
      return type;
  }
}

function ActivityLog({ inv }: { inv: Investigation }) {
  const [c, setC] = useState<CaseFile | undefined>();
  useEffect(() => {
    void getDB()
      .then((db) => db.get('caseContent', inv.caseId))
      .then((x) => setC(x?.data));
  }, [inv.caseId]);
  if (!inv.log.length) return <p className={s.typed}>Sin actividad registrada.</p>;
  return (
    <ol className={s.activity}>
      {inv.log.map((l, i) => {
        const sec = Math.max(0, Math.floor((l.at - inv.startedAt) / 1000));
        return (
          <li key={i}>
            <span className={s.stamp}>
              +{String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}
            </span>{' '}
            {describe(c, l.type, l.ref)}
          </li>
        );
      })}
    </ol>
  );
}

function LogTab({ data }: { data: Data }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!data.investigations.length) return <p className={s.typed}>La hoja está en blanco. Abre un expediente desde la carpeta o el calendario y aquí quedará constancia de todo.</p>;
  return (
    <ul className={s.entries}>
      {data.investigations.map((inv) => {
        const e = data.catalog.get(inv.caseId);
        const route = inv.mode === 'coop' && inv.coopSessionId ? data.coopRoute.get(inv.coopSessionId) : `/expediente/${inv.caseId}`;
        const outcome = inv.result ? OUTCOME[inv.result.outcome] : inv.status === 'active' ? 'En curso' : inv.status;
        return (
          <li key={inv.id} className={s.entry} data-outcome={inv.result?.outcome ?? 'active'}>
            <div className={s.entryHead}>
              <span className={s.case}>
                {formatCaseNumber(inv.caseId)} · {e?.title ?? inv.caseId}
              </span>
              <span className={s.outcome}>{outcome}</span>
            </div>
            <p className={s.typed}>
              {MODE[inv.mode]} · intento {inv.attempt}
              {inv.role ? ` · papel ${inv.role}` : ''} · {dateTime(inv.startedAt)}
              {inv.result ? ` · ${formatDuration(inv.result.elapsedMs)} · ${inv.result.total} puntos` : ''}
              {inv.hintsUsed.length ? ` · ${inv.hintsUsed.length} pista${inv.hintsUsed.length > 1 ? 's' : ''}` : ''}
            </p>
            <div className={s.entryActions}>
              <button className={s.link} aria-expanded={open === inv.id} onClick={() => (sound.play('key'), setOpen(open === inv.id ? null : inv.id))}>
                {open === inv.id ? 'Ocultar registro' : 'Ver registro de actividad'}
              </button>
              {route && (
                <Link className={s.link} to={inv.result ? `${route}/informe` : route}>
                  {inv.result ? 'Ver informe' : 'Volver al expediente'}
                </Link>
              )}
            </div>
            {open === inv.id && <ActivityLog inv={inv} />}
          </li>
        );
      })}
    </ul>
  );
}

function StatsTab() {
  const progress = useProgress();
  if (!progress) return <p className={s.typed}>Calculando…</p>;
  const { stats } = progress;
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  const dur = (x: number | null) => (x === null ? '—' : formatDuration(x));
  const rows: Array<[string, string, string]> = [
    ['Expedientes abiertos', String(stats.solo.opened), String(stats.coop.opened)],
    ['Intentos', String(stats.solo.attempts), String(stats.coop.attempts)],
    ['Expedientes resueltos', String(stats.solo.solvedCases), String(stats.coop.solvedCases)],
    ['Actas impecables', String(stats.solo.perfect), String(stats.coop.perfect)],
    ['Acusaciones', String(stats.solo.accusations), String(stats.coop.accusations)],
    ['Culpable acertado', String(stats.solo.correctCulprit), String(stats.coop.correctCulprit)],
    ['Precisión (últimas 20)', pct(stats.solo.recentAccuracy), pct(stats.coop.recentAccuracy)],
    ['Acusaciones fallidas', String(stats.solo.failures), String(stats.coop.failures)],
    ['Cerrados por tiempo', String(stats.solo.expired), String(stats.coop.expired)],
    ['Pistas consultadas', String(stats.solo.hintsUsed), String(stats.coop.hintsUsed)],
    ['Tiempo medio de resolución', dur(stats.solo.avgSolveMs), dur(stats.coop.avgSolveMs)],
    ['Resolución más rápida', dur(stats.solo.fastestSolveMs), dur(stats.coop.fastestSolveMs)],
    ['Tiempo investigado', dur(stats.solo.totalPlayMs), dur(stats.coop.totalPlayMs)],
    ['Puntos obtenidos', String(stats.solo.pointsEarned), String(stats.coop.pointsEarned)],
  ];
  return (
    <>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">Individual</th>
            <th scope="col">En pareja</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className={s.h2}>Por dificultad (resueltos)</h2>
      <p className={s.typed}>
        {(['detective', 'inspector', 'special-unit'] as const).map((d) => `${DIFFICULTY_LABELS[d]}: ${stats.solo.solvedByDifficulty[d] + stats.coop.solvedByDifficulty[d]}`).join(' · ')}
      </p>
      <h2 className={s.h2}>Casos del día</h2>
      <p className={s.typed}>
        Resueltos: {stats.daily.solved} · Racha actual: {stats.daily.currentStreak} día{stats.daily.currentStreak === 1 ? '' : 's'} · Mejor racha: {stats.daily.bestStreak}
      </p>
      <h2 className={s.h2}>Hallazgos</h2>
      <p className={s.typed}>
        Evidencias {stats.discoveries.evidence} · Detalles ocultos {stats.discoveries.details} · Contradicciones {stats.discoveries.contradictions} · Secretos {stats.discoveries.secrets} · Deducciones{' '}
        {stats.discoveries.deductions}
      </p>
      <p className={s.note}>Se cuentan todos los intentos: lo que vuelves a encontrar al reabrir un caso suma de nuevo aquí, pero no en los puntos.</p>
    </>
  );
}

function AchievementsTab() {
  const { profile } = useProfile();
  const progress = useProgress();
  if (!profile || !progress) return <p className={s.typed}>Calculando…</p>;
  const got = new Map(profile.achievements.map((a) => [a.id, a.at]));
  const ctx = { stats: progress.stats, soloMerit: profile.soloMerit, coopMerit: profile.coopMerit };
  const secretsLeft = ACHIEVEMENTS.filter((a) => a.secret && !got.has(a.id)).length;
  return (
    <>
      <p className={s.typed}>
        {got.size} de {ACHIEVEMENTS.length} logros.{secretsLeft ? ` Quedan ${secretsLeft} secretos por descubrir.` : ''}
      </p>
      <ul className={s.achievements}>
        {ACHIEVEMENTS.filter((a) => !a.secret || got.has(a.id)).map((a) => {
          const at = got.get(a.id);
          const prog = !at && a.progress ? a.progress(ctx) : null;
          return (
            <li key={a.id} className={s.achievement} data-got={at ? 'true' : undefined}>
              <strong>{a.label}</strong>
              {a.secret && <span className={s.secret}>secreto</span>}
              <span>{a.description}</span>
              <span className={s.meta}>
                {at ? `Conseguido el ${new Date(at).toLocaleDateString('es-ES')}` : prog ? `${prog[0]} / ${prog[1]}` : 'Pendiente'}
                {a.reward ? ` · ${a.reward} puntos` : ''}
              </span>
            </li>
          );
        })}
        {Array.from({ length: secretsLeft }, (_, i) => (
          <li key={`secret-${i}`} className={s.achievement} data-hidden="true">
            <strong>· · ·</strong>
            <span>Logro secreto. Se revela al conseguirlo.</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function FriendsTab() {
  const { profile } = useProfile();
  const progress = useProgress();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [by, setBy] = useState<'solo' | 'coop'>('solo');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void listFriends().then(setFriends);
  }, []);
  const rows = useMemo(() => {
    if (!profile || !progress) return [];
    const me = {
      key: 'me',
      name: profile.alias ?? 'Tú',
      number: profile.investigatorNumber,
      soloRank: progress.soloRank.id,
      coopRank: progress.coopRank.id,
      soloMerit: profile.soloMerit,
      coopMerit: profile.coopMerit,
      solved: progress.stats.solo.solvedCases + progress.stats.coop.solvedCases,
      at: null as number | null,
      me: true,
    };
    const others = friends.map((f) => ({
      key: f.number,
      name: f.card.a ?? 'Sin alias',
      number: f.number,
      soloRank: f.card.soloRank,
      coopRank: f.card.coopRank,
      soloMerit: f.card.soloMerit,
      coopMerit: f.card.coopMerit,
      solved: f.card.solved,
      at: f.card.at,
      me: false,
    }));
    return [me, ...others].sort((a, b) => (by === 'solo' ? b.soloMerit - a.soloMerit : b.coopMerit - a.coopMerit) || b.solved - a.solved);
  }, [profile, progress, friends, by]);

  const onCode = async (code: string) => {
    setBusy(true);
    setMsg(null);
    const r = await importCard(code);
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    sound.play('stamp');
    setMsg(r.status === 'added' ? `Añadido: ${r.friend.card.a ?? r.friend.number}.` : `Tarjeta actualizada: ${r.friend.card.a ?? r.friend.number}.`);
    setFriends(await listFriends());
  };

  return (
    <>
      <p className={s.note}>
        Solo amigos, sin clasificación pública. Cada fila es la última tarjeta que te pasaron: son datos declarados por cada investigador y nadie los verifica. Para actualizar a
        alguien, pídele una tarjeta nueva.
      </p>
      <div className={s.toggle} role="radiogroup" aria-label="Ordenar por">
        <button role="radio" aria-checked={by === 'solo'} onClick={() => setBy('solo')}>
          Mérito individual
        </button>
        <button role="radio" aria-checked={by === 'coop'} onClick={() => setBy('coop')}>
          Mérito en pareja
        </button>
      </div>
      <ol className={s.board}>
        {rows.map((r, i) => (
          <li key={r.key} data-me={r.me || undefined}>
            <span className={s.pos}>{i + 1}</span>
            <span className={s.who}>
              <strong>{r.me && profile?.alias ? `${r.name} (tú)` : r.name}</strong>
              <span className={s.meta}>
                {r.number} · {rankLabel(by === 'solo' ? r.soloRank : r.coopRank)} · {r.solved} {r.solved === 1 ? 'resuelto' : 'resueltos'}
                {r.at ? ` · tarjeta del ${new Date(r.at).toLocaleDateString('es-ES')}` : ''}
              </span>
            </span>
            <span className={s.merit}>{by === 'solo' ? r.soloMerit : r.coopMerit}</span>
            {!r.me && (
              <button
                className={s.remove}
                aria-label={`Quitar a ${r.name}`}
                onClick={async () => {
                  await removeFriend(r.number);
                  setFriends(await listFriends());
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ol>
      {friends.length === 0 && <p className={s.typed}>Aún no has añadido a nadie. Tu tarjeta está en tu ficha (la placa de la mesa).</p>}
      <PasteBox label="Pega la tarjeta de un amigo" action="Añadir a la clasificación" onCode={onCode} busy={busy} />
      {msg && (
        <p className={s.typed} role="status">
          {msg}
        </p>
      )}
    </>
  );
}

/** LA MÁQUINA DE ESCRIBIR: registro de investigaciones, estadísticas, logros y clasificación entre amigos. */
export function HistoryScene() {
  const [tab, setTab] = useState<TabId>('log');
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    void loadData().then(setData);
  }, []);
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${tabs.layout}`}>
        <nav className={tabs.side} aria-label="Apartados del registro">
          <BackToDesk label="Escritorio" />
          <div role="tablist" aria-orientation="vertical" className={tabs.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={t.id === tab}
                aria-controls={`panel-${t.id}`}
                className={tabs.tab}
                onClick={() => {
                  sound.play('key');
                  setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
        <section key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={`${s.sheet} ${surface.scene} ${surface.scroll}`}>
          <h1 className={s.title}>{current.id === 'log' ? 'Registro de investigaciones' : current.label}</h1>
          {tab === 'log' && (data ? <LogTab data={data} /> : <p className={s.typed}>Cargando el registro…</p>)}
          {tab === 'stats' && <StatsTab />}
          {tab === 'achievements' && <AchievementsTab />}
          {tab === 'friends' && <FriendsTab />}
        </section>
      </div>
    </main>
  );
}
