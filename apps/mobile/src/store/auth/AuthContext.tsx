import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ApiError } from '../../services/api/errors';
import { setUnauthorizedHandler } from '../../services/api/session';
import {
  getCurrentUser,
  getStoredAccessToken,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../../services/auth/authService';
import type { AuthUser, LoginPayload, RegisterPayload } from '../../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAuth = async (): Promise<void> => {
      console.log('[bootstrap] start');
      try {
        const token = await getStoredAccessToken();
        console.log('[bootstrap] stored token:', token ? 'found' : 'none');
        if (!token) {
          setUser(null);
          return;
        }
        const me = await getCurrentUser();
        console.log('[bootstrap] user loaded:', me?.email);
        setUser(me);
      } catch (error) {
        console.log('[bootstrap] error caught, clearing session:', error);
        await logoutRequest();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
        console.log('[bootstrap] done, registering unauthorized handler');
        setUnauthorizedHandler(() => {
          console.log('[unauthorized handler] fired, setting session expired');
          setUser(null);
          setAuthError('Session expired. Please log in again.');
        });
      }
    };

    void bootstrapAuth();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = async (payload: LoginPayload): Promise<void> => {
    setAuthError(null);
    try {
      await loginRequest(payload);
      const me = await getCurrentUser();
      setUser(me);
    } catch (error) {
      const apiError = error as ApiError;
      setAuthError(apiError.message || 'Login failed');
      throw error;
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setAuthError(null);
    try {
      await registerRequest(payload);
      const me = await getCurrentUser();
      setUser(me);
    } catch (error) {
      const apiError = error as ApiError;
      setAuthError(apiError.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
    setAuthError(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      authError,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
