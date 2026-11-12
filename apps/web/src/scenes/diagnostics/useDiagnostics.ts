import { useCallback, useEffect, useState } from 'react';
import { DB_VERSION, getDB, storeCounts } from '../../storage/db.ts';
import { getMeta, setMeta } from '../../storage/meta.ts';
import { getStorageStatus, type StorageStatus } from '../../storage/persistence.ts';
import { hasCoarsePointer, isIOS, isStandalone } from '../../platform/env.ts';

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Mide env(safe-area-inset-*) reales con un elemento sonda. */
export function measureSafeArea(): SafeAreaInsets {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const out = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
  probe.remove();
  return out;
}

export interface Diagnostics {
  standalone: boolean;
  ios: boolean;
  coarsePointer: boolean;
  viewport: { w: number; h: number; dpr: number };
  orientation: string;
  safeArea: SafeAreaInsets;
  idb: { ok: boolean; version?: number; counts?: Record<string, number>; error?: string };
  storage: StorageStatus;
  serviceWorker: { supported: boolean; registered: boolean; controlled: boolean; state?: string };
  firstLaunchAt?: number;
}

async function collect(): Promise<Diagnostics> {
  const base = {
    standalone: isStandalone(),
    ios: isIOS(),
    coarsePointer: hasCoarsePointer(),
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    orientation: screen.orientation?.type ?? (window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'),
    safeArea: measureSafeArea(),
  };
  let idb: Diagnostics['idb'];
  let firstLaunchAt: number | undefined;
  try {
    const db = await getDB();
    idb = { ok: true, version: db.version, counts: await storeCounts() };
    firstLaunchAt = await getMeta<number>('firstLaunchAt');
  } catch (err) {
    idb = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  const swSupported = 'serviceWorker' in navigator;
  const reg = swSupported ? await navigator.serviceWorker.getRegistration().catch(() => undefined) : undefined;
  const worker = reg?.active ?? reg?.waiting ?? reg?.installing;
  return {
    ...base,
    idb,
    storage: await getStorageStatus(),
    serviceWorker: {
      supported: swSupported,
      registered: !!reg,
      controlled: swSupported && !!navigator.serviceWorker.controller,
      ...(worker ? { state: worker.state } : {}),
    },
    ...(firstLaunchAt !== undefined ? { firstLaunchAt } : {}),
  };
}

export function useDiagnostics() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const refresh = useCallback(() => {
    collect().then(setData, (err: unknown) => console.error('[diag]', err));
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('orientationchange', refresh);
    };
  }, [refresh]);
  return { data, refresh };
}

/** Escribe y relee un valor en IndexedDB; devuelve la latencia en ms. */
export async function idbRoundTrip(): Promise<number> {
  const t0 = performance.now();
  const token = crypto.randomUUID();
  await setMeta('diagnostics.roundtrip', token);
  const back = await getMeta<string>('diagnostics.roundtrip');
  if (back !== token) throw new Error('El valor leído no coincide con el escrito');
  return performance.now() - t0;
}

export { DB_VERSION };
