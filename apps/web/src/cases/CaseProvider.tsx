import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  accuse as accuseCase,
  deserializeKnowledge,
  emptyKnowledge,
  expire,
  knowledgeDiff,
  readTimer,
  type Accusation,
  type CaseFile,
  type CaseRecord,
  type Investigation,
  type Knowledge,
  type Outcome,
} from '@deadline/core';
import { sound } from '../audio/sound.ts';
import { haptic } from '../audio/haptics.ts';
import { useProfile } from '../profile/ProfileProvider.tsx';
import { loadCase } from './contentRepo.ts';
import { latestInvestigation, getRecord, openInvestigation, saveInvestigation, settleCase } from './investigationRepo.ts';

export interface Toast {
  id: number;
  kind: 'evidence' | 'fact' | 'secret' | 'event' | 'detail' | 'contradiction' | 'deduction' | 'info' | 'miss';
  text: string;
}

interface CaseContextValue {
  c: CaseFile;
  inv: Investigation | null;
  record: CaseRecord | null;
  k: Knowledge;
  /** El expediente está cerrado (resuelto, fallido o por tiempo): modo archivo, solo lectura. */
  closed: boolean;
  remainingMs: number;
  open: () => Promise<void>;
  /** Ejecuta una acción del motor sobre la investigación activa y la guarda. */
  run: <T>(action: (c: CaseFile, inv: Investigation, now: number) => Outcome<T>) => T | undefined;
  /** Cambios del espacio de trabajo (tablero, cronología, marcas) sin efecto en el conocimiento. */
  patch: (fn: (inv: Investigation) => Investigation) => void;
  accuse: (a: Omit<Accusation, 'submittedAt'>) => Promise<void>;
  toasts: Toast[];
  notify: (kind: Toast['kind'], text: string) => void;
  dismiss: (id: number) => void;
}

const Ctx = createContext<CaseContextValue | null>(null);

export function useCase(): CaseContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCase fuera de <CaseProvider>');
  return v;
}

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; c: CaseFile };

