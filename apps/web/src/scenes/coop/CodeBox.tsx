import { useState } from 'react';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './coop.module.css';

/** Un código para enviar al compañero: copiar o compartir (Mensajes, WhatsApp, AirDrop…). */
export function CodeBox({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: code, title: 'DEADLINE' });
      else await copy();
    } catch {
      /* el jugador cerró la hoja de compartir */
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      sound.play('tap');
      haptic('light');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={s.codeBox}>
      <p className={s.label}>{label}</p>
      <textarea className={s.code} readOnly value={code} rows={3} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
      <div className={s.row}>
        <button className={s.primary} onClick={() => void share()}>
          Enviar
        </button>
        <button className={s.secondary} onClick={() => void copy()}>
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
        <span className={s.small}>{code.length} caracteres</span>
      </div>
    </div>
  );
}

/** Recibir un código: pegar el texto que envió el compañero. */
export function PasteBox({ label, action, onCode, busy }: { label: string; action: string; onCode: (code: string) => void | Promise<void>; busy?: boolean }) {
  const [text, setText] = useState('');
  const paste = async () => {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      /* sin permiso: el jugador puede pegar a mano */
    }
  };
  return (
    <div className={s.codeBox}>
      <p className={s.label}>{label}</p>
      <textarea className={s.code} value={text} rows={3} placeholder="DL1.…" aria-label={label} onChange={(e) => setText(e.target.value)} />
      <div className={s.row}>
        <button
          className={s.primary}
          disabled={!text.trim() || busy}
          onClick={() =>
            void Promise.resolve(onCode(text.trim())).then(() => {
              setText('');
            })
          }
        >
          {action}
        </button>
        <button className={s.secondary} onClick={() => void paste()}>
          Pegar
        </button>
      </div>
    </div>
  );
}
