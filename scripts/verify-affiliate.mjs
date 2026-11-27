// Uji aturan affiliate tanpa browser: komisi tetap Rp19.900 / Rp34.900, link UTM, dan pemilahan pesanan Scalev.
import assert from "node:assert/strict";
import { affiliateTarget, AFF_MIN_PAYOUT, AFF_HOLD_DAYS, commissionFor, toSyncOrders } from "../src/lib/affiliate.ts";

assert.equal(commissionFor(79000), 19900, "paket satu jenjang");
assert.equal(commissionFor(129000), 34900, "Paket Keluarga");
assert.equal(commissionFor(69000), 19900, "harga jenjang lain tetap komisi jenjang");
assert.equal(commissionFor(0), 0);
assert.equal(AFF_MIN_PAYOUT, 50000);
assert.equal(AFF_HOLD_DAYS, 3);

const url = new URL(affiliateTarget("BUNDA123", "https://be-smart-kids.myscalev.com/paket-belajar-besmartkids"));
assert.equal(url.searchParams.get("utm_source"), "affiliate");
assert.equal(url.searchParams.get("utm_campaign"), "BUNDA123");
assert.equal(new URL(affiliateTarget(null, "https://example.com/lp")).search, "", "kode tidak sah: tanpa UTM");

const meta = { utm_source: "affiliate", utm_campaign: "BUNDA123" };
const list = toSyncOrders([
  { order_id: "1", gross_revenue: 79000, payment_status: "paid", status: "completed", confirmed_time: "2026-11-20T00:00:00Z", metadata: meta, customer: { phone: "0811" } },
  { order_id: "2", gross_revenue: "99000", product_price: "129000", payment_status: "settled", status: "confirmed", metadata: meta },
  { order_id: "3", gross_revenue: 79000, payment_status: "unpaid", status: "pending", metadata: meta },
  { order_id: "4", gross_revenue: 79000, payment_status: "paid", status: "canceled", metadata: meta },
  { order_id: "5", gross_revenue: 79000, payment_status: "paid", status: "completed", metadata: { utm_source: "facebook", utm_campaign: "Sales" } },
  { order_id: "6", gross_revenue: 79000, payment_status: "paid", status: "completed", metadata: {} },
]);
assert.deepEqual(list.map(o => [o.orderId, o.paid]), [["1", true], ["2", true], ["4", false]], "belum bayar dan non-affiliate dilewati; batal dikirim untuk dibatalkan");
assert.equal(list[1].amount, 129000, "Paket Keluarga diskon dikenali dari harga produk");
assert.equal(commissionFor(list[1].amount), 34900);
assert.equal(list[0].paidAt, "2026-11-20T00:00:00Z");
console.log("verify-affiliate: OK");
