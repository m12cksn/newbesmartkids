import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Syarat Layanan", description: "Aturan pemakaian BeSmartKids: paket, akun, masa aktif, pembayaran, dan penggunaan materi." };

export default function Page() {
  return <LegalPage title="Syarat Layanan" updated="13 November 2026"
    intro="Syarat ini berlaku untuk semua orang yang memakai BeSmartKids, termasuk siswa dan orang tua yang membeli paket. Dengan membeli paket atau masuk ke akun, Anda menyetujui syarat di bawah ini."
    sections={[
      { id: "layanan", title: "Layanan", body: <p>BeSmartKids menyediakan materi matematika interaktif, latihan, evaluasi, latihan harian, dan laporan belajar untuk kelas 1 sampai 12. Bab pertama setiap kelas boleh dicoba gratis. Video pembelajaran sebagian masih disiapkan dan akan ditambahkan bertahap.</p> },
      { id: "paket", title: "Paket dan masa aktif", body: <ul>
        <li>Paket Jenjang berisi 2 akun dan membuka semua bab di satu jenjang (SD kelas 1–6 atau SMP kelas 7–9) selama 12 bulan sejak diaktifkan.</li><li>Paket Semua Kelas berisi 3 akun dan membuka semua bab di semua kelas selama 24 bulan sejak diaktifkan.</li><li>Pembayaran dilakukan melalui Scalev. Username dan PIN dikirim lewat WhatsApp setelah pembayaran diterima.</li>
        <li>Jika paket diperpanjang sebelum berakhir, masa aktif baru dihitung setelah masa aktif lama habis.</li><li>Setelah masa aktif berakhir, akun tetap dapat masuk dan riwayat belajar tetap tersimpan, tetapi bab berbayar terkunci kembali.</li></ul> },
      { id: "pembayaran", title: "Pembayaran", body: <>
        <p>Harga paket diinformasikan oleh admin sebelum pembelian. Akun dan PIN dikirim setelah pembayaran diterima.</p>
        <p>Jika paket belum aktif dalam 1 × 24 jam setelah pembayaran, hubungi admin. Pengembalian dana dapat diajukan dalam 7 hari sejak paket aktif jika materi kelas yang dibeli tidak dapat dibuka karena masalah dari pihak kami.</p></> },
      { id: "akun", title: "Akun dan PIN", body: <ul>
        <li>Satu akun untuk satu siswa. Akun dapat dipakai di paling banyak dua perangkat sekaligus; masuk di perangkat ketiga akan mengeluarkan perangkat yang paling lama.</li>
        <li>Jaga kerahasiaan PIN. PIN dapat diganti sendiri di halaman Akun saya, atau diatur ulang oleh admin.</li>
        <li>Akun yang dibagikan kepada banyak orang atau dipakai untuk mengganggu layanan dapat dinonaktifkan.</li></ul> },
      { id: "materi", title: "Penggunaan materi", body: <>
        <p>Materi, gambar, peraga, dan soal di BeSmartKids hanya untuk belajar pribadi siswa yang memiliki akun. Materi tidak boleh disalin, dijual kembali, atau dibagikan sebagai bahan berbayar tanpa izin.</p>
        <p>Materi disusun mengacu pada buku siswa Kurikulum Merdeka dan sumber lain yang disebutkan; angka, gambar, dan soal ditulis ulang oleh BeSmartKids.</p></> },
      { id: "anak", title: "Pengguna anak", body: <p>Akun siswa di bawah 18 tahun dibuat atas permintaan orang tua atau wali, yang bertanggung jawab atas pemakaian akun. Orang tua dapat memantau kegiatan anak melalui laporan belajar.</p> },
      { id: "batas", title: "Batas tanggung jawab", body: <p>Kami berusaha agar situs selalu dapat dibuka dan materinya benar. Jika ada gangguan atau kesalahan soal, laporkan kepada admin dan kami akan memperbaikinya. BeSmartKids adalah sarana belajar pendamping dan tidak menjamin nilai tertentu di sekolah.</p> },
      { id: "perubahan", title: "Perubahan syarat", body: <p>Syarat ini dapat diperbarui. Tanggal berlaku di bagian atas halaman menunjukkan versi terbaru. Perubahan yang memengaruhi paket yang sudah dibeli tidak mengurangi masa aktif paket tersebut.</p> },
    ]} />;
}
