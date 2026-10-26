import { toApiError } from '@/api/apiUtils';
import { portalHttpClient } from '@/api/portalClient';
import { httpClient } from '@/api/httpClient';
import { extractPortalUserPayload, mapPortalCurrentUser } from '@/auth/portalUser';
import type { CurrentUser } from '@/types/portal';
import { env } from '@/utils/env';

export const portalApi = {
  async getCurrentUser(): Promise<CurrentUser> {
    try {
      console.log('portalApi.getCurrentUser called');
      const { data } = await portalHttpClient.get(env.portalCurrentUserUrl);
      console.log('portalApi.getCurrentUser success');
      return mapPortalCurrentUser(extractPortalUserPayload(data));
    } catch (error) {
      console.error('portalApi.getCurrentUser error:', error);
      throw toApiError(error);
    }
  },

  async getUserRole(): Promise<{ role: string }> {
    try {
      console.log('portalApi.getUserRole called');
      const { data } = await httpClient.get('/api/auth/roles');
      console.log('portalApi.getUserRole success:', data);
      return data;
    } catch (error) {
      console.error('portalApi.getUserRole error:', error);
      throw toApiError(error);
    }
  },
};
