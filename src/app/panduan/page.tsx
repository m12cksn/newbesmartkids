import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TutorialVideo } from "@/components/guide/TutorialVideo";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { adminWaLink } from "@/lib/contact";

export const metadata: Metadata = { title: "Panduan", description: "Cara memakai BeSmartKids: masuk dengan username dan PIN, belajar per bab, latihan, evaluasi, latihan harian, dan melihat laporan belajar anak." };

type Step = { title: string; text: string };
const groups: { id: string; title: string; steps: Step[] }[] = [
  { id: "masuk", title: "Masuk ke akun", steps: [
    { title: "Buka BeSmartKids", text: "Buka newbesmartkids.vercel.app di browser HP, tablet, atau laptop. Tidak perlu memasang aplikasi." },
    { title: "Ketuk Masuk", text: "Ketuk ikon masuk di kanan atas. Isi username dan PIN 6 angka yang dikirim admin lewat WhatsApp, lalu ketuk Masuk Sekarang." },
  ] },
  { id: "belajar", title: "Belajar per bab", steps: [
    { title: "Pilih kelas dan bab", text: "Ketuk Lihat semua kelas, pilih kelas anak, lalu pilih babnya. Bab yang terbuka sesuai paket yang dibeli." },
    { title: "Baca dan coba peraga", text: "Setiap bab dibagi menjadi beberapa subbab. Baca penjelasannya, lalu ketuk atau geser peraganya untuk melihat hasilnya berubah." },
    { title: "Kerjakan latihan", text: "Ketuk tombol Latihan. Setiap jawaban langsung diperiksa. Di akhir latihan muncul jumlah benar, salah, dan skor." },
    { title: "Kerjakan evaluasi", text: "Setelah semua subbab selesai, kerjakan Evaluasi 24 soal. Di akhir ada skor dan pembahasan soal yang salah." },
    { title: "Pakai kertas coret", text: "Ketuk Kertas coret di pojok bawah untuk menghitung langsung di layar." },
  ] },
  { id: "harian", title: "Latihan harian", steps: [
    { title: "Kerjakan 7 soal setiap hari", text: "Buka Latihan harian dari halaman depan. Ada 3 level, dan soalnya berganti setiap pukul 00.00 WIB." },
    { title: "Bantu satu langkah", text: "Di latihan berhitung bersusun, ketuk Bantu satu langkah bila anak macet. Langkah berikutnya ditunjukkan satu per satu." },
  ] },
  { id: "hasil", title: "Lihat hasil belajar", steps: [
    { title: "Buka halaman akun", text: "Ketuk ikon akun di kanan atas. Di sana ada kelas yang terbuka, masa berlaku paket, dan riwayat belajar." },
    { title: "Buka laporan belajar", text: "Ketuk Laporan belajar untuk melihat ringkasan nilai. Laporan juga bisa dicetak atau disimpan sebagai PDF." },
    { title: "Bagikan ke orang tua", text: "Ketuk Buat tautan untuk orang tua, lalu salin atau kirim lewat WhatsApp. Laporan bisa dibuka tanpa username dan PIN selama 30 hari." },
  ] },
];
const faq: Step[] = [
  { title: "Bisa dipakai di berapa perangkat?", text: "Satu akun bisa dipakai di 2 perangkat. Jika masuk di perangkat ketiga, perangkat yang paling lama otomatis keluar." },
  { title: "Bagaimana mengganti PIN?", text: "Buka halaman akun, ketuk Ganti PIN, isi PIN lama dan PIN baru 6 angka." },
  { title: "Lupa PIN?", text: "Hubungi admin lewat WhatsApp. Admin akan membuatkan PIN baru." },
  { title: "Apa yang terjadi setelah masa aktif habis?", text: "Akun tetap bisa masuk dan riwayat belajar tetap tersimpan, tetapi bab berbayar terkunci kembali sampai paket diperpanjang." },
];

export default function Page() {
  const wa = adminWaLink("Halo admin BeSmartKids, saya butuh bantuan memakai BeSmartKids.");
  let n = 0;
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Cara memakai BeSmartKids</h1>
      <p className="mt-3 max-w-2xl leading-7 text-base-content/80">Tonton video singkat ini, atau ikuti langkah tertulis di bawahnya. Semua bisa dilakukan dari HP.</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24"><TutorialVideo /></div>
        <div className="min-w-0 space-y-10">
          <nav aria-label="Isi panduan" className="flex flex-wrap gap-2">{groups.map(g => <a key={g.id} href={`#${g.id}`} className="btn btn-sm btn-outline">{g.title}</a>)}</nav>
          {groups.map(g => <section key={g.id} id={g.id} aria-labelledby={`${g.id}-judul`} className="scroll-mt-24">
            <h2 id={`${g.id}-judul`} className="text-xl font-bold sm:text-2xl">{g.title}</h2>
            <ol className="mt-4 space-y-3">{g.steps.map(s => { n++; return <li key={s.title} className="flex gap-4 rounded-xl border border-base-300 bg-base-100 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success font-bold text-success-content" aria-hidden="true">{n}</span>
              <div className="min-w-0"><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-sm leading-6 text-base-content/80">{s.text}</p></div>
            </li>; })}</ol>
          </section>)}
          <section id="pertanyaan" aria-labelledby="pertanyaan-judul" className="scroll-mt-24">
            <h2 id="pertanyaan-judul" className="text-xl font-bold sm:text-2xl">Pertanyaan yang sering muncul</h2>
            <div className="mt-4 space-y-2">{faq.map(q => <details key={q.title} className="group rounded-xl border border-base-300 bg-base-100 p-4">
              <summary className="cursor-pointer font-semibold">{q.title}</summary><p className="mt-2 text-sm leading-6 text-base-content/80">{q.text}</p></details>)}</div>
          </section>
          <section aria-labelledby="bantuan" className="rounded-xl border-s-4 border-success bg-base-100 p-5">
            <h2 id="bantuan" className="font-bold">Masih ada kendala?</h2>
            <p className="mt-1 text-sm leading-6">Kirim pesan ke admin. Sebutkan username anak dan halaman yang bermasalah supaya cepat dibantu.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm gap-1"><MessageCircle className="size-4" aria-hidden="true" />Hubungi admin lewat WhatsApp</a>}
              <Link href="/masuk" className="btn btn-outline btn-sm">Masuk ke akun</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
