import { RouterProvider } from 'react-router';
import { SettingsProvider } from '../settings/SettingsProvider.tsx';
import { OrientationGate } from './OrientationGate.tsx';
import { UpdateNotice } from './UpdateNotice.tsx';
import { router } from './router.tsx';

export function App() {
  return (
    <SettingsProvider>
      <OrientationGate>
        <RouterProvider router={router} />
      </OrientationGate>
      <UpdateNotice />
    </SettingsProvider>
  );
}
