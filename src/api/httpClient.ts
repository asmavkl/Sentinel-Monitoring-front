import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { authorizationHeaderHandler } from '@/auth/authorizationHeaderHandler';
import { browserStorageTokenProvider } from '@/auth/browserStorageTokenProvider';
import { capturePortalToken } from '@/auth/capturePortalToken';
import { redirectToLogin } from '@/auth/loginRedirect';
import { env } from '@/utils/env';

export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.withCredentials = true;
    capturePortalToken();
    const authHeaders = authorizationHeaderHandler.getAuthorizationHeader();

    Object.entries(authHeaders).forEach(([key, value]) => {
      config.headers.set(key, value);
    });

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        browserStorageTokenProvider.clearToken();
        redirectToLogin();
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const httpClient = createHttpClient();
