import { useQuery } from '@tanstack/react-query';
import { portalApi } from '@/api/portalApi';

export const currentUserQueryKey = ['portal-current-user'] as const;
export const userRoleQueryKey = ['user-role'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => portalApi.getCurrentUser(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useUserRole() {
  return useQuery({
    queryKey: userRoleQueryKey,
    queryFn: () => portalApi.getUserRole(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
