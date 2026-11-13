// Server tiruan untuk fungsi public.bsk_* (uji browser tanpa akses ke Supabase).
import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";

const accounts = new Map(); // username -> account
const sessions = new Map(); // token -> { username, at }
const add = (username, pin, extra = {}) => accounts.set(username, { id: randomUUID(), username, pin, displayName: extra.displayName ?? "", phone: "", note: "", role: extra.role ?? "student", disabled: false, createdAt: new Date().toISOString(), entitlements: extra.entitlements ?? [], fails: 0 });
add("admin", "111111", { role: "admin", displayName: "Admin" });
const months = n => new Date(Date.now() + n * 30 * 864e5).toISOString();
const ent = (pkg, classId) => ({ id: randomUUID(), package: pkg, classId: pkg === "kelas" ? classId : null, startsAt: new Date().toISOString(), expiresAt: months(pkg === "semua" ? 24 : 12) });
// Akun contoh untuk pengingat perpanjangan: satu paket hampir habis, satu sudah habis, satu masih lama.
const days = n => new Date(Date.now() + n * 864e5).toISOString();
add("hampirhabis", "222222", { displayName: "Rara", entitlements: [{ id: randomUUID(), package: "kelas", classId: 3, startsAt: days(-360), expiresAt: days(5) }] });
add("sudahhabis", "333333", { displayName: "Bimo", entitlements: [{ id: randomUUID(), package: "kelas", classId: 4, startsAt: days(-375), expiresAt: days(-10) }] });
add("masihlama", "444444", { displayName: "Citra", entitlements: [{ id: randomUUID(), package: "kelas", classId: 6, startsAt: days(-10), expiresAt: days(200) }] });
accounts.get("hampirhabis").phone = "081234567890"; accounts.get("sudahhabis").phone = "081298765432";
const byId = id => [...accounts.values()].find(a => a.id === id);
const pub = a => ({ id: a.id, username: a.username, displayName: a.displayName, phone: a.phone, note: a.note, role: a.role, disabled: a.disabled, createdAt: a.createdAt, entitlements: a.entitlements, devices: [...sessions.values()].filter(s => s.username === a.username).length });
const who = t => { const s = sessions.get(t); const a = s && accounts.get(s.username); return a && !a.disabled ? a : null; };
const admin = t => { const a = who(t); if (!a || a.role !== "admin") { const e = new Error("not_admin"); e.code = 403; throw e; } return a; };
const pin = () => String(Math.floor(Math.random() * 1e6)).padStart(6, "0");

