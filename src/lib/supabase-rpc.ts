import type { SessionInfo } from "./access-rules";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

/** Login hanya aktif jika Supabase dikonfigurasi (Vercel). Tanpa itu, misalnya di CI, semua halaman terbuka. */
export const authEnabled = Boolean(url && key);

export class RpcError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!url || !key) throw new RpcError("auth_disabled", 503);
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    const msg = (() => { try { return (JSON.parse(text) as { message?: string }).message ?? text; } catch { return text; } })();
    throw new RpcError(msg, res.status === 403 || msg.includes("not_admin") ? 403 : 502);
  }
  return (text ? JSON.parse(text) : null) as T;
}

// Cache singkat agar setiap klik halaman tidak selalu bertanya ke database.
const cache = new Map<string, { at: number; value: SessionInfo | null }>();
export async function sessionFor(token: string | undefined, fresh = false): Promise<SessionInfo | null> {
  if (!token || !authEnabled) return null;
  const hit = cache.get(token);
  if (!fresh && hit && Date.now() - hit.at < 60_000) return hit.value;
  const value = await rpc<SessionInfo | null>("bsk_session", { p_token: token });
  cache.set(token, { at: Date.now(), value });
  if (cache.size > 2000) cache.delete(cache.keys().next().value!);
  return value;
}
export const forgetSession = (token: string) => cache.delete(token);
