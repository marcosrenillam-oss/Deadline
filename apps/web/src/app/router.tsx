import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router';
import { DeskScene } from '../scenes/desk/DeskScene.tsx';
import { SectionScene } from '../scenes/section/SectionScene.tsx';
import { DiagnosticsScene } from '../scenes/diagnostics/DiagnosticsScene.tsx';
import { SettingsScene } from '../scenes/settings/SettingsScene.tsx';
import { ArchiveScene } from '../scenes/archive/ArchiveScene.tsx';
import { NotebookScene } from '../scenes/notebook/NotebookScene.tsx';
import { CalendarScene } from '../scenes/calendar/CalendarScene.tsx';
import { CoopScene } from '../scenes/coop/CoopScene.tsx';
import { ProfileScene } from '../scenes/profile/ProfileScene.tsx';
import { CoopCaseScene } from '../scenes/coop/CoopCaseScene.tsx';
import { CaseScene } from '../scenes/case/CaseScene.tsx';
import { DossierTab } from '../scenes/case/DossierTab.tsx';
import { EvidenceTab } from '../scenes/case/EvidenceTab.tsx';
import { EvidenceViewer } from '../scenes/case/EvidenceViewer.tsx';
import { PeopleTab } from '../scenes/case/PeopleTab.tsx';
import { InterrogationView } from '../scenes/case/InterrogationView.tsx';
import { TimelineTab } from '../scenes/case/TimelineTab.tsx';
import { BoardTab } from '../scenes/case/BoardTab.tsx';
import { AccusationView } from '../scenes/case/AccusationView.tsx';
import { ReportView } from '../scenes/case/ReportView.tsx';
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

/** Sin barra final: '/' → '', '/Deadline/' → '/Deadline'. */
export const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <MissingFile />,
    children: [
      { index: true, element: <DeskScene /> },
      { path: 'lampara', element: <SettingsScene /> },
      { path: 'archivo', element: <ArchiveScene /> },
      { path: 'libreta', element: <NotebookScene /> },
      { path: 'calendario', element: <CalendarScene /> },
      { path: 'telefono', element: <CoopScene /> },
      { path: 'perfil', element: <ProfileScene /> },
      {
        path: 'pareja/:sessionId',
        element: <CoopCaseScene />,
        children: [
          { index: true, element: <DossierTab /> },
          { path: 'evidencias', element: <EvidenceTab /> },
          { path: 'evidencias/:evidenceId', element: <EvidenceViewer /> },
          { path: 'personas', element: <PeopleTab /> },
          { path: 'personas/:characterId', element: <PeopleTab /> },
          { path: 'interrogatorio/:characterId', element: <InterrogationView /> },
          { path: 'cronologia', element: <TimelineTab /> },
          { path: 'tablero', element: <BoardTab /> },
          { path: 'acusacion', element: <AccusationView /> },
          { path: 'informe', element: <ReportView /> },
        ],
      },
      {
        path: 'expediente/:caseId',
        element: <CaseScene />,
        children: [
          { index: true, element: <DossierTab /> },
          { path: 'evidencias', element: <EvidenceTab /> },
          { path: 'evidencias/:evidenceId', element: <EvidenceViewer /> },
          { path: 'personas', element: <PeopleTab /> },
          { path: 'personas/:characterId', element: <PeopleTab /> },
          { path: 'interrogatorio/:characterId', element: <InterrogationView /> },
          { path: 'cronologia', element: <TimelineTab /> },
          { path: 'tablero', element: <BoardTab /> },
          { path: 'acusacion', element: <AccusationView /> },
          { path: 'informe', element: <ReportView /> },
        ],
      },
      ...SECTIONS.filter((s) => !s.ready).map((s) => ({ path: s.path.slice(1), element: <SectionScene id={s.id} /> })),
      { path: 'diagnostico', element: <DiagnosticsScene /> },
    ],
  },
], { basename: BASENAME });
