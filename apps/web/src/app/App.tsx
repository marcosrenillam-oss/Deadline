import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { SettingsProvider } from '../settings/SettingsProvider.tsx';
import { ProfileProvider } from '../profile/ProfileProvider.tsx';
import { sound } from '../audio/sound.ts';
import { OrientationGate } from './OrientationGate.tsx';
import { UpdateNotice } from './UpdateNotice.tsx';
import { router } from './router.tsx';
import { AnnouncementLayer } from '../progression/AnnouncementLayer.tsx';
import { ProgressionReconciler } from '../progression/ProgressionReconciler.tsx';
import { AccountGate, AccountSync } from '../account/AccountGate.tsx';

/** iOS solo permite iniciar el audio dentro de un gesto: el primer toque lo desbloquea. */
function useAudioUnlock(): void {
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);
}

export function App() {
  useAudioUnlock();
  return (
    <SettingsProvider>
      <ProfileProvider>
        <OrientationGate>
          <RouterProvider router={router} />
        </OrientationGate>
        <UpdateNotice />
        <AnnouncementLayer />
        <ProgressionReconciler />
        <AccountSync />
        <AccountGate />
      </ProfileProvider>
    </SettingsProvider>
  );
}
