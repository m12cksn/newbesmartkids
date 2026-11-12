# Tampilan halaman masuk (feat/login-design)

- Scope: `/masuk` dibuat seperti contoh dari pemilik: kartu di tengah layar tanpa header/footer, logo, label "BIMBEL KIDS ONLINE", judul "Halo, Ayo Belajar!", kolom Username dan PIN berlatar biru muda, tombol hijau penuh "Masuk Sekarang", dan teks bantuan di bawah. Label tetap "PIN" (bukan password) karena akun memakai PIN 6 angka.
- Files: `src/components/auth/LoginForm.tsx`, `src/app/masuk/page.tsx`, `scripts/smoke-login.mjs` (nama tombol baru).
- Validation: tsc, eslint, build; `scripts/smoke-login.mjs` lulus di 320 dan 1280 px; screenshot 390 dan 1280 ditinjau.
- Login username + PIN record: PR #102, merged as 2243320f09e69a773f0215acfdcd64558e6c2759; Vercel production deployment success; production `/api/sesi` returns `enabled: true` and paid chapters redirect to `/masuk`.
