import { capturePortalToken } from '@/auth/capturePortalToken';
import { useCurrentUser } from './useCurrentUser';

export type PortalSessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function usePortalSession(): PortalSessionStatus {
  capturePortalToken();

  const { isPending, isSuccess, data } = useCurrentUser();

  if (isPending) {
    return 'loading';
  }

  if (isSuccess && data) {
    return 'authenticated';
  }

  return 'unauthenticated';
}
