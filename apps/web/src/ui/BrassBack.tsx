import { useNavigate } from 'react-router';
import { sound } from '../audio/sound.ts';
import s from './BrassBack.module.css';

/** Placa de latón para volver al despacho (o a otra pantalla). */
export function BrassBack({ to = '/', label = 'Despacho' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      className={`m-brass ${s.back}`}
      onClick={() => {
        sound.play('tap');
        void navigate(to);
      }}
      aria-label={`Volver: ${label}`}
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
