import { Link } from 'react-router';
import styles from './BackToDesk.module.css';

export function BackToDesk({ label = 'Volver al escritorio' }: { label?: string }) {
  return (
    <Link to="/" className={styles.back}>
      <span aria-hidden="true" className={styles.arrow}>
        ←
      </span>
      {label}
    </Link>
  );
}
