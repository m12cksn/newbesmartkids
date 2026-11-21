"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SessionInfo } from "@/lib/access-rules";

/** anonymous: pemeriksaan sesi berhasil dan pasti belum masuk (tanpa kuki sesi). Bila pemeriksaan gagal, nilainya false. */
type Access = { loading: boolean; enabled: boolean; session: SessionInfo | null; anonymous: boolean; refresh: () => Promise<void> };
const Ctx = createContext<Access>({ loading: false, enabled: false, session: null, anonymous: false, refresh: async () => {} });

export function AccessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Access, "refresh">>({ loading: true, enabled: false, session: null, anonymous: false });
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/sesi", { cache: "no-store" });
      if (!r.ok) throw new Error(`sesi ${r.status}`);
      const j = (await r.json()) as { enabled: boolean; session: SessionInfo | null; hasCookie?: boolean };
      setState({ loading: false, enabled: j.enabled, session: j.session, anonymous: !j.session && j.hasCookie === false });
    } catch { setState({ loading: false, enabled: false, session: null, anonymous: false }); }
  }, []);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}

export const useAccess = () => useContext(Ctx);
