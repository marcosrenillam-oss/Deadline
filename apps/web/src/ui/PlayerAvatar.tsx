import type { LocalProfile } from '@deadline/core';
import { Portrait } from './Portrait.tsx';

/** Retrato del jugador: su foto (si la eligió) o una silueta de ficha. */
export function PlayerAvatar({ profile, size = 96 }: { profile: Pick<LocalProfile, 'avatar' | 'investigatorNumber' | 'alias'>; size?: number }) {
  const name = profile.alias ?? profile.investigatorNumber;
  if (profile.avatar?.startsWith('data:image/')) {
    return <img src={profile.avatar} alt={`Retrato de ${name}`} width={size} height={size * 1.2} style={{ objectFit: 'cover', filter: 'grayscale(0.85) contrast(1.1) sepia(0.15)' }} />;
  }
  const seed = profile.avatar?.startsWith('preset:') ? profile.avatar : profile.investigatorNumber;
  return <Portrait character={{ id: seed, name }} size={size} />;
}
