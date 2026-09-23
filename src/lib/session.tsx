import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type SessionState = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  roleLoading: boolean;
};

const SessionContext = createContext<SessionState>({
  session: null,
  loading: true,
  isAdmin: false,
  roleLoading: true,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resolvedFor, setResolvedFor] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsAdmin(false);
      setResolvedFor(null);
      return;
    }
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setIsAdmin(Boolean(data));
        setResolvedFor(userId);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const roleLoading = Boolean(session?.user?.id) && resolvedFor !== session?.user?.id;

  const value = useMemo(
    () => ({ session, loading, isAdmin, roleLoading }),
    [session, loading, isAdmin, roleLoading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
