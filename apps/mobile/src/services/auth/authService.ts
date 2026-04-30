import { apiClient } from '../api/client';
import { toApiError, type ApiError } from '../api/errors';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../storage/tokenStorage';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../../types/auth';

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/register',
      payload
    );
    await setAccessToken(data.access_token);
    return data;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw toApiError(error);
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    await setAccessToken(data.access_token);
    return data;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw toApiError(error);
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    return data;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw toApiError(error);
  }
}

export async function getStoredAccessToken(): Promise<string | null> {
  return getAccessToken();
}

export async function logout(): Promise<void> {
  await clearAccessToken();
}

function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  return 'message' in error;
}