export function CaseProvider({ caseId, children, fallback }: { caseId: string; children: ReactNode; fallback: (s: { status: 'loading' } | { status: 'error'; message: string }) => ReactNode }) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [inv, setInv] = useState<Investigation | null>(null);
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { reload: reloadProfile } = useProfile();
  const invRef = useRef<Investigation | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading' });
    (async () => {
      const c = await loadCase(caseId);
      const [latest, rec] = await Promise.all([latestInvestigation(caseId), getRecord(caseId)]);
      if (!alive) return;
      invRef.current = latest ?? null;
      setInv(latest ?? null);
      setRecord(rec ?? null);
      setLoad({ status: 'ready', c });
    })().catch((err: unknown) => alive && setLoad({ status: 'error', message: err instanceof Error ? err.message : String(err) }));
    return () => {
      alive = false;
    };
  }, [caseId]);

  // Guardado: inmediato para lo importante, agrupado para cambios rápidos (arrastrar en el tablero).
  const persist = useCallback((next: Investigation, immediate: boolean) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const write = () => void saveInvestigation(next).catch((e: unknown) => console.error('[case] No se pudo guardar', e));
    if (immediate) write();
    else saveTimer.current = setTimeout(write, 400);
  }, []);

  useEffect(
    () => () => {
      // Al salir, se guarda lo pendiente.
      if (saveTimer.current && invRef.current) {
        clearTimeout(saveTimer.current);
        void saveInvestigation(invRef.current);
      }
    },
    [],
  );

  const notify = useCallback((kind: Toast['kind'], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-1), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'miss' ? 1800 : 3200);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const c = load.status === 'ready' ? load.c : null;

  const announce = useCallback(
    (cf: CaseFile, before: Knowledge, after: Knowledge) => {
      const d = knowledgeDiff(before, after);
      let found = false;
      for (const id of d.evidence) (notify('evidence', `Nueva evidencia: ${cf.evidence.find((e) => e.id === id)?.title ?? id}`), (found = true));
      for (const id of d.details) (notify('detail', cf.evidence.flatMap((e) => e.details).find((x) => x.id === id)?.label ?? 'Detalle advertido'), (found = true));
      for (const id of d.contradictions) (notify('contradiction', `Contradicción: ${cf.contradictions.find((x) => x.id === id)?.title ?? id}`), (found = true));
      for (const id of d.secrets) (notify('secret', 'Has descubierto un secreto'), (found = true), void id);
      for (const id of d.facts) {
        const f = cf.facts.find((x) => x.id === id);
        if (f?.important) (notify('fact', f.text), (found = true));
      }
      if (d.timelineEvents.length) notify('event', d.timelineEvents.length === 1 ? 'Nueva ficha para la cronología' : `${d.timelineEvents.length} fichas nuevas para la cronología`);
      if (found) {
        sound.play('stamp');
        haptic('confirm');
      }
    },
    [notify],
  );

  const run = useCallback(
    <T,>(action: (c: CaseFile, inv: Investigation, now: number) => Outcome<T>): T | undefined => {
      const current = invRef.current;
      if (!c || !current || current.status !== 'active') return undefined;
      const t = Date.now();
      if (readTimer({ ...current, localNow: t }).expired) return undefined;
      const out = action(c, current, t);
      if (out.inv !== current) {
        announce(c, deserializeKnowledge(current.knowledge), deserializeKnowledge(out.inv.knowledge));
        invRef.current = out.inv;
        setInv(out.inv);
        persist(out.inv, true);
      }
      return out.result;
    },
    [c, announce, persist],
  );

  const patch = useCallback(
    (fn: (inv: Investigation) => Investigation) => {
      const current = invRef.current;
      if (!current || current.status !== 'active') return;
      const next = fn(current);
      invRef.current = next;
      setInv(next);
      persist(next, false);
    },
    [persist],
  );

  const open = useCallback(async () => {
    if (!c) return;
    const { inv: fresh, record: rec } = await openInvestigation(c);
    invRef.current = fresh;
    setInv(fresh);
    setRecord(rec);
    sound.play('paper');
    haptic('confirm');
  }, [c]);

  const accuse = useCallback(
    async (a: Omit<Accusation, 'submittedAt'>) => {
      const current = invRef.current;
      if (!c || !current || !record || current.status !== 'active') return;
      const s = accuseCase(c, current, record, a, Date.now());
      await settleCase(s.inv, s.record, s.result.total);
      invRef.current = s.inv;
      setInv(s.inv);
      setRecord(s.record);
      await reloadProfile();
    },
    [c, record, reloadProfile],
  );

  // Reloj: marcas de tiempo reales; se recalcula cada segundo y al volver a la app.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const timer = inv ? readTimer({ startedAt: inv.startedAt, deadlineAt: inv.deadlineAt, lastObservedAt: inv.lastObservedAt, localNow: now }) : null;

  // Tiempo agotado: el expediente se cierra.
  useEffect(() => {
    if (!c || !inv || !record || inv.status !== 'active' || !timer?.expired) return;
    const s = expire(c, inv, record, Date.now());
    invRef.current = s.inv;
    setInv(s.inv);
    setRecord(s.record);
    void settleCase(s.inv, s.record, 0);
    notify('info', 'Se agotó el tiempo: el expediente queda cerrado.');
  }, [c, inv, record, timer?.expired, notify]);

  const value = useMemo<CaseContextValue | null>(() => {
    if (!c) return null;
    return {
      c,
      inv,
      record,
      k: inv ? deserializeKnowledge(inv.knowledge) : emptyKnowledge(),
      closed: !!inv && inv.status !== 'active',
      remainingMs: timer?.remainingMs ?? 0,
      open,
      run,
      patch,
      accuse,
      toasts,
      notify,
      dismiss,
    };
  }, [c, inv, record, timer?.remainingMs, open, run, patch, accuse, toasts, notify, dismiss]);

  if (load.status !== 'ready' || !value) return <>{fallback(load.status === 'ready' ? { status: 'loading' } : load)}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
