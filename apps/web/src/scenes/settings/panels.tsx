import { useState } from 'react';
import { useSettings } from '../../settings/SettingsProvider.tsx';
import { sound } from '../../audio/sound.ts';
import { haptic, hapticsSupport } from '../../audio/haptics.ts';
import { ActionButton, Choice, Field, Slider, Toggle } from '../../ui/Controls.tsx';
import styles from './panels.module.css';

const pct = (v: number) => `${Math.round(v * 100)} %`;

export function LightPanel() {
  const { settings, update } = useSettings();
  return (
    <>
      <Toggle label="Lámpara encendida" hint="También se apaga y enciende con la cadenita de la lámpara, sobre la mesa." checked={settings.lampOn} onChange={(v) => update({ lampOn: v })} />
      <Slider label="Intensidad" value={settings.lightIntensity} min={0.3} max={1} step={0.05} format={pct} onChange={(v) => update({ lightIntensity: v })} />
      <Choice
        label="Tonalidad"
        value={settings.lightTone}
        onChange={(v) => update({ lightTone: v })}
        options={[
          { value: 'warm', label: 'Tungsteno', swatch: 'rgb(255,196,128)' },
          { value: 'neutral', label: 'Neutra', swatch: 'rgb(246,226,196)' },
          { value: 'cold', label: 'Fluorescente', swatch: 'rgb(198,214,230)' },
        ]}
      />
    </>
  );
}

export function SoundPanel() {
  const { settings, update } = useSettings();
  return (
    <>
      <Slider label="Efectos" hint="Papel, máquina de escribir, teléfono, sellos." value={settings.sfxVolume} min={0} max={1} step={0.05} format={pct} onChange={(v) => update({ sfxVolume: v })} />
      <Field label="Probar efectos">
        <ActionButton
          onClick={() => {
            sound.unlock();
            sound.play('key');
            setTimeout(() => sound.play('ding'), 240);
          }}
        >
          Teclear
        </ActionButton>
      </Field>
      <Choice
        label="Ambiente de la oficina"
        value={settings.officeAmbience}
        onChange={(v) => {
          sound.unlock();
          update({ officeAmbience: v });
        }}
        options={[
          { value: 'rain', label: 'Lluvia en la ventana' },
          { value: 'night-city', label: 'Ciudad de noche' },
          { value: 'quiet', label: 'Silencio' },
        ]}
      />
      <Slider label="Volumen del ambiente" value={settings.ambienceVolume} min={0} max={1} step={0.05} format={pct} onChange={(v) => update({ ambienceVolume: v })} />
      <p className={styles.note}>
        Todo el sonido se sintetiza en el propio dispositivo. La música por época y tipo de caso llegará con los primeros expedientes; hasta entonces no
        hay control de música porque no hay nada que controlar.
      </p>
    </>
  );
}

export function TouchPanel() {
  const { settings, update } = useSettings();
  const support = hapticsSupport();
  const [tested, setTested] = useState(false);
  return (
    <>
      <Toggle label="Vibración" checked={settings.haptics} onChange={(v) => update({ haptics: v })} />
      <Field label="Probar">
        <ActionButton
          disabled={!settings.haptics}
          onClick={() => {
            haptic('confirm');
            setTested(true);
          }}
        >
          Notar un toque
        </ActionButton>
      </Field>
      <p className={styles.note}>
        {support === 'vibration' && 'Este dispositivo admite vibración.'}
        {support === 'ios-switch' &&
          'iOS no permite a las aplicaciones web controlar el motor de vibración. DEADLINE usa el «tic» que iOS 18 produce al accionar un interruptor del sistema; en versiones anteriores no se notará nada.'}
        {support === 'none' && 'Este dispositivo no ofrece respuesta háptica a las aplicaciones web.'}
        {tested && support !== 'vibration' && ' Si no has notado nada, tu dispositivo no lo admite.'}
      </p>
    </>
  );
}

export function ReadingPanel() {
  const { settings, update } = useSettings();
  return (
    <>
      <Slider label="Tamaño del texto" hint="Documentos, declaraciones e interrogatorios." value={settings.textScale} min={0.85} max={1.5} step={0.05} format={pct} onChange={(v) => update({ textScale: v })} />
      <p className={styles.sample}>«El testigo afirma que oyó el disparo a las once y diez, pero el reloj del vestíbulo llevaba parado desde el martes.»</p>
      <Choice
        label="Animaciones"
        value={settings.reducedMotion}
        onChange={(v) => update({ reducedMotion: v })}
        options={[
          { value: 'system', label: 'Como el sistema' },
          { value: 'on', label: 'Reducidas' },
          { value: 'off', label: 'Completas' },
        ]}
      />
      <Field label="Nota de bienvenida" hint={settings.deskGuideDismissed ? 'La retiraste de la mesa.' : 'Está sobre la mesa.'}>
        <ActionButton disabled={!settings.deskGuideDismissed} onClick={() => update({ deskGuideDismissed: false })}>
          Volver a ponerla
        </ActionButton>
      </Field>
    </>
  );
}
