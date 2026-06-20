import { createContext, useContext, useMemo, useState } from 'react';
import { clearAuth, getStoredAuth, hasAnyRole, storeAuth } from './authStorage';
import { login as apiLogin } from '../api/catalogApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.authHeader),
      roles: auth?.roles || [],
      login: async (username, password) => {
        const response = await apiLogin(username, password);
        const session = {
          username: response.username,
          roles: response.roles,
          authHeader: response.authHeader,
        };
        storeAuth(session);
        setAuth(session);
        return session;
      },
      logout: () => {
        clearAuth();
        setAuth(null);
      },
      canAccess: (allowedRoles) => hasAnyRole(auth?.roles || [], allowedRoles),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
