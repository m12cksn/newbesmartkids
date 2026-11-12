"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SessionInfo } from "@/lib/access-rules";

type Access = { loading: boolean; enabled: boolean; session: SessionInfo | null; refresh: () => Promise<void> };
const Ctx = createContext<Access>({ loading: false, enabled: false, session: null, refresh: async () => {} });

export function AccessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Access, "refresh">>({ loading: true, enabled: false, session: null });
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/sesi", { cache: "no-store" });
      const j = (await r.json()) as { enabled: boolean; session: SessionInfo | null };
      setState({ loading: false, enabled: j.enabled, session: j.session });
    } catch { setState({ loading: false, enabled: false, session: null }); }
  }, []);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}

export const useAccess = () => useContext(Ctx);
