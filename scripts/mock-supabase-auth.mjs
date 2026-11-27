// Server tiruan untuk fungsi public.bsk_* (uji browser tanpa akses ke Supabase).
import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";

const accounts = new Map(); // username -> account
const sessions = new Map(); // token -> { username, at }
const add = (username, pin, extra = {}) => accounts.set(username, { id: randomUUID(), username, pin, displayName: extra.displayName ?? "", phone: "", note: "", role: extra.role ?? "student", disabled: false, createdAt: new Date().toISOString(), entitlements: extra.entitlements ?? [], fails: 0 });
add("admin", "111111", { role: "admin", displayName: "Admin" });
const months = n => new Date(Date.now() + n * 30 * 864e5).toISOString();
const ent = (pkg, classId) => ({ id: randomUUID(), package: pkg, classId: pkg === "kelas" ? classId : null, startsAt: new Date().toISOString(), expiresAt: months(12) });
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
let resultId = 0;
const report = a => ({ name: a.displayName || a.username, generatedAt: new Date().toISOString(), results: (a.results ?? []).slice(0, 300) });
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
  bsk_save_result: ({ p_token, p_path, p_title, p_kind, p_part, p_correct, p_total, p_incorrect }) => { const a = who(p_token); if (!a) return { error: "session" };
    if (!["latihan", "evaluasi", "harian"].includes(p_kind) || !(p_total >= 1 && p_total <= 100) || !(p_correct >= 0 && p_correct <= p_total) || !/^\/kelas\/[a-z0-9-]+\/materi\/[a-z0-9-]+|^\/mastering-(penjumlahan-pengurangan|perkalian-pembagian)\/level-[1-3]$/.test(p_path)) return { error: "invalid" };
    (a.results ??= []).unshift({ id: String(++resultId), path: p_path, title: p_title ?? "", kind: p_kind, part: p_part ?? "", correct: p_correct, total: p_total, incorrect: p_incorrect, score: Math.round(p_correct * 100 / p_total), at: new Date().toISOString() }); return { ok: true }; },
  bsk_my_result_summaries: ({ p_token }) => { const a = who(p_token); return a ? (a.results ?? []).slice(0, 300).map(r => r.kind === "evaluasi" ? { ...r, incorrect: null } : r) : null; },
  bsk_my_evaluation: ({ p_token, p_result_id }) => who(p_token)?.results?.find(r => r.id === p_result_id && r.kind === "evaluasi") ?? null,
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
  bsk_admin_update_account: ({ p_token, p_account, p_username, p_display_name, p_phone, p_note }) => { admin(p_token); const a = byId(p_account); if (!a) return { error: "not_found" };
    const u = String(p_username ?? "").trim().toLowerCase(); if (!/^[a-z0-9._-]{3,32}$/.test(u)) return { error: "bad_username" }; if (accounts.has(u) && accounts.get(u) !== a) return { error: "taken" };
    if (u !== a.username) { accounts.delete(a.username); for (const s of sessions.values()) if (s.username === a.username) s.username = u; a.username = u; accounts.set(u, a); }
    Object.assign(a, { displayName: p_display_name ?? "", phone: p_phone ?? "", note: p_note ?? "" }); return pub(a); },
  bsk_admin_extend: ({ p_token, p_account, p_package, p_class }) => { admin(p_token); const a = byId(p_account); a.entitlements.unshift(ent(p_package, p_class)); return pub(a); },
  bsk_admin_reset_pin: ({ p_token, p_account }) => { admin(p_token); const a = byId(p_account); a.pin = pin(); for (const [t, s] of sessions) if (s.username === a.username) sessions.delete(t); return { username: a.username, pin: a.pin }; },
  bsk_admin_set_disabled: ({ p_token, p_account, p_disabled }) => { admin(p_token); const a = byId(p_account); a.disabled = p_disabled; return pub(a); },
  bsk_admin_logout_devices: ({ p_token, p_account }) => { admin(p_token); const a = byId(p_account); for (const [t, s] of sessions) if (s.username === a.username) sessions.delete(t); return pub(a); },

  // ---------- Affiliate ----------
  ...(() => {
    const affs = new Map(); // accountId -> affiliate
    const clicks = new Map(); // accountId -> n
    const comms = new Map(); // orderId -> commission
    const payouts = []; let lastSync = null;
    const norm = p => { const d = String(p ?? "").replace(/\D/g, ""); return d.startsWith("0") ? "62" + d.slice(1) : d.startsWith("8") ? "62" + d : d; };
    const HOLD = 3 * 864e5, now = () => Date.now();
    const wallet = (t, n, nm) => !["DANA", "OVO", "GoPay", "ShopeePay", "LinkAja"].includes(t) ? "bad_wallet" : !/^\d{8,16}$/.test(String(n ?? "").replace(/\D/g, "")) ? "bad_wallet_number" : String(nm ?? "").trim().length < 2 ? "bad_wallet_name" : null;
    const code = name => { const b = (String(name).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "BSK").padEnd(3, "K"); let c; do c = b + String(Math.floor(Math.random() * 1000)).padStart(3, "0"); while ([...affs.values()].some(a => a.code === c)); return c; };
    const mine = id => [...comms.values()].filter(c => c.affiliateId === id);
    const sum = xs => xs.reduce((s, x) => s + x.amount, 0);
    const json = f => { const cs = mine(f.accountId), live = cs.filter(c => c.status === "pending" && !c.payoutId);
      return { code: f.code, fullName: f.fullName, phone: f.phone, walletType: f.walletType, walletNumber: f.walletNumber, walletName: f.walletName, status: f.status, createdAt: f.createdAt,
        clicks: clicks.get(f.accountId) ?? 0, clicks30: clicks.get(f.accountId) ?? 0, sales: cs.filter(c => c.status === "pending").length,
        held: sum(live.filter(c => now() - c.paidAt < HOLD)), available: sum(live.filter(c => now() - c.paidAt >= HOLD)),
        requested: sum(payouts.filter(p => p.affiliateId === f.accountId && p.status === "requested")), paid: sum(payouts.filter(p => p.affiliateId === f.accountId && p.status === "paid")) }; };
    const detail = f => ({ ...json(f), lastSync, commissions: mine(f.accountId).sort((a, b) => b.paidAt - a.paidAt).map(c => ({ orderId: c.orderId.slice(-6), orderAmount: c.orderAmount, amount: c.amount, paidAt: new Date(c.paidAt).toISOString(), availableAt: new Date(c.paidAt + HOLD).toISOString(),
      state: c.status === "void" ? "void" : c.payoutId ? "payout" : now() - c.paidAt < HOLD ? "held" : "available" })), payouts: payouts.filter(p => p.affiliateId === f.accountId).map(({ affiliateId, ...p }) => p) });
    const make = (acc, name, phone, t, n, nm) => { const f = { accountId: acc.id, code: code(name), fullName: name, phone, walletType: t, walletNumber: String(n).replace(/\D/g, ""), walletName: nm, status: "active", createdAt: new Date().toISOString() }; affs.set(acc.id, f); return f; };
    const check = (name, phone, t, n, nm) => String(name ?? "").trim().length < 2 ? "bad_name" : !/^62\d{8,13}$/.test(norm(phone)) ? "bad_phone" : wallet(t, n, nm) ?? ([...affs.values()].some(a => a.phone === norm(phone)) ? "phone_used" : null);
    const adminData = () => ({ lastSync, affiliates: [...affs.values()].map(f => ({ ...json(f), id: f.accountId, username: byId(f.accountId).username })),
      payouts: payouts.map(p => { const f = affs.get(p.affiliateId); const { affiliateId, ...rest } = p; return { ...rest, code: f.code, fullName: f.fullName, phone: f.phone }; }) });
    globalThis.__affCodes = () => [...affs.values()].map(f => ({ code: f.code, phone: f.phone }));
    return {
      bsk_affiliate_register: ({ p_name, p_phone, p_wallet_type, p_wallet_number, p_wallet_name }) => { const e = check(p_name, p_phone, p_wallet_type, p_wallet_number, p_wallet_name); if (e) return { error: e };
        const base = (String(p_name).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "aff").padEnd(3, "f"); let u; do u = base + String(Math.floor(Math.random() * 1000)).padStart(3, "0"); while (accounts.has(u));
        const p = pin(); add(u, p, { displayName: p_name }); const acc = accounts.get(u); acc.phone = norm(p_phone); acc.note = "Affiliate";
        const f = make(acc, p_name, norm(p_phone), p_wallet_type, p_wallet_number, p_wallet_name); const token = randomBytes(16).toString("hex"); sessions.set(token, { username: u, at: Date.now() });
        return { username: u, pin: p, code: f.code, token }; },
      bsk_affiliate_join: ({ p_token, p_name, p_phone, p_wallet_type, p_wallet_number, p_wallet_name }) => { const a = who(p_token); if (!a) return { error: "session" }; if (affs.has(a.id)) return { error: "exists" };
        const e = check(p_name, p_phone, p_wallet_type, p_wallet_number, p_wallet_name); if (e) return { error: e }; return detail(make(a, p_name, norm(p_phone), p_wallet_type, p_wallet_number, p_wallet_name)); },
      bsk_affiliate_me: ({ p_token }) => { const a = who(p_token); if (!a) return { error: "session" }; const f = affs.get(a.id); return f ? detail(f) : { none: true, displayName: a.displayName, phone: a.phone }; },
      bsk_affiliate_update_wallet: ({ p_token, p_wallet_type, p_wallet_number, p_wallet_name }) => { const a = who(p_token); if (!a) return { error: "session" }; const f = affs.get(a.id); if (!f) return { error: "none" };
        const e = wallet(p_wallet_type, p_wallet_number, p_wallet_name); if (e) return { error: e }; Object.assign(f, { walletType: p_wallet_type, walletNumber: String(p_wallet_number).replace(/\D/g, ""), walletName: p_wallet_name }); return detail(f); },
      bsk_affiliate_withdraw: ({ p_token }) => { const a = who(p_token); if (!a) return { error: "session" }; const f = affs.get(a.id); if (!f) return { error: "none" }; if (f.status !== "active") return { error: "blocked" };
        if (payouts.some(p => p.affiliateId === f.accountId && p.status === "requested")) return { error: "open" };
        const ready = mine(f.accountId).filter(c => c.status === "pending" && !c.payoutId && now() - c.paidAt >= HOLD), amount = sum(ready); if (amount < 50000) return { error: "min", available: amount };
        const id = randomUUID(); payouts.unshift({ id, affiliateId: f.accountId, amount, wallet: `${f.walletType} ${f.walletNumber} a.n. ${f.walletName}`, status: "requested", note: "", requestedAt: new Date().toISOString(), decidedAt: null });
        ready.forEach(c => (c.payoutId = id)); return detail(f); },
      bsk_affiliate_click: ({ p_code }) => { const f = [...affs.values()].find(x => x.code === String(p_code ?? "").toUpperCase() && x.status === "active"); if (!f) return null; clicks.set(f.accountId, (clicks.get(f.accountId) ?? 0) + 1); return f.code; },
      bsk_affiliate_record: ({ p_key, p_token, p_orders }) => { if (p_key !== "test-sync") admin(p_token); let n = 0, v = 0, k = 0;
        for (const o of p_orders ?? []) { const f = [...affs.values()].find(x => x.code === String(o.code).toUpperCase()); if (!f) { k++; continue; }
          if (o.paid) { if (norm(o.buyerPhone) === f.phone) { k++; continue; } if (!comms.has(o.orderId)) { comms.set(o.orderId, { orderId: o.orderId, affiliateId: f.accountId, orderAmount: o.amount, amount: o.amount <= 0 ? 0 : o.amount >= 129000 ? 34900 : 19900, paidAt: new Date(o.paidAt ?? Date.now()).getTime(), status: "pending", payoutId: null }); n++; } }
          else { const c = comms.get(o.orderId); if (c && c.status === "pending" && !c.payoutId) { c.status = "void"; v++; } } }
        lastSync = new Date().toISOString(); return { new: n, void: v, skipped: k }; },
      bsk_affiliate_last_sync: () => lastSync,
      bsk_admin_affiliates: ({ p_token }) => { admin(p_token); return adminData(); },
      bsk_admin_payout_decide: ({ p_token, p_payout, p_status, p_note }) => { admin(p_token); const p = payouts.find(x => x.id === p_payout && x.status === "requested"); if (!p) return { error: "not_found" };
        Object.assign(p, { status: p_status, note: p_note ?? "", decidedAt: new Date().toISOString() }); if (p_status === "rejected") for (const c of comms.values()) if (c.payoutId === p.id) c.payoutId = null; return adminData(); },
      bsk_admin_affiliate_status: ({ p_token, p_account, p_status }) => { admin(p_token); const f = affs.get(p_account); if (f) f.status = p_status; return adminData(); },
    };
  })(),
};

