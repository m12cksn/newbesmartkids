# 2026-11-27 feat/landing-paket-konversi: landing page Scalev, restructure for conversion

## How the live page works (important for later edits)
The Scalev page (`paket-belajar`, slug `paket-belajar-besmartkids`, id 396427) holds only a small loader. The real page is
rendered by `public/landing/paket-belajar.js` and `paket-belajar.css`, served from newbesmartkids.vercel.app
(the Scalev CSP allows only that origin plus Scalev). **Changing the page means changing these two files and deploying the app.
Nothing needs to change in Scalev**: Vercel serves them with `must-revalidate`, so a deploy takes effect immediately.

The two files are now generated. Edit `scripts/landing/paket-belajar.src.html` (HTML, CSS and JS in one readable document), then run:

```bash
node scripts/build-landing-paket.mjs
```

The generator was checked against the previously deployed files: the CSS was byte-identical and the page body identical; the JS
was identical after whitespace and comments were removed.

## Changes (the owner's decisions of 27 Nov)
1. "Pilih Paket" moved directly under the demo (before "Sering begini di rumah?").
2. The email field is no longer shown; the order is sent with name and WhatsApp only. If Scalev rejects an order without email, the email
   field appears automatically with a message, so the buyer is never stuck. **Not yet confirmed against the real Scalev API: place one test order
   without email and check it is accepted** (see "Not tested").
3. QRIS is selected by default; the other methods are behind "Lihat metode lain".
4. The submit button reads "Dapatkan Akses 1 Tahun - Rp79.000" and follows the chosen package (Rp129.000 for Keluarga).
5. "Les atau BeSmartKids?" became a savings block: "Hemat lebih dari 95% vs les", les Rp300-500rb/bulan × 12 = Rp3,6-6 juta/tahun
   versus BeSmartKids Rp79rb/tahun (sekitar Rp6.600/bulan). The les price is labelled an estimate.
6. Button "Coba 3 Soal Gratis Tanpa Daftar" opens the 3-question practice in the demo directly (no sign-up).
7. Headline "Anak Bilang Matematika Itu Susah?" and the new subheadline; hero buttons "Coba 3 Soal Gratis Tanpa Daftar" and "Pilih Paket Rp79rb".
8. The sticky bar is now at the TOP: "BeSmartKids / Akses 1 Tahun mulai Rp79.000" with a yellow "Lihat paket" button; it hides when the form is on screen.
9. New package section: title "Pilih Paket — Akses 1 Tahun Penuh", two cards (Jenjang, Keluarga with "Paling hemat"), a trust bar above the cards.
10. Removed: the long chapter list (replaced by one line plus a "Lihat daftar bab lengkap" accordion), the six "Isi BeSmartKids" boxes,
    four FAQ items (three kept).

## Deliberately different from the request
- **No "4.8/5 dari 1.200+ orang tua" and no "10.000+ siswa"**: these numbers do not exist yet. A test fails the build if such text appears.
- **No "Garansi 7 hari"** until the owner confirms it is in force and states the terms.
- "Hemat 95%" is written as "lebih dari 95%" (79.000 against 3,6 juta is 97,8%; against 4,8 juta, 98,4%); "Rp6.500/bulan" as "sekitar Rp6.600/bulan" (79.000 ÷ 12).
- "8-12 bab per jenjang" is not correct: the chapter data gives SD 40, SMP 16, SMA 8 (Kelas 11 not yet available). The page computes these numbers from the chapter data.
- "Laporan orang tua setiap hari" became "Laporan orang tua lewat link" (it is a link, not a daily message).
- Emojis were replaced by small line icons, in line with the project's UI rules.

## Paths
- `scripts/landing/paket-belajar.src.html`, `scripts/build-landing-paket.mjs`
- `public/landing/paket-belajar.css`, `public/landing/paket-belajar.js` (generated)
- `scripts/smoke-landing-paket.mjs`, `.github/workflows/landing-paket-qa.yml`

## Validation
`scripts/smoke-landing-paket.mjs` (stub Scalev, no real orders, tracking domains blocked) checks:
generated files are in sync with the source; order of sections; no horizontal scroll at 320/390/768/1280; exact headline, subheadline, package title;
no rating/guarantee text; chapter counts; 3 FAQ items; top bar behaviour; the 3-question practice end to end; package buttons select the package and update the
button text; QRIS default and "Lihat metode lain"; payload without email; email field appearing after a rejected order.

## Not tested
- A real order without email against the live Scalev API.
- The page inside Scalev's own preview/editor (the live page was checked after deploy with the real runtime, but no order was placed).

## Rollback
Revert the PR; the previous `public/landing` files are in git history and take effect as soon as the revert is deployed.
