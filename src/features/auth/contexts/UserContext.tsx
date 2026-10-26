import { createContext, useContext, type ReactNode } from 'react';
import type { CurrentUser } from '@/types/portal';

interface UserContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  user: CurrentUser | null;
  isLoading: boolean;
}

export function UserProvider({ children, user, isLoading }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
