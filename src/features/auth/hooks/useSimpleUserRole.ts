import { useState, useEffect } from 'react';
import { portalHttpClient } from '@/api/portalClient';
import { env } from '@/utils/env';

export function useSimpleUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== useSimpleUserRole - calling API ===');
    portalHttpClient
      .get(`${env.apiBaseUrl}/api/auth/roles`)
      .then((response) => {
        console.log('=== useSimpleUserRole - success ===', response.data);
        setRole(response.data.role);
      })
      .catch((error) => {
        console.error('=== useSimpleUserRole - error ===', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { role, isLoading };
}
