import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { materials } from "@/data/materials";
import { adminWaLink } from "@/lib/contact";
import { offerById, rupiah, scalevUrl } from "@/lib/packages";

const included = [
  "Semua bab di jenjang yang dibeli, masing-masing dengan peraga yang bisa digeser dan diketuk",
  "Latihan di setiap subbab dan evaluasi 24 soal per bab, lengkap dengan skor dan daftar jawaban yang salah",
  "Latihan harian penjumlahan, pengurangan, perkalian, dan pembagian dengan soal baru setiap hari",
  "Riwayat nilai yang tersimpan di akun, bisa dibuka dari HP mana pun",
  "Laporan belajar untuk orang tua yang bisa dibagikan lewat tautan",
];
const faq: [string, string][] = [
  ["Apakah bisa dicoba dulu?", "Bisa. Bab pertama setiap kelas terbuka tanpa akun, termasuk materi dan latihannya. Evaluasi dan bab lain terbuka setelah membeli paket."],
  ["Berapa lama paket aktif?", "Paket Jenjang aktif 12 bulan, Paket Semua Kelas aktif 24 bulan sejak akun dibuat. Jika diperpanjang sebelum habis, masa aktif baru dihitung setelah paket lama berakhir."],
  ["Satu paket untuk berapa anak?", "Paket Jenjang berisi 2 akun dan Paket Semua Kelas berisi 3 akun. Setiap akun untuk satu anak, punya riwayat nilai sendiri, dan bisa dipakai di dua perangkat sekaligus, misalnya HP dan laptop."],
  ["Bagaimana orang tua memantau belajar anak?", "Dari halaman Akun saya, buka Laporan belajar. Laporan berisi nilai per bab, kegiatan 8 minggu terakhir, dan saran latihan. Tautannya bisa dikirim ke orang tua tanpa perlu PIN."],
  ["Materinya mengikuti kurikulum apa?", "Materi disusun mengacu pada buku siswa Kurikulum Merdeka, dengan angka, gambar, dan soal yang ditulis ulang agar lebih visual."],
];

/** Informasi untuk orang tua: isi paket, cara mendapatkan akun, dan pertanyaan umum. */
export function ParentInfo() {
  const wa = adminWaLink("Halo admin BeSmartKids, saya ingin tahu harga paket dan cara membelinya.");
  const classCount = new Set(materials.map(m => m.classId)).size;
  const jenjang = offerById("sd")!, semua = offerById("semua")!;
  const buy = (kind: "jenjang" | "semua", text: string) => scalevUrl(kind) || adminWaLink(text);
  const plans = [
    { title: "Paket Jenjang", offer: jenjang, best: false, scalev: Boolean(scalevUrl("jenjang")), href: buy("jenjang", "Halo admin BeSmartKids, saya ingin membeli Paket Jenjang (SD/SMP) Rp79.000."),
      points: ["Pilih SD (kelas 1–6) atau SMP (kelas 7–9)", "Semua bab di jenjang itu, termasuk saat naik kelas", "2 akun untuk 2 anak"] },
    { title: "Paket Semua Kelas", offer: semua, best: true, scalev: Boolean(scalevUrl("semua")), href: buy("semua", "Halo admin BeSmartKids, saya ingin membeli Paket Semua Kelas Rp129.000."),
      points: ["Semua bab dari kelas 1 sampai kelas tertinggi yang tersedia", "Cocok untuk kakak-adik beda jenjang", "3 akun untuk 3 anak"] },
  ];
  return <section id="paket" aria-labelledby="paket-title" className="scroll-mt-20 bg-base-100">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h2 id="paket-title" className="text-3xl font-extrabold sm:text-4xl">Untuk orang tua</h2>
        <p className="mt-3 max-w-xl leading-7 text-base-content/70">Saat ini ada {materials.length} bab di {classCount} kelas, dan bab baru terus ditambahkan. Ini yang didapat setelah membeli paket:</p>
        <ul className="mt-5 space-y-3">{included.map(t => <li key={t} className="flex gap-3 leading-7"><Check className="mt-1 size-5 shrink-0 text-success" strokeWidth={2} aria-hidden="true" /><span>{t}</span></li>)}</ul>
        <h3 className="mt-10 text-xl font-extrabold">Pilihan paket</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{plans.map(p => <div key={p.title} data-testid="plan" className={`flex flex-col rounded-md border-2 p-5 ${p.best ? "border-success" : "border-base-300"}`}>
          <p className="font-extrabold">{p.title}</p>
          <p className="mt-2 text-3xl font-extrabold">{rupiah(p.offer.price)}</p>
          <p className="text-sm text-base-content/60">{p.offer.accounts} akun, aktif {p.offer.months} bulan</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">{p.points.map(t => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />{t}</li>)}</ul>
          <a href={p.href} target="_blank" rel="noopener noreferrer" className={`btn mt-5 gap-2 ${p.best ? "btn-success" : "btn-outline btn-success"}`}>{p.scalev ? <ShoppingBag className="size-4" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}{p.scalev ? "Beli sekarang" : "Pesan lewat WhatsApp"}</a>
        </div>)}</div>
        <p className="mt-3 text-sm text-base-content/60">Paket SMA menyusul setelah bab kelas 10–12 tersedia. {wa && <>Ada pertanyaan? <a href={wa} target="_blank" rel="noopener noreferrer" className="link text-success">Tanya admin lewat WhatsApp</a>.</>}</p>
      </div>
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-extrabold">Cara mendapatkan akun</h3>
          <ol className="mt-4 space-y-4">
            {[["Coba bab gratis", <>Buka <Link href="/#kelas" className="link text-success">kelas anak</Link> dan coba bab pertamanya.</>], ["Bayar", "Pilih paket di atas dan selesaikan pembayaran. Tulis nomor WhatsApp yang aktif."], ["Terima username dan PIN", "Admin mengirim username dan PIN setiap akun lewat WhatsApp paling lambat 1×24 jam. Masuk, lalu semua bab di paket langsung terbuka."]].map(([t, d], i) =>
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
