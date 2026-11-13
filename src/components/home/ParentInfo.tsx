import { Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import { materials } from "@/data/materials";
import { adminWaLink } from "@/lib/contact";

const included = [
  "Semua bab di kelas yang dibeli, masing-masing dengan peraga yang bisa digeser dan diketuk",
  "Latihan di setiap subbab dan evaluasi 24 soal per bab, lengkap dengan skor dan daftar jawaban yang salah",
  "Latihan harian penjumlahan, pengurangan, perkalian, dan pembagian dengan soal baru setiap hari",
  "Riwayat nilai yang tersimpan di akun, bisa dibuka dari HP mana pun",
  "Laporan belajar untuk orang tua yang bisa dibagikan lewat tautan",
];
const faq: [string, string][] = [
  ["Apakah bisa dicoba dulu?", "Bisa. Bab pertama setiap kelas terbuka tanpa akun, termasuk materi dan latihannya. Evaluasi dan bab lain terbuka setelah membeli paket."],
  ["Berapa lama paket aktif?", "Paket satu kelas aktif 12 bulan, paket semua kelas aktif 24 bulan sejak akun dibuat. Jika diperpanjang sebelum habis, masa aktif baru dihitung setelah paket lama berakhir."],
  ["Bisa dipakai di berapa perangkat?", "Satu akun untuk satu siswa dan dapat dipakai di dua perangkat sekaligus, misalnya HP dan laptop."],
  ["Bagaimana orang tua memantau belajar anak?", "Dari halaman Akun saya, buka Laporan belajar. Laporan berisi nilai per bab, kegiatan 8 minggu terakhir, dan saran latihan. Tautannya bisa dikirim ke orang tua tanpa perlu PIN."],
  ["Materinya mengikuti kurikulum apa?", "Materi disusun mengacu pada buku siswa Kurikulum Merdeka, dengan angka, gambar, dan soal yang ditulis ulang agar lebih visual."],
];

/** Informasi untuk orang tua: isi paket, cara mendapatkan akun, dan pertanyaan umum. */
export function ParentInfo() {
  const wa = adminWaLink("Halo admin BeSmartKids, saya ingin tahu harga paket dan cara membelinya.");
  const classCount = new Set(materials.map(m => m.classId)).size;
  return <section id="paket" aria-labelledby="paket-title" className="scroll-mt-20 bg-base-100">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h2 id="paket-title" className="text-3xl font-extrabold sm:text-4xl">Untuk orang tua</h2>
        <p className="mt-3 max-w-xl leading-7 text-base-content/70">Saat ini ada {materials.length} bab di {classCount} kelas, dan bab baru terus ditambahkan. Ini yang didapat setelah membeli paket:</p>
        <ul className="mt-5 space-y-3">{included.map(t => <li key={t} className="flex gap-3 leading-7"><Check className="mt-1 size-5 shrink-0 text-success" strokeWidth={2} aria-hidden="true" /><span>{t}</span></li>)}</ul>
        <h3 className="mt-10 text-xl font-extrabold">Pilihan paket</h3>
        <div className="mt-3 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
          <thead><tr className="border-b-2 border-base-300 text-base-content/60"><th className="py-2 pe-4">Paket</th><th className="py-2 pe-4">Isi</th><th className="py-2">Masa aktif</th></tr></thead>
          <tbody>
            <tr className="border-b border-base-300"><td className="py-3 pe-4 font-bold">Satu kelas</td><td className="py-3 pe-4">Semua bab di satu kelas pilihan</td><td className="py-3">12 bulan</td></tr>
            <tr className="border-b border-base-300"><td className="py-3 pe-4 font-bold">Semua kelas</td><td className="py-3 pe-4">Semua bab di semua kelas yang tersedia, cocok untuk kakak-adik atau anak yang naik kelas</td><td className="py-3">24 bulan</td></tr>
          </tbody></table></div>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-success mt-5 gap-2"><MessageCircle className="size-4" aria-hidden="true" />Tanya harga lewat WhatsApp</a>}
      </div>
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-extrabold">Cara mendapatkan akun</h3>
          <ol className="mt-4 space-y-4">
            {[["Coba bab gratis", <>Buka <Link href="/#kelas" className="link text-success">kelas anak</Link> dan coba bab pertamanya.</>], ["Hubungi admin", "Pilih paket lewat WhatsApp dan selesaikan pembayaran."], ["Terima username dan PIN", "Admin mengirim username dan PIN. Masuk, lalu semua bab di paket langsung terbuka."]].map(([t, d], i) =>
              <li key={String(t)} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-success font-extrabold text-success">{i + 1}</span><div><p className="font-bold">{t}</p><p className="text-sm leading-6 text-base-content/70">{d}</p></div></li>)}
          </ol>
        </div>
        <div>
          <h3 className="text-xl font-extrabold">Pertanyaan yang sering diajukan</h3>
          <div className="mt-3 divide-y divide-base-300 border-y border-base-300">{faq.map(([q, a]) => <details key={q} className="group py-3">
            <summary className="cursor-pointer list-none font-bold marker:hidden after:float-right after:content-['+'] group-open:after:content-['−']">{q}</summary>
            <p className="mt-2 text-sm leading-6 text-base-content/70">{a}</p></details>)}</div>
        </div>
      </div>
    </div>
  </section>;
}
