import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { redirectToLogin } from '@/auth/loginRedirect';

export function createPortalHttpClient(): AxiosInstance {
  const client = axios.create({
    withCredentials: true,
  });

  client.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    request.withCredentials = true;
    request.headers.delete('Authorization');
    return request;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        redirectToLogin();
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const portalHttpClient = createPortalHttpClient();
