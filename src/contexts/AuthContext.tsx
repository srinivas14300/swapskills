import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useFirebaseAuth } from '../hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useFirebaseAuth> | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}