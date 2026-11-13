import { useState } from 'react';
import {
  COSMETIC_SLOTS,
  COSMETIC_SLOT_LABELS,
  RANK_DEFINITIONS,
  achievementById,
  cosmeticsForSlot,
  isCosmeticAvailable,
  unlockLabel,
  type CosmeticItem,
  type CosmeticSlot,
} from '@deadline/core';
import { useProfile } from '../../profile/ProfileProvider.tsx';
import { CannotPurchase, purchaseCosmetic } from '../../progression/progressionRepo.ts';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
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

const condition = (item: CosmeticItem) =>
  unlockLabel(
    item,
    (id) => achievementById(id)?.label,
    (id) => RANK_DEFINITIONS.find((r) => r.id === id)?.label,
  );

/** Personalización de la oficina: materiales y acabados, nunca la composición. */
export function OfficePanel() {
  const { profile, equip, reload } = useProfile();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  if (!profile) return <p className={styles.note}>Abriendo el inventario…</p>;

  const buy = async (item: CosmeticItem) => {
    setBusy(item.id);
    setMsg(null);
    try {
      await purchaseCosmetic(item.id);
      await reload();
      sound.play('stamp');
      haptic('confirm');
      setMsg(`«${item.label}» ya es tuya. Puedes equiparla arriba.`);
    } catch (e) {
      setMsg(e instanceof CannotPurchase ? e.message : 'No se pudo completar la compra.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <p className={styles.note}>Saldo: {profile.points} puntos. Las piezas de logros y rangos se conceden solas; las de puntos se compran aquí.</p>
      {COSMETIC_SLOTS.map((slot) => {
        const all = cosmeticsForSlot(slot);
        const items = all.filter((c) => isCosmeticAvailable(c, profile.unlockedCosmetics));
        const locked = all.filter((c) => !isCosmeticAvailable(c, profile.unlockedCosmetics));
        const current = items.find((c) => c.id === profile.equipped[slot]);
        return (
          <div key={slot}>
            <Choice
              label={COSMETIC_SLOT_LABELS[slot]}
              hint={current?.description}
              value={profile.equipped[slot]}
              onChange={(id) => void equip(slot, id)}
              options={items.map((c) => {
                const sw = swatch(slot, c.id);
                return { value: c.id, label: c.label, detail: c.description, ...(sw ? { swatch: sw } : {}) };
              })}
            />
            {locked.length > 0 && (
              <ul className={styles.locked} aria-label={`${COSMETIC_SLOT_LABELS[slot]}: piezas por conseguir`}>
                {locked.map((c) => {
                  const sw = swatch(slot, c.id);
                  const price = c.unlock.kind === 'points' ? c.unlock.cost : null;
                  return (
                    <li key={c.id} className={styles.lockedItem}>
                      {sw && <span className={styles.swatch} style={{ background: sw }} aria-hidden="true" />}
                      <span className={styles.lockedText}>
                        <strong>{c.label}</strong> — {c.description}
                        <em> {condition(c)}</em>
                      </span>
                      {price !== null && (
                        <button type="button" className={styles.buy} disabled={profile.points < price || busy !== null} onClick={() => void buy(c)}>
                          Comprar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
      {msg && (
        <p className={styles.note} role="status">
          {msg}
        </p>
      )}
    </>
  );
}
