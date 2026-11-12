/**
 * Almacenamiento persistente del navegador.
 * En iOS/Safari `persist()` puede concederse o no según el uso; aunque se
 * conceda, no debemos asumir que los datos son eternos (ver docs/IOS_PWA.md).
 */
export interface StorageStatus {
  supported: boolean;
  persisted: boolean | null;
  usage: number | null;
  quota: number | null;
}

export async function getStorageStatus(): Promise<StorageStatus> {
  const s = typeof navigator !== 'undefined' ? navigator.storage : undefined;
  if (!s) return { supported: false, persisted: null, usage: null, quota: null };
  const [persisted, estimate] = await Promise.all([
    s.persisted ? s.persisted().catch(() => null) : Promise.resolve(null),
    s.estimate ? s.estimate().catch(() => null) : Promise.resolve(null),
  ]);
  return { supported: true, persisted, usage: estimate?.usage ?? null, quota: estimate?.quota ?? null };
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export function formatBytes(n: number | null): string {
  if (n === null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
