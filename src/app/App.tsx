import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
