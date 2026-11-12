import { useState } from 'react';
import { useNavigate } from 'react-router';
import { formatRemaining, reopenCost, timeLimitMinutes } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { NotEnoughPoints } from '../../cases/investigationRepo.ts';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { formatDuration } from '../../cases/labels.ts';
import s from './case.module.css';

const OUTCOME: Record<string, string> = { success: 'Resuelto', partial: 'Resuelto a medias', failure: 'Acusación fallida', expired: 'Cerrado por tiempo' };

/** Reapertura e historial de intentos de un expediente cerrado. */
export function ReopenPanel() {
  const { c, closed, reopen, attempts, base, coop } = useCase();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!closed || coop) return null;
  const cost = reopenCost(c);
  const balance = profile?.points ?? 0;
  const affordable = balance >= cost;

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      await reopen();
      void navigate(base);
    } catch (e) {
      setError(e instanceof NotEnoughPoints ? e.message : e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  return (
    <section className={s.reopen} aria-labelledby="reopen-title">
      <h2 id="reopen-title" className={s.h2}>
        Reabrir el expediente
      </h2>
      <p className={s.trayHelp}>
        Empieza una investigación nueva con otros {timeLimitMinutes(c)} minutos ({formatRemaining(timeLimitMinutes(c) * 60_000)}). Conservas las evidencias,
        detalles, hechos, fichas, tu tablero, tu cronología y tus notas; tendrás que volver a interrogar. Los puntos ya cobrados no se vuelven a cobrar.
      </p>
      <p className={s.trayHelp}>
        Cuesta <strong>{cost} puntos</strong>. Tienes {balance}.
      </p>
      {!confirm ? (
        <button className={s.primary} disabled={!affordable || busy} onClick={() => setConfirm(true)}>
          Reabrir por {cost} puntos
        </button>
      ) : (
        <div className={s.sealRow}>
          <button className={s.secondary} onClick={() => setConfirm(false)}>
            Cancelar
          </button>
          <button className={s.primary} disabled={busy} onClick={() => void go()}>
            Confirmar y pagar
          </button>
        </div>
      )}
      {!affordable && <p className={s.hand}>Te faltan {cost - balance} puntos. Resolver otros expedientes te los dará.</p>}
      {error && <p className={s.warn}>{error}</p>}
      {attempts.length > 0 && (
        <>
          <h2 className={s.h2}>Historial de este expediente</h2>
          <ol className={s.list} reversed>
            {attempts.map((a) => (
              <li key={a.id}>
                Intento {a.attempt} · {new Date(a.startedAt).toLocaleString('es-ES')} · {a.result ? OUTCOME[a.result.outcome] : 'en curso'}
                {a.result ? ` · ${formatDuration(a.result.elapsedMs)} · ${a.result.total} puntos` : ''}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
