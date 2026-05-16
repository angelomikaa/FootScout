import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useBeforeUnload, useNavigate } from "react-router";

interface NavigationGuardContextType {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  pendingNavigation: { target: string; action: () => void } | null;
  requestNavigation: (target: string, action: () => void) => void;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    target: string;
    action: () => void;
  } | null>(null);
  const navigate = useNavigate();

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const requestNavigation = useCallback((target: string, action: () => void) => {
    if (isDirty) {
      setPendingNavigation({ target, action });
    } else {
      action();
    }
  }, [isDirty]);

  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      setIsDirty(false);
      pendingNavigation.action();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (isDirty) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      [isDirty]
    )
  );

  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      setPendingNavigation({
        target: window.location.pathname,
        action: () => {},
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  return (
    <NavigationGuardContext.Provider
      value={{ isDirty, setDirty, pendingNavigation, requestNavigation, confirmNavigation, cancelNavigation }}
    >
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard(): NavigationGuardContextType {
  const ctx = useContext(NavigationGuardContext);
  if (!ctx) {
    throw new Error("useNavigationGuard must be used within NavigationGuardProvider");
  }
  return ctx;
}
