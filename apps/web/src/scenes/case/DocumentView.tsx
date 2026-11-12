import { useRef, useState, type MouseEvent } from 'react';
import { evaluateCondition, parseInline, type CaseFile, type DocBlock, type Evidence, type Knowledge } from '@deadline/core';
import { assetUrl } from '../../cases/contentRepo.ts';
import styles from './DocumentView.module.css';

interface Props {
  c: CaseFile;
  evidence: Evidence;
  k: Knowledge;
  lupa: boolean;
  /** Modo archivo (caso cerrado): se muestran todos los detalles, encontrados u omitidos. */
  archive?: boolean;
  onDetail: (detailId: string) => void;
  onMiss: () => void;
  onImagePoint?: (x: number, y: number) => void;
}

/**
 * Documento de una evidencia. Con la lupa activa, cualquier frase se puede
 * examinar; solo algunas esconden un detalle. Nada distingue a simple vista
 * un fragmento con detalle de uno sin él.
 */
export function DocumentView({ c, evidence, k, lupa, archive, onDetail, onMiss, onImagePoint }: Props) {
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = evidence.asset ? assetUrl(c.id, c, evidence.asset) : undefined;
  const asset = c.assets.find((a) => a.id === evidence.asset);

  const inline = (text: string, key: string) =>
    parseInline(text).map((seg, i) => {
      const id = `${key}-${i}`;
      if (seg.detail) {
        const found = k.details.has(seg.detail);
        const cls = found ? styles.found : archive ? styles.missed : lupa ? styles.probe : undefined;
        return (
          <span
            key={id}
            className={cls}
            data-detail={lupa && !found ? 'probe' : undefined}
            onClick={lupa && !found && !archive ? () => onDetail(seg.detail!) : undefined}
          >
            {seg.text}
          </span>
        );
      }
      if (!lupa || archive) return <span key={id}>{seg.text}</span>;
      // Sin detalle: con la lupa también se puede tocar, pero no revela nada.
      return seg.text.split(/(?<=[.;:!?])\s+/).map((sentence, j) => (
        <span key={`${id}-${j}`} className={styles.probe} onClick={onMiss}>
          {sentence}{' '}
        </span>
      ));
    });

  const block = (b: DocBlock, i: number) => {
    const key = `b${i}`;
    switch (b.type) {
      case 'heading':
        return <h3 key={key} className={styles.heading}>{inline(b.text, key)}</h3>;
      case 'paragraph':
        return <p key={key} className={styles.paragraph}>{inline(b.text, key)}</p>;
      case 'typed':
        return <p key={key} className={styles.typed}>{inline(b.text, key)}</p>;
      case 'handwritten':
        return (
          <p key={key} className={styles.hand}>
            {b.author && <span className={styles.handAuthor}>{b.author}: </span>}
            {inline(b.text, key)}
          </p>
        );
      case 'quote':
        return (
          <blockquote key={key} className={styles.quote}>
            {inline(b.text, key)}
            {b.speaker && <footer>— {b.speaker}</footer>}
          </blockquote>
        );
      case 'field':
        return (
          <div key={key} className={styles.field}>
            <span className={styles.fieldLabel}>{b.label}</span>
            <span className={styles.fieldValue}>{inline(b.value, key)}</span>
          </div>
        );
      case 'table':
        return (
          <table key={key} className={styles.table}>
            {b.header && (
              <thead>
                <tr>{b.header.map((h, j) => <th key={j}>{h}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j}>{r.map((cell, m) => <td key={m}>{inline(cell, `${key}-${j}-${m}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        );
      case 'image': {
        const u = assetUrl(c.id, c, b.asset);
        return u ? (
          <figure key={key} className={styles.figure}>
            <img src={u} alt={c.assets.find((a) => a.id === b.asset)?.alt ?? ''} />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        ) : null;
      }
      case 'redacted':
        return evaluateCondition(b.revealedWhen, k) || archive ? (
          <p key={key} className={styles.typed}>{inline(b.text, key)}</p>
        ) : (
          <p key={key} className={styles.redacted} aria-label="Pasaje tachado">
            {'█'.repeat(Math.min(60, b.text.length))}
          </p>
        );
      case 'stamp':
        return <span key={key} className={styles.stamp}>{b.text}</span>;
      case 'signature':
        return <p key={key} className={styles.signature}>{b.name}</p>;
    }
  };

  const onImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!lupa || archive || !imgRef.current || !onImagePoint) return;
    const r = imgRef.current.getBoundingClientRect();
    onImagePoint((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  const regions = evidence.details.filter((d) => d.region && (k.details.has(d.id) || archive));

  return (
    <div className={styles.doc} data-lupa={lupa || undefined}>
      {src && (
        <div className={styles.imageBox}>
          <div className={styles.zoomBar}>
            <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} disabled={zoom <= 1} aria-label="Alejar">
              −
            </button>
            <span>{Math.round(zoom * 100)} %</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} disabled={zoom >= 4} aria-label="Acercar">
              +
            </button>
          </div>
          <div className={styles.imageScroll}>
            <div className={styles.imageInner} style={{ width: `${zoom * 100}%` }} onClick={onImageClick}>
              <img ref={imgRef} src={src} alt={asset?.alt ?? evidence.title} draggable={false} />
              {regions.map((d) => (
                <span
                  key={d.id}
                  className={k.details.has(d.id) ? styles.ring : styles.ringMissed}
                  style={{ left: `${d.region!.x * 100}%`, top: `${d.region!.y * 100}%`, width: `${d.region!.w * 100}%`, height: `${d.region!.h * 100}%` }}
                  title={d.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className={styles.body}>{evidence.body.map(block)}</div>
    </div>
  );
}
