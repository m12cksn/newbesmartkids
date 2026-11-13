import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Kebijakan Privasi", description: "Data apa yang disimpan BeSmartKids, untuk apa, berapa lama, dan cara meminta penghapusannya." };

export default function Page() {
  return <LegalPage title="Kebijakan Privasi" updated="13 November 2026"
    intro="Halaman ini menjelaskan data apa yang disimpan BeSmartKids saat anak belajar di situs ini, untuk apa data itu dipakai, berapa lama disimpan, dan bagaimana orang tua dapat melihat, mengubah, atau menghapusnya. Sebagian besar pengguna kami adalah anak-anak, jadi kami menyimpan data sesedikit mungkin."
    sections={[
      { id: "tanpa-akun", title: "Belajar tanpa akun", body: <>
        <p>Bab pertama setiap kelas dapat dibuka tanpa akun. Saat itu kami tidak meminta nama atau data pribadi apa pun.</p>
        <p>Beberapa kemajuan latihan, misalnya hasil latihan harian, disimpan di penyimpanan peramban (localStorage) pada perangkat yang dipakai. Data ini tidak dikirim ke server kami dan hilang jika riwayat peramban dihapus.</p></> },
      { id: "data-akun", title: "Data yang kami simpan untuk akun", body: <>
        <p>Akun dibuat oleh admin BeSmartKids setelah paket dibeli. Data yang disimpan:</p>
        <ul><li>Username dan nama tampilan siswa (boleh nama panggilan).</li><li>PIN, yang disimpan dalam bentuk terenkripsi (hash) sehingga admin pun tidak dapat membacanya.</li>
          <li>Nomor WhatsApp orang tua dan catatan admin, untuk mengirim username, PIN, dan kabar perpanjangan paket.</li><li>Paket yang aktif dan tanggal berakhirnya.</li>
          <li>Hasil latihan dan evaluasi: nama bab, bagian, jumlah benar, skor, dan waktunya.</li><li>Sesi masuk per perangkat beserta jenis peramban, agar akun hanya aktif di paling banyak dua perangkat.</li></ul>
        <p>Kami tidak meminta alamat rumah, nama sekolah, foto, lokasi, atau nomor identitas.</p></> },
      { id: "kegunaan", title: "Untuk apa data dipakai", body: <ul>
        <li>Membuka bab dan evaluasi sesuai paket yang dibeli.</li><li>Menampilkan riwayat belajar di halaman Akun saya dan laporan belajar untuk orang tua.</li>
        <li>Membantu admin menjawab pertanyaan, mengatur ulang PIN, dan memperpanjang paket.</li><li>Menjaga keamanan akun, misalnya mengunci sementara setelah lima kali salah PIN.</li></ul> },
      { id: "berbagi", title: "Siapa yang dapat melihat data", body: <>
        <ul><li>Siswa dan orang tua melalui akun siswa.</li><li>Orang yang menerima tautan laporan belajar. Tautan ini dibuat sendiri dari akun siswa, hanya dapat dibaca, berlaku 30 hari, dan dapat dinonaktifkan kapan saja.</li>
          <li>Admin BeSmartKids, untuk mengelola akun dan paket.</li></ul>
        <p>Kami tidak menjual data, tidak memasang iklan, dan tidak membagikan data kepada pihak lain untuk pemasaran. Situs ini dijalankan di Vercel dan datanya disimpan di Supabase (pusat data di Mumbai, India); kedua layanan itu hanya menyimpan dan memproses data atas nama kami.</p></> },
      { id: "kuki", title: "Kuki", body: <p>Kami memakai satu kuki bernama bsk_sesi untuk menjaga status masuk selama 30 hari. Kuki ini tidak dipakai untuk melacak kunjungan ke situs lain. Kami tidak memakai kuki iklan atau pelacak pihak ketiga.</p> },
      { id: "lama-simpan", title: "Berapa lama data disimpan", body: <ul>
        <li>Sesi masuk berakhir setelah 30 hari, atau segera saat keluar atau saat PIN diganti.</li><li>Tautan laporan untuk orang tua berakhir setelah 30 hari.</li>
        <li>Akun dan riwayat belajar disimpan selama akun masih dipakai. Jika orang tua meminta penghapusan, akun beserta riwayatnya dihapus dalam 14 hari kerja.</li></ul> },
      { id: "hak", title: "Hak orang tua dan siswa", body: <>
        <p>Orang tua dapat meminta untuk melihat, membetulkan, atau menghapus data anak, serta menonaktifkan akun. Sampaikan permintaan kepada admin; kami akan memastikan bahwa permintaan datang dari pemilik akun sebelum memprosesnya.</p>
        <p>Siswa dapat mengganti PIN sendiri di halaman Akun saya, dan mengeluarkan akun dari perangkat lain dengan cara itu.</p></> },
      { id: "keamanan", title: "Keamanan", body: <p>PIN, sesi, dan kode tautan laporan disimpan sebagai hash. Data hanya dapat dibaca melalui fungsi yang memeriksa sesi masuk. Koneksi ke situs memakai HTTPS. Tidak ada sistem yang sepenuhnya bebas risiko; jika terjadi kebocoran data, kami akan memberi tahu orang tua yang terdampak melalui WhatsApp.</p> },
      { id: "perubahan", title: "Perubahan kebijakan", body: <p>Jika kebijakan ini berubah, tanggal berlaku di bagian atas halaman akan diperbarui. Perubahan penting juga akan disampaikan kepada orang tua melalui WhatsApp.</p> },
    ]} />;
}
