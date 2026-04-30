import axios from 'axios';

import { API_BASE_URL } from '../../config/env';
import { toApiError } from './errors';
import { triggerUnauthorizedHandler } from './session';
import { clearAccessToken, getAccessToken } from '../storage/tokenStorage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl: string = error?.config?.url ?? '';
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);
    const status = error?.response?.status;
    const isAuthEntryRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register');

    console.log('[interceptor] url:', requestUrl);
    console.log('[interceptor] status:', status);
    console.log('[interceptor] hadAuthHeader:', hadAuthHeader);
    console.log('[interceptor] isAuthEntryRoute:', isAuthEntryRoute);

    const normalized = toApiError(error);
    console.log('[interceptor] normalized message:', normalized.message);

    if (status === 401 && hadAuthHeader && !isAuthEntryRoute) {
      console.log('[interceptor] triggering unauthorized handler');
      await clearAccessToken();
      triggerUnauthorizedHandler();
    }

    return Promise.reject(normalized);
  }
);
