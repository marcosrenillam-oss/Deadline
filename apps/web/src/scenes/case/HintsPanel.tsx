import { HINT_PENALTY_PCT, nextHintLine, revealedHints, useHint as takeHint } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { sound } from '../../audio/sound.ts';
import { Sheet } from '../../ui/Sheet.tsx';
import s from './tools.module.css';

const LEVEL = { 1: 'Orientación sutil', 2: 'Orientación intermedia', 3: 'Orientación concreta' } as const;

export function HintsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c, inv, run } = useCase();
  if (!inv) return null;
  const shown = revealedHints(c, inv);
  const next = nextHintLine(c, inv);
  const left = c.maxHints - inv.hintsUsed.length;
  return (
    <Sheet open={open} onClose={onClose} title="Pistas del comisario">
      <p className={s.note}>
        Orientan, no resuelven. Cada una resta puntos a la acusación ({HINT_PENALTY_PCT[1]} %, {HINT_PENALTY_PCT[2]} % o {HINT_PENALTY_PCT[3]} % según lo
        concreta que sea). Te quedan {left} de {c.maxHints}.
      </p>
      <ol className={s.hints}>
        {shown.map((h, i) => (
          <li key={i} className={s.hint}>
            <span className={s.who}>
              {h.topic} · {LEVEL[h.level]}
            </span>
            <span className={s.hand}>{h.text}</span>
          </li>
        ))}
      </ol>
      {next ? (
        <button
          className={s.primary}
          onClick={() => {
            sound.play('page');
            run((cf, i, now) => takeHint(cf, i, now));
          }}
        >
          Pedir una pista ({LEVEL[next.level].toLowerCase()})
        </button>
      ) : (
        <p className={s.note}>{left <= 0 ? 'No quedan pistas para este expediente.' : 'Ahora mismo no hay ninguna pista pertinente: vas por buen camino o ya tienes lo necesario.'}</p>
      )}
    </Sheet>
  );
}
