import { ArrowRight, BookOpenCheck, CalendarCheck, Check, ChevronDown, Clock, Hand, ListChecks, MessageCircle, MonitorSmartphone, NotebookPen, ShieldCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { classes } from "@/components/home/home-data";
import { materials } from "@/data/materials";
import { accessUrl, offers, rupiah } from "@/lib/packages";
import { JenjangTabs, type Level } from "./JenjangTabs";
import { LandingDemo } from "./LandingDemo";

const LEVELS: { id: Level["id"]; name: string; from: number; to: number }[] = [{ id: "sd", name: "SD", from: 1, to: 6 }, { id: "smp", name: "SMP", from: 7, to: 9 }, { id: "sma", name: "SMA", from: 10, to: 12 }];
const levels: Level[] = LEVELS.map(l => ({ id: l.id, name: l.name, classes: classes.filter(c => c.id >= l.from && c.id <= l.to).map(c => ({ classId: c.id, slug: c.slug,
  chapters: materials.filter(m => m.classId === c.id).sort((a, b) => a.chapter - b.chapter).map(m => ({ title: m.title, slug: m.slug, chapter: m.chapter })) })).filter(c => c.chapters.length) }));
const totalChapters = materials.filter(m => m.classId >= 1 && m.classId <= 12).length;
const onSale = offers.filter(o => o.onSale);
const cheapest = Math.min(...onSale.map(o => o.price));
const buy = (name?: string) => accessUrl(name ? `Halo admin BeSmartKids, saya ingin membeli ${name}.` : undefined);
const classRange = (c: number[] | "all") => (c === "all" ? "Kelas 1 sampai 12" : `Kelas ${c[0]} sampai ${c[c.length - 1]}`);

const PAINS = [
  { Icon: NotebookPen, title: "Hafal cara, bingung saat soalnya diubah", text: "Anak bisa mengerjakan contoh di buku, tetapi macet begitu angka atau ceritanya diganti. Biasanya konsep di baliknya belum benar-benar terlihat." },
  { Icon: Users, title: "Orang tua ingin membantu, tapi caranya sudah berbeda", text: "Cara mengajar sekarang memakai gambar, pola, dan cerita. Menjelaskan dengan cara kita dulu sering malah membuat anak tambah bingung." },
  { Icon: Clock, title: "Les tambahan menyita waktu dan biaya", text: "Jadwal antar-jemput, biaya bulanan, dan latihan yang berhenti saat jam les selesai." },
];
const STEPS = [
  { n: "1", title: "Lihat dan coba sendiri", text: "Setiap bagian materi punya peraga yang bisa digeser, diketuk, dan diputar. Anak melihat kenapa sebuah cara berhasil, bukan hanya langkahnya." },
  { n: "2", title: "Latihan pendek dengan pembahasan", text: "Setelah satu bagian, anak mengerjakan latihan singkat. Jawaban yang salah langsung diberi penjelasan." },
  { n: "3", title: "Evaluasi 24 soal per bab", text: "Soal bertingkat dari sedang sampai sangat menantang, lengkap dengan skor dan pembahasan jawaban yang salah." },
];
const COMPARE: [string, string, string][] = [
  ["Biaya", "Dibayar setiap bulan", `Sekali bayar, mulai ${rupiah(cheapest)}`],
  ["Waktu", "Mengikuti jadwal les", "Kapan saja, di rumah"],
  ["Latihan", "Selama jam les", "Bisa diulang sesering yang dibutuhkan"],
  ["Untuk berapa anak", "Dihitung per anak", "2 akun per paket, 3 akun untuk paket semua kelas"],
];
const FAQ: [string, string][] = [
  ["Untuk kelas berapa saja?", "Kelas 1 sampai 12 (SD, SMP, dan SMA). Bab Kelas 11 sedang disusun dan akan ditambahkan bertahap."],
  ["Perlu memasang aplikasi?", "Tidak. BeSmartKids dibuka lewat browser di HP, tablet, atau laptop."],
  ["Apakah bayar setiap bulan?", "Tidak. Sekali bayar sesuai paket, akses berlaku 12 bulan (24 bulan untuk paket semua kelas)."],
  ["Bisa untuk kakak dan adik?", "Bisa. Setiap paket berisi 2 akun, dan paket semua kelas berisi 3 akun. Setiap akun punya riwayat belajarnya sendiri dan bisa dipakai di paling banyak dua perangkat."],
  ["Bagaimana cara mendapatkan akses?", "Pilih paket lalu selesaikan pembayaran. Setelah pembayaran diterima, admin mengirim username dan PIN lewat WhatsApp."],
  ["Bisa dicoba dulu?", "Bisa. Bab pertama setiap kelas dapat dibuka gratis tanpa akun."],
  ["Apakah ada videonya?", "Video pembelajaran sedang disiapkan bertahap. Materi, peraga, latihan, dan evaluasi di setiap bab sudah bisa dipakai sekarang."],
];

export function ParentLanding() {
  return <>
    {/* Pembuka */}
    <section className="relative overflow-hidden bg-success text-success-content">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-extrabold leading-tight sm:text-5xl">Anak bilang matematika itu susah? Mulai dari yang bisa dilihat dan dicoba.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">BeSmartKids membantu anak Kelas 1 sampai 12 memahami matematika lewat peraga yang bisa digeser dan diketuk, lalu latihan bertahap dengan pembahasan. Orang tua cukup menemani dan melihat laporan belajarnya.</p>
          <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
            {[`${totalChapters} bab interaktif`, "Kelas 1 sampai 12", "Latihan harian 7 soal", "Laporan untuk orang tua"].map(t => <li key={t} className="rounded-full bg-white/15 px-3 py-1">{t}</li>)}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#paket" className="btn btn-warning btn-lg shadow-lg shadow-black/10">Lihat paket, mulai {rupiah(cheapest)}</a>
            <Link href="/#kelas" className="btn btn-ghost btn-lg border-white/40 text-white hover:bg-white/10">Coba bab gratis</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[19rem]">
          <p className="mb-3 text-center text-sm font-semibold text-white/90"><Hand className="me-1 inline size-4" aria-hidden="true" />Coba tiga soal di sini</p>
          <div className="rounded-[2.2rem] border-[10px] border-neutral bg-base-100 shadow-2xl">
            <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-neutral/80" aria-hidden="true" />
            <div className="min-h-[25rem]"><LandingDemo /></div>
          </div>
        </div>
      </div>
    </section>

    {/* Masalah */}
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <h2 className="text-2xl font-extrabold sm:text-4xl">Sering terjadi di rumah?</h2>
      <p className="mt-2 max-w-2xl text-base-content/70">Biasanya bukan karena anak kurang pintar, tetapi karena konsepnya belum pernah benar-benar ia lihat.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {PAINS.map(({ Icon, title, text }) => <div key={title} className="border-t-2 border-base-300 pt-4">
          <Icon className="size-6 text-success" strokeWidth={1.75} aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-base-content/70">{text}</p>
        </div>)}
      </div>
    </section>

    {/* Cara belajar */}
    <section className="bg-base-200">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Benda, gambar, lalu angka</h2>
        <p className="mt-2 max-w-2xl text-base-content/70">Setiap bab disusun dari hal yang bisa dilihat dulu, baru simbol dan rumus. Isinya mengikuti buku siswa kurikulum yang dipakai di sekolah.</p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map(s => <li key={s.n} className="rounded-2xl bg-base-100 p-5">
            <span className="text-3xl font-extrabold text-success">{s.n}</span>
            <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
            <p className="mt-1 text-sm leading-6 text-base-content/70">{s.text}</p>
          </li>)}
        </ol>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-success/30 bg-base-100 p-5 sm:flex-row sm:items-center">
          <CalendarCheck className="size-7 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-sm leading-6"><strong>Latihan harian.</strong> Tujuh soal penjumlahan, pengurangan, perkalian, dan pembagian yang berganti setiap hari, dengan tiga tingkat kesulitan. Cukup 10 menit untuk menjaga hitungan tetap lancar.</p>
        </div>
      </div>
    </section>

    {/* Isi per jenjang */}
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <h2 className="text-2xl font-extrabold sm:text-4xl">Isi BeSmartKids</h2>
      <p className="mt-2 max-w-2xl text-base-content/70">{totalChapters} bab yang sudah bisa dipakai sekarang. Dibuka di browser HP, tablet, atau laptop, tanpa memasang aplikasi.</p>
      <div className="mt-6"><JenjangTabs levels={levels} /></div>
      <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        {[[BookOpenCheck, "Peraga interaktif di setiap bagian materi"], [ListChecks, "Latihan per bagian dan evaluasi 24 soal per bab"], [MonitorSmartphone, "Satu akun bisa dipakai di dua perangkat"], [ShieldCheck, "Laporan belajar untuk orang tua: bab, skor, dan waktunya"]].map(([Icon, t]) => {
          const I = Icon as typeof Check; return <li key={t as string} className="flex items-start gap-2"><I className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" /><span>{t as string}</span></li>; })}
      </ul>
    </section>

    {/* Perbandingan */}
    <section className="bg-base-200">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Les atau BeSmartKids?</h2>
        <p className="mt-2 text-base-content/70">Bukan pengganti guru di sekolah, tetapi teman latihan yang selalu ada di rumah.</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-base-200/60"><th className="p-3" /><th className="p-3">Les</th><th className="bg-warning/25 p-3 text-success">BeSmartKids</th></tr></thead>
            <tbody>{COMPARE.map(([k, a, b]) => <tr key={k} className="border-t border-base-300"><th className="p-3 font-semibold">{k}</th><td className="p-3 text-base-content/70">{a}</td><td className="bg-warning/10 p-3 font-semibold">{b}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>

    {/* Paket */}
    <section id="paket" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14 sm:px-8 sm:py-20">
      <h2 className="text-2xl font-extrabold sm:text-4xl">Pilih paket</h2>
      <p className="mt-2 max-w-2xl text-base-content/70">Sekali bayar. Setelah pembayaran diterima, username dan PIN dikirim lewat WhatsApp.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {onSale.map(o => { const best = o.classes === "all";
          return <div key={o.id} className={`relative flex flex-col rounded-2xl border-2 bg-base-100 p-5 ${best ? "border-success shadow-xl shadow-success/10" : "border-base-300"}`}>
            {best && <p className="absolute -top-3 left-5 rounded-full bg-warning px-3 py-0.5 text-xs font-bold text-warning-content">Paling hemat</p>}
            <h3 className="text-lg font-extrabold">{o.name}</h3>
            <p className="mt-2 text-3xl font-extrabold text-success">{rupiah(o.price)}</p>
            <p className="text-sm text-base-content/60">sekali bayar</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[classRange(o.classes), `${o.accounts} akun anak`, `Akses ${o.months} bulan`, "Semua bab, latihan, dan evaluasi", "Laporan belajar untuk orang tua"].map(t => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />{t}</li>)}
            </ul>
            <a href={buy(o.name)} target="_blank" rel="noopener noreferrer" className={`btn mt-5 ${best ? "btn-warning" : "btn-success"}`}>Pilih {o.short.split(" ")[0] === "Semua" ? "Semua Kelas" : o.short.split(" ")[0]}</a>
          </div>; })}
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-base-content/70"><Wallet className="size-4 shrink-0" aria-hidden="true" />Masih ragu? Bab pertama setiap kelas bisa dicoba gratis tanpa akun. <Link href="/#kelas" className="link link-success">Buka kelas</Link></p>
    </section>

    {/* Pertanyaan */}
    <section className="bg-base-200">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-4xl">Pertanyaan yang sering diajukan</h2>
        <div className="mt-6 space-y-2">
          {FAQ.map(([qq, a]) => <details key={qq} className="group rounded-xl bg-base-100 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">{qq}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
            <p className="mt-2 text-sm leading-6 text-base-content/75">{a}</p>
          </details>)}
        </div>
        <a href={accessUrl("Halo admin BeSmartKids, saya ingin bertanya tentang paket belajar.")} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-success mt-6 gap-2"><MessageCircle className="size-4" aria-hidden="true" />Tanya admin</a>
      </div>
    </section>

    {/* Penutup */}
    <section className="bg-neutral text-neutral-content">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div><h2 className="text-2xl font-extrabold sm:text-3xl">Mulai dari satu bab hari ini.</h2><p className="mt-1 text-sm text-neutral-content/75">Coba bab gratis dulu, lalu pilih paket saat anak sudah merasa cocok.</p></div>
        <a href="#paket" className="btn btn-warning gap-1">Lihat paket<ArrowRight className="size-4" aria-hidden="true" /></a>
      </div>
    </section>

    {/* Bar bawah di HP */}
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-base-300 bg-base-100/95 px-4 py-2.5 shadow-[0_-6px_20px_-12px_rgb(23_53_42/0.4)] backdrop-blur md:hidden print:hidden">
      <div className="leading-tight"><p className="text-xs text-base-content/60">Mulai dari</p><p className="text-lg font-extrabold text-success">{rupiah(cheapest)}</p></div>
      <a href="#paket" className="btn btn-warning flex-1">Pilih paket</a>
    </div>
    <div className="h-16 md:hidden" aria-hidden="true" />
  </>;
}
