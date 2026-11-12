import styles from './Stamp.module.css';

/** Sello de archivo en tinta roja, ligeramente girado. */
export function Stamp({ children, tilt = -4, tone = 'seal' }: { children: string; tilt?: number; tone?: 'seal' | 'ink' }) {
  return (
    <span className={`${styles.stamp} ${tone === 'ink' ? styles.ink : ''}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {children}
    </span>
  );
}
