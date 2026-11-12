import type { NotebookMaterial } from '../palettes.ts';
import s from './paperObjects.module.css';

/**
 * Objetos de papel y cuero construidos con HTML/CSS: permiten animaciones 3D
 * (abrir una carpeta, arrancar la hoja del calendario, abrir la libreta) más
 * fiables en Safari que las transformaciones 3D dentro de SVG.
 */

export function FolderVisual({ investigator }: { investigator: string }) {
  return (
    <div className={s.folder}>
      <div className={s.folderBack} />
      <div className={`${s.sheet} ${s.sheetA}`}>
        <span className={s.typedLine} />
        <span className={s.typedLine} />
        <span className={`${s.typedLine} ${s.short}`} />
      </div>
      <div className={`${s.sheet} ${s.sheetB}`}>
        <span className={s.photo} />
      </div>
      <div className={s.folderCover}>
        <div className={s.folderTab}>EXPEDIENTES</div>
        <div className={s.folderLabel}>
          <span className={s.labelKicker}>Archivo DEADLINE</span>
          <span className={s.labelTitle}>Biblioteca de casos</span>
          <span className={s.labelRule} />
          <span className={s.labelMeta}>Asignado a {investigator}</span>
        </div>
        <div className={s.folderStamp}>Confidencial</div>
        <svg className={s.clip} viewBox="0 0 24 70" aria-hidden="true">
          <path d="M8 66 V12 a6 6 0 0 1 12 0 V58 a4 4 0 0 1 -8 0 V18" fill="none" stroke="#b9b6ad" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function CalendarVisual({ day, month, weekday, dailyLabel, fresh }: { day: string; month: string; weekday: string; dailyLabel: string; fresh?: boolean }) {
  return (
    <div className={s.calendar}>
      <div className={s.calStack} />
      <div className={s.calPageUnder}>
        <span className={s.calDay}>{day}</span>
      </div>
      <div className={s.calPage}>
        <div className={s.calHeader}>{month}</div>
        <span className={s.calDay}>{day}</span>
        <span className={s.calWeekday}>{weekday}</span>
        <span className={s.calDaily}>{dailyLabel}</span>
      </div>
      {fresh && <span className={s.calFresh}>Caso nuevo</span>}
      <div className={s.calRings} aria-hidden="true">
        <i />
        <i />
      </div>
    </div>
  );
}

export function NotebookVisual({ m, count }: { m: NotebookMaterial; count: number }) {
  return (
    <div className={s.notebook} style={{ ['--nb-cover' as string]: m.cover, ['--nb-light' as string]: m.light, ['--nb-dark' as string]: m.dark, ['--nb-band' as string]: m.band }}>
      <div className={s.nbPages}>
        <span className={s.nbHand}>Sospechas…</span>
      </div>
      <div className={s.nbCover}>
        <div className={s.nbLabel}>
          <span>Notas</span>
          <small>{count === 0 ? 'en blanco' : `${count} ${count === 1 ? 'anotación' : 'anotaciones'}`}</small>
        </div>
        <div className={s.nbBand} />
      </div>
      <svg className={s.pencil} viewBox="0 0 12 150" aria-hidden="true">
        <rect x="2" y="12" width="8" height="118" fill="#c8963a" />
        <rect x="2" y="12" width="3" height="118" fill="#e0b25a" />
        <path d="M2 12 L6 0 L10 12 Z" fill="#e9cfa3" />
        <path d="M5 3 L6 0 L7 3 Z" fill="#333" />
        <rect x="2" y="130" width="8" height="8" fill="#a8a8a8" />
        <rect x="2" y="138" width="8" height="10" rx="2" fill="#b0605a" />
      </svg>
    </div>
  );
}

export function Nameplate({ investigator, rank }: { investigator: string; rank: string }) {
  return (
    <div className={s.nameplate}>
      <span className={s.npRank}>{rank}</span>
      <span className={s.npNumber}>{investigator}</span>
    </div>
  );
}

export function GuideNoteVisual() {
  return (
    <div className={s.note}>
      <span className={s.tape} />
      <span className={s.noteText}>Primer día:</span>
      <span className={s.noteText}>léeme antes</span>
    </div>
  );
}
