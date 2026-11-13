# Nomor WhatsApp admin (feat/admin-wa)

- Nomor admin dari pengguna: 0857-2632-1786 (dipakai sebagai `DEFAULT_ADMIN_WA` di `src/lib/contact.ts`; tetap dapat diganti lewat env `NEXT_PUBLIC_ADMIN_WA`).
- Efek: tombol/tautan "Hubungi admin" di footer, halaman Kebijakan Privasi dan Syarat Layanan, halaman masuk, dan pemberitahuan perpanjangan di Akun saya kini aktif dan membuka wa.me/6285726321786.
- Validasi: build tanpa env, `scripts/smoke-legal-pages.mjs` 320/390/768/1280 memeriksa tautan wa.me/6285726321786.
- Catatan sebelumnya: PR #121 (kebijakan) di-merge sebagai c879584, PR #122 (pengingat perpanjangan) sebagai 6644856; keduanya sudah tayang.
