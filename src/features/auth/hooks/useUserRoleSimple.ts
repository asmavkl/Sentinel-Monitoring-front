import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';

export function useUserRoleSimple() {
  const result = useQuery({
    queryKey: ['user-role-simple'],
    queryFn: () => authApi.getUserRole(),
    staleTime: 5 * 60_000,
    retry: false,
  });
  return {
    ...result,
    data: result.data?.data?.role ?? null,
  };
}
