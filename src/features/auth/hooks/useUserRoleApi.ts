import { useState, useEffect } from 'react';
import { portalHttpClient } from '@/api/portalClient';
import { env } from '@/utils/env';

export function useUserRoleApi() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useUserRoleApi - fetching role');
    setIsLoading(true);
    portalHttpClient
      .get(`${env.apiBaseUrl}/api/auth/roles`)
      .then((response) => {
        console.log('useUserRoleApi - success:', response.data);
        setRole(response.data.role);
        setError(null);
      })
      .catch((err) => {
        console.error('useUserRoleApi - error:', err);
        setError(err as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { role, isLoading, error };
}
