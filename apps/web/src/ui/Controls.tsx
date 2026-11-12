import { useId, type ReactNode } from 'react';
import { sound } from '../audio/sound.ts';
import { haptic } from '../audio/haptics.ts';
import styles from './Controls.module.css';

/**
 * Controles de ajustes con la estética del archivo. Son controles nativos
 * (checkbox, range, radio) estilizados: accesibles con VoiceOver y teclado.
 */

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      <div className={styles.control}>{children}</div>
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.toggle}
        checked={checked}
        onChange={(e) => {
          sound.play('switch');
          haptic('light');
          onChange(e.target.checked);
        }}
      />
    </Field>
  );
}

export function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className={styles.sliderRow}>
        <input
          id={id}
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ ['--pct' as string]: `${pct}%` }}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <output htmlFor={id} className={styles.value}>
          {format(value)}
        </output>
      </div>
    </Field>
  );
}

export function Choice<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; swatch?: string; detail?: string }>;
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>{label}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.chips}>
        {options.map((o) => (
          <label key={o.value} className={styles.chip} data-checked={o.value === value || undefined} title={o.detail}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => {
                sound.play('tap');
                haptic('light');
                onChange(o.value);
              }}
            />
            {o.swatch && <span className={styles.swatch} style={{ background: o.swatch }} aria-hidden="true" />}
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ActionButton({ children, onClick, tone = 'plain', disabled }: { children: ReactNode; onClick: () => void; tone?: 'plain' | 'seal'; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={tone === 'seal' ? `${styles.button} ${styles.seal}` : styles.button}
      disabled={disabled}
      onClick={() => {
        sound.play('tap');
        haptic('light');
        onClick();
      }}
    >
      {children}
    </button>
  );
}
