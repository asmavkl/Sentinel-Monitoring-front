import { httpClient } from '@/api/httpClient';

export const authApi = {
  async getUserRole() {
    console.log('authApi.getUserRole called');
    const { data } = await httpClient.get('/api/auth/roles');
    console.log('authApi.getUserRole success:', data);
    return data;
  },
};
