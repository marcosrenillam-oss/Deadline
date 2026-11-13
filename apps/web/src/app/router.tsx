import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router';
import { DeskScene } from '../scenes/desk/DeskRoot.tsx';
import { BackToDesk } from '../ui/BackToDesk.tsx';
import surface from '../ui/Surface.module.css';
import styles from './router.module.css';

function MissingFile() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (!notFound) console.error(error);
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${styles.center}`}>
        <div className={`${surface.paper} ${surface.scene} ${styles.sheet}`}>
          <p className={styles.kicker}>{notFound ? 'Referencia 404' : 'Incidencia'}</p>
          <h1 className={styles.title}>{notFound ? 'Este expediente no figura en el archivo' : 'Algo se ha traspapelado'}</h1>
          <p className={styles.body}>
            {notFound
              ? 'La signatura que buscas no corresponde a ningún cajón.'
              : 'Se ha producido un error inesperado. Tu progreso guardado no se ha perdido.'}
          </p>
          <BackToDesk />
        </div>
      </div>
    </main>
  );
}

/**
 * Carga diferida por pantallas: la mesa va en el paquete inicial; el resto se
 * descarga al abrirla (y el service worker lo precachea para usarlo offline).
 */
function page<T extends Record<string, ComponentType>>(load: () => Promise<T>, name: keyof T, inner = false): ReactNode {
  const C = lazy(async () => ({ default: (await load())[name] as ComponentType }));
  // Dentro del expediente el fragmento ya está cargado: sin telón para no parpadear.
  return (
    <Suspense fallback={inner ? null : <main className={surface.wood} aria-busy="true" />}>
      <C />
    </Suspense>
  );
}

const caseScreens = () => import('./caseScreens.ts');
const caseChildren = () => [
  { index: true, element: page(caseScreens, 'DossierTab', true) },
  { path: 'evidencias', element: page(caseScreens, 'EvidenceTab', true) },
  { path: 'evidencias/:evidenceId', element: page(caseScreens, 'EvidenceViewer', true) },
  { path: 'personas', element: page(caseScreens, 'PeopleTab', true) },
  { path: 'personas/:characterId', element: page(caseScreens, 'PeopleTab', true) },
  { path: 'interrogatorio/:characterId', element: page(caseScreens, 'InterrogationView', true) },
  { path: 'cronologia', element: page(caseScreens, 'TimelineTab', true) },
  { path: 'tablero', element: page(caseScreens, 'BoardTab', true) },
  { path: 'acusacion', element: page(caseScreens, 'AccusationView', true) },
  { path: 'informe', element: page(caseScreens, 'ReportView', true) },
];

/** Sin barra final: '/' → '', '/Deadline/' → '/Deadline'. */
export const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <MissingFile />,
    children: [
      { index: true, element: <DeskScene /> },
      { path: 'lampara', element: page(() => import('../scenes/settings/SettingsScene.tsx'), 'SettingsScene') },
      { path: 'archivo', element: page(() => import('../scenes/archive/ArchiveScene.tsx'), 'ArchiveScene') },
      { path: 'libreta', element: page(() => import('../scenes/notebook/NotebookScene.tsx'), 'NotebookScene') },
      { path: 'calendario', element: page(() => import('../scenes/calendar/CalendarScene.tsx'), 'CalendarScene') },
      { path: 'telefono', element: page(() => import('../scenes/coop/CoopScene.tsx'), 'CoopScene') },
      { path: 'archivo-personal', element: page(() => import('../scenes/personal/PersonalArchiveScene.tsx'), 'PersonalArchiveScene') },
      { path: 'maquina', element: page(() => import('../scenes/history/HistoryScene.tsx'), 'HistoryScene') },
      { path: 'perfil', element: page(() => import('../scenes/profile/ProfileScene.tsx'), 'ProfileScene') },
      { path: 'pareja/:sessionId', element: page(caseScreens, 'CoopCaseScene'), children: caseChildren() },
      { path: 'expediente/:caseId', element: page(caseScreens, 'CaseScene'), children: caseChildren() },
      { path: 'diagnostico', element: page(() => import('../scenes/diagnostics/DiagnosticsScene.tsx'), 'DiagnosticsScene') },
    ],
  },
], { basename: BASENAME });
