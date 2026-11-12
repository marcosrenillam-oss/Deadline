import { useState } from 'react';
import { newId, patchWorkspace, unlockedTimeline, visibleCharacters, type PlayerTimelineEntry } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { sound } from '../../audio/sound.ts';
import s from './case.module.css';

/**
 * 4 · CRONOLOGÍA. El jugador ordena las fichas que ha ido desbloqueando y
 * añade las suyas. Algunas fichas son versiones de un sospechoso que pueden
 * ser falsas: marcarlas como dudosas evita que cuenten en su contra.
 * Se compara con la cronología verdadera al cerrar el caso.
 */
export function TimelineTab() {
  const { c, k, inv, closed, patch } = useCase();
  const [custom, setCustom] = useState('');
  const [linking, setLinking] = useState<string | null>(null);
  if (!inv) return null;
  const entries = inv.timeline;
  const placed = new Set(entries.flatMap((e) => (e.eventId ? [e.eventId] : [])));
  const cards = unlockedTimeline(c, k)
    .filter((t) => !placed.has(t.id))
    .sort((a, b) => a.title.localeCompare(b.title, 'es'));
  const byId = new Map(c.timeline.map((t) => [t.id, t]));

  const set = (timeline: PlayerTimelineEntry[]) => patch((i) => patchWorkspace(i, { timeline }, Date.now()));
  const add = (entry: Omit<PlayerTimelineEntry, 'id' | 'evidence' | 'characters' | 'flagged'>) => {
    sound.play('key');
    set([...entries, { id: newId(), evidence: [], characters: [], flagged: false, ...entry }]);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= entries.length) return;
    const next = [...entries];
    [next[idx], next[j]] = [next[j]!, next[idx]!];
    set(next);
  };
  const update = (id: string, p: Partial<PlayerTimelineEntry>) => set(entries.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className={s.timeline}>
      {!closed && (
        <aside className={`${s.timelineCards} ${s.scroll}`}>
          <h2 className={s.h2}>Fichas desbloqueadas</h2>
          {cards.length === 0 && <p className={s.hand}>Investiga para conseguir más fichas.</p>}
          <ul className={s.eventCards}>
            {cards.map((t) => (
              <li key={t.id}>
                <button className={s.eventCard} onClick={() => add({ eventId: t.id })}>
                  <span className={s.eventTime}>{t.display}</span>
                  <span className={s.eventTitle}>{t.title}</span>
                  <span className={s.eventAdd}>Añadir ↓</span>
                </button>
              </li>
            ))}
          </ul>
          <form
            className={s.customForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (!custom.trim()) return;
              add({ customLabel: custom.trim().slice(0, 140) });
              setCustom('');
            }}
          >
            <label className={s.trayHelp} htmlFor="tl-custom">
              Anotación propia
            </label>
            <input id="tl-custom" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ej.: ¿alguien entra antes de las 22:00?" />
            <button className={s.primary} disabled={!custom.trim()}>
              Añadir
            </button>
          </form>
        </aside>
      )}
      <section className={`${s.sheet} ${s.scroll}`}>
        <h2 className={s.h2}>Tu reconstrucción</h2>
        {entries.length === 0 && <p className={s.hand}>Coloca aquí los acontecimientos en el orden en que crees que ocurrieron.</p>}
        <ol className={s.track}>
          {entries.map((e, idx) => {
            const ev = e.eventId ? byId.get(e.eventId) : undefined;
            const wrongFalse = closed && ev?.veracity === 'false' && !e.flagged;
            return (
              <li key={e.id} className={s.trackItem} data-flagged={e.flagged || undefined} data-false={wrongFalse || undefined}>
                <div className={s.trackMain}>
                  <span className={s.eventTime}>{ev?.display ?? 'Anotación'}</span>
                  <span className={s.eventTitle}>{ev?.title ?? e.customLabel}</span>
                  {(e.characters.length > 0 || e.evidence.length > 0) && (
                    <span className={s.trackLinks}>
                      {[...e.characters.map((id) => c.characters.find((x) => x.id === id)?.name), ...e.evidence.map((id) => c.evidence.find((x) => x.id === id)?.title)].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {closed && ev?.veracity === 'false' && <span className={s.missedNote}>Era falso</span>}
                </div>
                {!closed && (
                  <div className={s.trackActions}>
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Subir">
                      ↑
                    </button>
                    <button onClick={() => move(idx, 1)} disabled={idx === entries.length - 1} aria-label="Bajar">
                      ↓
                    </button>
                    <button aria-pressed={e.flagged} onClick={() => update(e.id, { flagged: !e.flagged })} aria-label="Marcar como dudoso">
                      ?
                    </button>
                    <button aria-pressed={linking === e.id} onClick={() => setLinking(linking === e.id ? null : e.id)} aria-label="Vincular personas y evidencias">
                      ⛓
                    </button>
                    <button onClick={() => set(entries.filter((x) => x.id !== e.id))} aria-label="Quitar">
                      ✕
                    </button>
                  </div>
                )}
                {linking === e.id && (
                  <div className={s.chips}>
                    {visibleCharacters(c, k).map((ch) => (
                      <button key={ch.id} className={s.chip} aria-pressed={e.characters.includes(ch.id)} onClick={() => update(e.id, { characters: toggleIn(e.characters, ch.id) })}>
                        {ch.name}
                      </button>
                    ))}
                    {c.evidence
                      .filter((x) => k.evidence.has(x.id))
                      .map((x) => (
                        <button key={x.id} className={s.chip} aria-pressed={e.evidence.includes(x.id)} onClick={() => update(e.id, { evidence: toggleIn(e.evidence, x.id) })}>
                          {x.title}
                        </button>
                      ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
