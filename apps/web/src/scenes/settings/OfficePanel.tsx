import { COSMETIC_SLOTS, COSMETIC_SLOT_LABELS, cosmeticsForSlot, isCosmeticAvailable, type CosmeticSlot } from '@deadline/core';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { Choice } from '../../ui/Controls.tsx';
import { DESK_MATERIALS, LAMP_MATERIALS, NOTEBOOK_MATERIALS, PHONE_MATERIALS, TYPEWRITER_MATERIALS } from '../desk/palettes.ts';
import styles from './panels.module.css';

function swatch(slot: CosmeticSlot, id: string): string | undefined {
  switch (slot) {
    case 'desk': {
      const m = DESK_MATERIALS[id];
      return m && `linear-gradient(135deg, ${m.wood[0]} 0 50%, ${m.blotter} 50%)`;
    }
    case 'lamp':
      return LAMP_MATERIALS[id]?.shade;
    case 'phone':
      return PHONE_MATERIALS[id]?.body;
    case 'typewriter':
      return TYPEWRITER_MATERIALS[id]?.body;
    case 'notebook':
      return NOTEBOOK_MATERIALS[id]?.cover;
    default:
      return undefined;
  }
}

/** Personalización de la oficina: materiales y acabados, nunca la composición. */
export function OfficePanel() {
  const { profile, equip } = useProfile();
  if (!profile) return <p className={styles.note}>Abriendo el inventario…</p>;
  return (
    <>
      {COSMETIC_SLOTS.map((slot) => {
        const items = cosmeticsForSlot(slot).filter((c) => isCosmeticAvailable(c, profile.unlockedCosmetics));
        const current = items.find((c) => c.id === profile.equipped[slot]);
        return (
          <Choice
            key={slot}
            label={COSMETIC_SLOT_LABELS[slot]}
            hint={current?.description}
            value={profile.equipped[slot]}
            onChange={(id) => void equip(slot, id)}
            options={items.map((c) => {
              const sw = swatch(slot, c.id);
              return { value: c.id, label: c.label, detail: c.description, ...(sw ? { swatch: sw } : {}) };
            })}
          />
        );
      })}
      <p className={styles.note}>Más piezas se podrán desbloquear con puntos y logros cuando llegue la progresión (Etapa 7).</p>
    </>
  );
}
