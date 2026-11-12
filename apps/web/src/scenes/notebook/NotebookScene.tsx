import { useEffect, useState } from 'react';
import { fetchCatalog } from '../../cases/contentRepo.ts';
import { BackToDesk } from '../../ui/BackToDesk.tsx';
import surface from '../../ui/Surface.module.css';
import { NotebookEditor } from './NotebookEditor.tsx';
import s from './NotebookScene.module.css';

/** LA LIBRETA del escritorio: todas las notas, generales y de cada expediente. */
export function NotebookScene() {
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchCatalog().then((cat) => setTitles(Object.fromEntries(cat.map((e) => [e.id, e.title]))), () => undefined);
  }, []);
  return (
    <main className={surface.wood}>
      <div className={`${surface.safe} ${s.layout}`}>
        <div>
          <BackToDesk label="Escritorio" />
        </div>
        <section className={`${s.book} ${surface.scroll}`} aria-labelledby="nb-title">
          <h1 id="nb-title" className={s.title}>
            Libreta del investigador
          </h1>
          <NotebookEditor caseId={null} all caseTitles={titles} />
        </section>
      </div>
    </main>
  );
}
