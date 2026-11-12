// Server tiruan untuk fungsi public.bsk_* (uji browser tanpa akses ke Supabase).
import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";

const accounts = new Map(); // username -> account
const sessions = new Map(); // token -> { username, at }
const add = (username, pin, extra = {}) => accounts.set(username, { id: randomUUID(), username, pin, displayName: extra.displayName ?? "", phone: "", note: "", role: extra.role ?? "student", disabled: false, createdAt: new Date().toISOString(), entitlements: extra.entitlements ?? [], fails: 0 });
add("admin", "111111", { role: "admin", displayName: "Admin" });
const months = n => new Date(Date.now() + n * 30 * 864e5).toISOString();
const ent = (pkg, classId) => ({ id: randomUUID(), package: pkg, classId: pkg === "kelas" ? classId : null, startsAt: new Date().toISOString(), expiresAt: months(pkg === "semua" ? 24 : 12) });
const byId = id => [...accounts.values()].find(a => a.id === id);
const pub = a => ({ id: a.id, username: a.username, displayName: a.displayName, phone: a.phone, note: a.note, role: a.role, disabled: a.disabled, createdAt: a.createdAt, entitlements: a.entitlements, devices: [...sessions.values()].filter(s => s.username === a.username).length });
const who = t => { const s = sessions.get(t); const a = s && accounts.get(s.username); return a && !a.disabled ? a : null; };
const admin = t => { const a = who(t); if (!a || a.role !== "admin") { const e = new Error("not_admin"); e.code = 403; throw e; } return a; };
const pin = () => String(Math.floor(Math.random() * 1e6)).padStart(6, "0");

const fns = {
  bsk_login: ({ p_username, p_pin }) => {
    const a = accounts.get(p_username); if (!a || a.disabled) return { error: "invalid" };
    if (a.pin !== p_pin) { a.fails++; return a.fails >= 5 ? { error: "locked" } : { error: "invalid" }; }
    const token = randomBytes(16).toString("hex"); sessions.set(token, { username: a.username, at: Date.now() });
    const mine = [...sessions.entries()].filter(([, s]) => s.username === a.username).sort((x, y) => y[1].at - x[1].at);
    mine.slice(2).forEach(([t]) => sessions.delete(t));
    return { token, role: a.role };
  },
  bsk_session: ({ p_token }) => { const a = who(p_token); if (!a) return null; const live = a.entitlements.filter(e => new Date(e.expiresAt) > new Date());
    return { username: a.username, displayName: a.displayName, role: a.role, all: a.role === "admin" || live.some(e => e.package === "semua"), classes: [...new Set(live.filter(e => e.package === "kelas").map(e => e.classId))], expiresAt: live.map(e => e.expiresAt).sort().at(-1) ?? null }; },
  bsk_logout: ({ p_token }) => { sessions.delete(p_token); return null; },
  bsk_admin_list: ({ p_token }) => { admin(p_token); return [...accounts.values()].map(pub).reverse(); },
  bsk_admin_create: ({ p_token, p_username, p_display_name, p_phone, p_note, p_package, p_class }) => { admin(p_token);
    if (!/^[a-z0-9._-]{3,32}$/.test(p_username)) return { error: "bad_username" }; if (accounts.has(p_username)) return { error: "taken" };
    const p = pin(); add(p_username, p, { displayName: p_display_name, entitlements: [ent(p_package, p_class)] }); Object.assign(accounts.get(p_username), { phone: p_phone, note: p_note });
    return { username: p_username, pin: p, account: pub(accounts.get(p_username)) }; },
  bsk_admin_extend: ({ p_token, p_account, p_package, p_class }) => { admin(p_token); const a = byId(p_account); a.entitlements.unshift(ent(p_package, p_class)); return pub(a); },
  bsk_admin_reset_pin: ({ p_token, p_account }) => { admin(p_token); const a = byId(p_account); a.pin = pin(); for (const [t, s] of sessions) if (s.username === a.username) sessions.delete(t); return { username: a.username, pin: a.pin }; },
  bsk_admin_set_disabled: ({ p_token, p_account, p_disabled }) => { admin(p_token); const a = byId(p_account); a.disabled = p_disabled; return pub(a); },
  bsk_admin_logout_devices: ({ p_token, p_account }) => { admin(p_token); const a = byId(p_account); for (const [t, s] of sessions) if (s.username === a.username) sessions.delete(t); return pub(a); },
};

createServer((req, res) => {
  let body = ""; req.on("data", c => (body += c)); req.on("end", () => {
    const name = req.url.split("/rpc/")[1];
    try { const out = fns[name](JSON.parse(body || "{}")); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(out)); }
    catch (e) { res.writeHead(e.code ?? 500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ message: e.message })); }
  });
}).listen(Number(process.env.MOCK_PORT ?? 54329), "127.0.0.1", () => console.log("mock supabase ready"));
