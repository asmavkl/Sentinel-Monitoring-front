import { useUserContext } from '@/features/auth/contexts/UserContext';

export function useAuthContext() {
  return useUserContext();
}

export function useCurrentUserRole() {
  const { user } = useUserContext();
  return user?.role ?? null;
}
