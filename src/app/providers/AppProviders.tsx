import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { queryClient } from '@/app/queryClient';
import { ThemeProvider } from '@/theme';
import { APP_BASE_PATH } from '@/utils/env';
import { UserProvider } from '@/features/auth/contexts/UserContext';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';

interface AppProvidersProps {
  children: ReactNode;
}

function AppProvidersContent({ children }: { children: ReactNode }) {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: role, isLoading: isLoadingRole } = useUserRoleSimple();

  const userWithRole = user ? { ...user, role } : null;

  return (
    <UserProvider user={userWithRole} isLoading={isLoadingUser || isLoadingRole}>
      {children}
    </UserProvider>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={APP_BASE_PATH}>
          <AppProvidersContent>{children}</AppProvidersContent>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