// Pesanan Scalev tiruan: untuk setiap affiliate ada 4 pesanan lunas (3 sudah lewat masa tahan; C = Paket Keluarga diskon Rp99.000), 1 pembelian sendiri, 1 belum bayar, 1 batal.
const scalevOrders = () => (globalThis.__affCodes?.() ?? []).flatMap(({ code, phone }) => {
  const ago = d => new Date(Date.now() - d * 864e5).toISOString(), meta = { utm_source: "affiliate", utm_campaign: code };
  const o = (id, amount, days, pay = "paid", status = "completed", ph = "08111111111", price = amount) => ({ order_id: `${code}-${id}`, gross_revenue: amount, product_price: price, payment_status: pay, status, confirmed_time: ago(days), metadata: meta, customer: { phone: ph } });
  return [o("A", 129000, 5), o("B", 129000, 4), o("C", 99000, 4, "paid", "completed", "08111111111", 129000), o("D", 79000, 0), o("SELF", 79000, 5, "paid", "completed", phone), o("UNPAID", 79000, 0, "unpaid", "pending"), o("BATAL", 79000, 1, "unpaid", "canceled")];
});

createServer((req, res) => {
  if (req.url.startsWith("/scalev/v3/orders")) {
    if (req.headers.authorization !== "Bearer test") { res.writeHead(401); res.end(JSON.stringify({ error: "Invalid API key" })); return; }
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ data: scalevOrders(), has_next: false, next_cursor: null })); return;
  }
  if (req.url.startsWith("/lp")) { res.writeHead(200, { "Content-Type": "text/html" }); res.end("<!doctype html><title>Halaman penjualan</title><h1>Halaman penjualan tiruan</h1>"); return; }
  let body = ""; req.on("data", c => (body += c)); req.on("end", () => {
    const name = req.url.split("/rpc/")[1];
    try { const out = fns[name](JSON.parse(body || "{}")); res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(out)); }
    catch (e) { res.writeHead(e.code ?? 500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ message: e.message })); }
  });
}).listen(Number(process.env.MOCK_PORT ?? 54329), "127.0.0.1", () => console.log("mock supabase ready"));
