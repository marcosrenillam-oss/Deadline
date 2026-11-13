import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/materials.css';
import { App } from './app/App.tsx';
import { getMeta, setMeta } from './storage/meta.ts';
import { startArchiveSync } from './cases/startup.ts';

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

// Archivo completo en el dispositivo, en segundo plano cuando la app ya está pintada.
setTimeout(startArchiveSync, 2000);
