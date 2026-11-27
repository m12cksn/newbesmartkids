// Uji aturan affiliate tanpa browser: komisi per paket (Rp19.900 / Rp34.900, turun proporsional saat promo), link UTM, dan pemilahan pesanan Scalev.
import assert from "node:assert/strict";
import { affiliateTarget, AFF_MIN_PAYOUT, AFF_HOLD_DAYS, commissionFor, packagesOf, toSyncOrders } from "../src/lib/affiliate.ts";

const one = { jenjang: 1, keluarga: 0 }, fam = { jenjang: 0, keluarga: 1 };
assert.equal(commissionFor(one, 79000), 19900, "paket satu jenjang harga normal");
assert.equal(commissionFor(fam, 129000), 34900, "Paket Keluarga harga normal");
assert.equal(commissionFor(one, 59000), 14862, "promo Rp59.000 = 19.900 x 59/79");
assert.equal(commissionFor(fam, 99000), 26784, "promo Rp99.000 = 34.900 x 99/129");
assert.equal(commissionFor({ jenjang: 2, keluarga: 0 }, 158000), 39800, "dua paket jenjang dalam satu pesanan");
assert.equal(commissionFor(one, 99000), 19900, "bayar lebih dari harga normal tidak menaikkan komisi");
assert.equal(commissionFor(one, 0), 0);
assert.deepEqual(packagesOf({ final_variants: { "Paket Belajar BeSmartKids - Paket SD": 1, "Paket Belajar BeSmartKids - Paket SMP": 1 } }), { jenjang: 2, keluarga: 0 });
assert.deepEqual(packagesOf({ final_variants: { "Paket Belajar BeSmartKids - Paket Keluarga": 1 } }), { jenjang: 0, keluarga: 1 });
assert.deepEqual(packagesOf({ product_price: 129000 }), { jenjang: 0, keluarga: 1 }, "tanpa varian: perkiraan dari harga produk");
assert.equal(AFF_MIN_PAYOUT, 50000);
assert.equal(AFF_HOLD_DAYS, 3);

const url = new URL(affiliateTarget("BUNDA123", "https://be-smart-kids.myscalev.com/paket-belajar-besmartkids"));
assert.equal(url.searchParams.get("utm_source"), "affiliate");
assert.equal(url.searchParams.get("utm_campaign"), "BUNDA123");
assert.equal(new URL(affiliateTarget(null, "https://example.com/lp")).search, "", "kode tidak sah: tanpa UTM");

const meta = { utm_source: "affiliate", utm_campaign: "BUNDA123" };
const list = toSyncOrders([
  { order_id: "1", gross_revenue: 79000, payment_status: "paid", status: "completed", confirmed_time: "2026-11-20T00:00:00Z", metadata: meta, customer: { phone: "0811" } },
  { order_id: "2", gross_revenue: "99000", product_price: "129000", final_variants: { "Paket Belajar BeSmartKids - Paket Keluarga": 1 }, payment_status: "settled", status: "confirmed", metadata: meta },
  { order_id: "3", gross_revenue: 79000, payment_status: "unpaid", status: "pending", metadata: meta },
  { order_id: "4", gross_revenue: 79000, payment_status: "paid", status: "canceled", metadata: meta },
  { order_id: "5", gross_revenue: 79000, payment_status: "paid", status: "completed", metadata: { utm_source: "facebook", utm_campaign: "Sales" } },
  { order_id: "6", gross_revenue: 79000, payment_status: "paid", status: "completed", metadata: {} },
]);
assert.deepEqual(list.map(o => [o.orderId, o.paid]), [["1", true], ["2", true], ["4", false]], "belum bayar dan non-affiliate dilewati; batal dikirim untuk dibatalkan");
assert.equal(list[1].amount, 99000, "amount = jumlah dibayar");
assert.equal(list[1].commission, 26784, "Paket Keluarga promo");
assert.equal(list[0].commission, 19900, "order 1: tanpa varian, harga normal satu jenjang");
assert.equal(list[0].paidAt, "2026-11-20T00:00:00Z");
console.log("verify-affiliate: OK");
