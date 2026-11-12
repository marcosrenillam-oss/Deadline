import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './app/App.tsx';
import { getMeta, setMeta } from './storage/meta.ts';

// Primer arranque: se registra una sola vez (útil para diagnóstico y, más adelante, para la guía opcional del escritorio).
void getMeta<number>('firstLaunchAt')
  .then((v) => (v === undefined ? setMeta('firstLaunchAt', Date.now()) : undefined))
  .catch((err: unknown) => console.error('[boot] IndexedDB no disponible', err));

const container = document.getElementById('root');
if (!container) throw new Error('Falta #root');
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
