import { useEffect, useState } from 'react';
import { isValidUsername, normalizeUsername } from '@deadline/core';
import { accountSkipped, createAccount, getAccount, login, skipAccount, syncProgress } from './accountRepo.ts';
import { useProfile } from '../profile/ProfileProvider.tsx';
import { sound } from '../audio/sound.ts';
import s from './AccountGate.module.css';

/** En pruebas automáticas la credencial no aparece salvo que la prueba la pida. */
const automated = () => {
  try {
    return navigator.webdriver && !localStorage.getItem('deadline:test-account-gate');
  } catch {
    return false;
  }
};

/**
 * LA CREDENCIAL: al entrar por primera vez se crea la cuenta (usuario y
 * contraseña) o se entra con una existente para recuperar el progreso.
 * «Ahora no» deja jugar sin cuenta; se puede crear luego desde la ficha.
 */
export function AccountGate() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'create' | 'login'>('create');
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reload } = useProfile();

  useEffect(() => {
    // La ficha puede pedir la credencial más tarde (si se eligió «Ahora no»).
    const ask = (e: Event) => {
      setMode((e as CustomEvent<'create' | 'login'>).detail ?? 'create');
      setShow(true);
    };
    window.addEventListener('deadline:account', ask);
    if (!automated()) void Promise.all([getAccount(), accountSkipped()]).then(([acc, skipped]) => setShow(!acc && !skipped));
    return () => window.removeEventListener('deadline:account', ask);
  }, []);

  if (!show) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = normalizeUsername(u);
    if (!isValidUsername(name)) return setError('El usuario admite de 3 a 20 letras minúsculas, números o «_».');
    if (p.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    setBusy(true);
    const r = mode === 'create' ? await createAccount(name, p) : await login(name, p);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    sound.play('stamp');
    await reload();
    setShow(false);
  };

  return (
    <div className={s.gate} role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <form className={s.wallet} onSubmit={(e) => void submit(e)}>
        <div className={s.card}>
          <p className={s.kicker}>Archivo DEADLINE · Credencial de investigador</p>
          <h1 id="gate-title" className={s.title}>
            {mode === 'create' ? 'Crea tu credencial' : 'Entra con tu credencial'}
          </h1>
          <p className={s.note}>
            {mode === 'create'
              ? 'Solo un nombre de usuario y una contraseña. Tu progreso se guarda en el archivo central: si borras la app, entras y lo recuperas todo.'
              : 'Recupera tu progreso: casos, puntos, rangos, logros, notas y partidas.'}
          </p>
          <label className={s.field}>
            <span>Usuario</span>
            <input value={u} onChange={(e) => setU(e.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="username" maxLength={20} placeholder="inspectora_lane" />
          </label>
          <label className={s.field}>
            <span>Contraseña</span>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} placeholder="mínimo 8 caracteres" />
          </label>
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <button className={s.seal} disabled={busy}>
            {busy ? 'Un momento…' : mode === 'create' ? 'Crear y entrar' : 'Entrar'}
          </button>
          <div className={s.row}>
            <button type="button" className={s.link} onClick={() => (setMode(mode === 'create' ? 'login' : 'create'), setError(null))}>
              {mode === 'create' ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
            </button>
            <button
              type="button"
              className={s.link}
              onClick={() => {
                void skipAccount();
                setShow(false);
              }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/** Sube y baja el progreso solo: al abrir la app, al salir de ella y cada pocos minutos. */
export function AccountSync() {
  useEffect(() => {
    const run = () => void syncProgress();
    run();
    const onHide = () => document.visibilityState === 'hidden' && run();
    document.addEventListener('visibilitychange', onHide);
    const t = setInterval(run, 3 * 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      clearInterval(t);
    };
  }, []);
  return null;
}
