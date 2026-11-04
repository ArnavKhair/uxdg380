import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/*
 * Whether someone is signed in. Discover in Figma shows the signed-out header
 * ("Sign Up | Sign In"); Feed shows the signed-in one. Toggle it from the
 * State Switcher's "Everywhere" section, or start signed out with `?guest`.
 */
interface SessionState {
  signedIn: boolean;
  setSignedIn: (value: boolean) => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(() => !new URLSearchParams(window.location.search).has('guest'));
  const value = useMemo(() => ({ signedIn, setSignedIn }), [signedIn]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
