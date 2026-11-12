import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router';
import { DeskScene } from '../scenes/desk/DeskScene.tsx';
import { SectionScene } from '../scenes/section/SectionScene.tsx';
import { DiagnosticsScene } from '../scenes/diagnostics/DiagnosticsScene.tsx';
import { BackToDesk } from '../ui/BackToDesk.tsx';
import surface from '../ui/Surface.module.css';
import { SECTIONS } from './sections.ts';
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

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <MissingFile />,
    children: [
      { index: true, element: <DeskScene /> },
      ...SECTIONS.map((s) => ({ path: s.path.slice(1), element: <SectionScene id={s.id} /> })),
      { path: 'diagnostico', element: <DiagnosticsScene /> },
    ],
  },
]);