const links = new Map(); // code -> { id, expiresAt }
const report = a => ({ name: a.displayName || a.username, generatedAt: new Date().toISOString(), results: (a.results ?? []).slice(0, 300) });
// Paket sekolah: kelas sekolah (rombel), guru, dan rekap nilai.
const groups = []; // { id, name, classId, teacherId, createdAt, members: string[] }
const teacher = t => { const a = who(t); if (!a || !["teacher", "admin"].includes(a.role)) { const e = new Error("not_teacher"); e.code = 403; throw e; } return a; };
const chapterOf = p => /^(\/kelas\/[^/]+\/materi\/[^/?#]+)/.exec(p)?.[1];
const summary = a => { const by = new Map(); for (const r of [...(a.results ?? [])].reverse()) { const c = chapterOf(r.path); if (!c || r.kind === "harian") continue;
    const x = by.get(c) ?? { path: c, title: r.title, best: null, last: null, evals: 0, practice: 0, lastAt: r.at }; x.title = r.title; x.lastAt = r.at;
    if (r.kind === "evaluasi") { x.evals++; x.last = r.score; x.best = Math.max(x.best ?? 0, r.score); } else x.practice++; by.set(c, x); }
  return [...by.values()].sort((x, y) => x.path.localeCompare(y.path)); };
const groupJson = (g, detail) => { const t = byId(g.teacherId);
  return { id: g.id, name: g.name, classId: g.classId, createdAt: g.createdAt, teacher: t ? { id: t.id, username: t.username, displayName: t.displayName } : null,
    members: g.members.map(byId).filter(Boolean).sort((x, y) => (x.displayName || x.username).toLowerCase().localeCompare((y.displayName || y.username).toLowerCase())).map(a => ({ id: a.id, username: a.username, displayName: a.displayName, disabled: a.disabled,
      ...(detail ? { lastAt: a.results?.[0]?.at ?? null, week: (a.results ?? []).filter(r => Date.now() - new Date(r.at) < 7 * 864e5).length, chapters: summary(a) } : {}) })) }; };
const groupOf = id => groups.find(g => g.id === id);
const fns = {
  bsk_admin_set_role: ({ p_token, p_account, p_role }) => { const me = admin(p_token); if (!["student", "teacher"].includes(p_role)) return { error: "bad_role" }; if (me.id === p_account) return { error: "self" };
    const a = byId(p_account); if (a.role !== "admin") a.role = p_role; if (p_role === "student") groups.forEach(g => { if (g.teacherId === a.id) g.teacherId = null; }); return pub(a); },
  bsk_admin_groups: ({ p_token }) => { admin(p_token); return groups.map(g => groupJson(g, false)); },
  bsk_admin_group_save: ({ p_token, p_group, p_name, p_teacher, p_class }) => { admin(p_token); const name = (p_name ?? "").trim().slice(0, 80); if (!name) return { error: "bad_name" };
    if (p_teacher && byId(p_teacher)?.role !== "teacher") return { error: "bad_teacher" };
    let g = p_group ? groupOf(p_group) : null; if (p_group && !g) return { error: "not_found" };
    if (!g) { g = { id: randomUUID(), name, classId: p_class, teacherId: p_teacher, createdAt: new Date().toISOString(), members: [] }; groups.unshift(g); } else Object.assign(g, { name, classId: p_class, teacherId: p_teacher });
    return groupJson(g, false); },
  bsk_admin_group_delete: ({ p_token, p_group }) => { admin(p_token); const i = groups.findIndex(g => g.id === p_group); if (i >= 0) groups.splice(i, 1); return { ok: true }; },
  bsk_admin_group_add: ({ p_token, p_group, p_usernames }) => { admin(p_token); const g = groupOf(p_group); if (!g) return { error: "not_found" }; if (p_usernames.length > 200) return { error: "too_many" };
    const missing = []; for (const u of new Set(p_usernames.map(x => x.trim().toLowerCase()).filter(Boolean))) { const a = accounts.get(u); if (!a || a.role !== "student") missing.push(u); else if (!g.members.includes(a.id)) g.members.push(a.id); }
    return { missing, group: groupJson(g, false) }; },
  bsk_admin_group_remove: ({ p_token, p_group, p_account }) => { admin(p_token); const g = groupOf(p_group); if (!g) return { error: "not_found" }; g.members = g.members.filter(x => x !== p_account); return groupJson(g, false); },
  bsk_admin_bulk_create: ({ p_token, p_group, p_prefix, p_names, p_package, p_class }) => { admin(p_token); const g = groupOf(p_group); if (!g) return { error: "not_found" };
    if (!/^[a-z0-9._-]{2,24}$/.test(p_prefix)) return { error: "bad_prefix" }; if (!(p_names.length >= 1 && p_names.length <= 60)) return { error: "bad_count" };
    let n = 0; const created = [];
    for (const raw of p_names) { const name = raw.trim(); if (!name) continue; let u; do { n++; u = p_prefix + String(n).padStart(2, "0"); } while (accounts.has(u));
      const p = pin(); add(u, p, { displayName: name, entitlements: [ent(p_package, p_class)] }); accounts.get(u).note = `Sekolah: ${g.name}`; g.members.push(accounts.get(u).id); created.push({ username: u, pin: p, displayName: name }); }
    return { created, group: groupJson(g, false) }; },
  bsk_teacher_overview: ({ p_token }) => { const me = teacher(p_token);
    return { name: me.displayName || me.username, role: me.role, groups: groups.filter(g => me.role === "admin" || g.teacherId === me.id).sort((x, y) => x.name.localeCompare(y.name)).map(g => groupJson(g, true)) }; },
  bsk_teacher_report: ({ p_token, p_account }) => { const me = teacher(p_token); if (me.role !== "admin" && !groups.some(g => g.teacherId === me.id && g.members.includes(p_account))) return null; const a = byId(p_account); return a ? report(a) : null; },

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
  bsk_save_result: ({ p_token, p_path, p_title, p_kind, p_part, p_correct, p_total }) => { const a = who(p_token); if (!a) return { error: "session" };
    if (!["latihan", "evaluasi", "harian"].includes(p_kind) || !(p_total >= 1 && p_total <= 100) || !(p_correct >= 0 && p_correct <= p_total) || !/^\/kelas\/[a-z0-9-]+\/materi\/[a-z0-9-]+|^\/mastering-(penjumlahan-pengurangan|perkalian-pembagian)\/level-[1-3]$/.test(p_path)) return { error: "invalid" };
    (a.results ??= []).unshift({ path: p_path, title: p_title ?? "", kind: p_kind, part: p_part ?? "", correct: p_correct, total: p_total, score: Math.round(p_correct * 100 / p_total), at: new Date().toISOString() }); return { ok: true }; },
  bsk_my_results: ({ p_token }) => { const a = who(p_token); return a ? (a.results ?? []).slice(0, 300) : null; },
  bsk_my_report: ({ p_token }) => { const a = who(p_token); return a ? report(a) : null; },
  bsk_report_link: ({ p_token }) => { const a = who(p_token); if (!a) return { error: "session" }; for (const [c, l] of links) if (l.id === a.id) links.delete(c);
    const code = randomBytes(12).toString("hex"), expiresAt = months(1); links.set(code, { id: a.id, expiresAt }); return { code, expiresAt }; },
  bsk_report_status: ({ p_token }) => { const a = who(p_token); const l = a && [...links.values()].find(x => x.id === a.id); return l ? { expiresAt: l.expiresAt } : null; },
  bsk_report_revoke: ({ p_token }) => { const a = who(p_token); if (!a) return { error: "session" }; for (const [c, l] of links) if (l.id === a.id) links.delete(c); return { ok: true }; },
  bsk_report_public: ({ p_code }) => { const l = links.get(p_code); const a = l && byId(l.id); return a && !a.disabled ? { ...report(a), expiresAt: l.expiresAt } : null; },
  bsk_admin_report: ({ p_token, p_account }) => { admin(p_token); const a = byId(p_account); return a ? report(a) : null; },
  bsk_change_pin: ({ p_token, p_old, p_new }) => { const a = who(p_token); if (!a) return { error: "session" }; if (!/^\d{6}$/.test(p_new)) return { error: "format" };
    if (a.pin !== p_old) return { error: "wrong" }; if (p_new === p_old) return { error: "same" }; a.pin = p_new;
    for (const [t, s] of sessions) if (s.username === a.username && t !== p_token) sessions.delete(t); return { ok: true }; },
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
