import {
  ArrowRight, BookOpenCheck, CalendarCheck, Check, ChevronDown, Hand, Lock, MessageCircle, ShieldCheck,
} from "lucide-react";
import { IconBook, IconBulb, IconCalendar, IconClipboard, IconCoins, IconFamily, IconHand, IconNotebook, IconReport } from "./LandingIcons";
import Link from "next/link";
import { BrandMark } from "@/components/home/BrandMark";
import { classes } from "@/components/home/home-data";
import { materials } from "@/data/materials";
import { accessUrl, offers, rupiah } from "@/lib/packages";
import { JenjangTabs, type Level } from "./JenjangTabs";
import { LandingDemo } from "./LandingDemo";

const LEVELS: { id: Level["id"]; name: string; from: number; to: number }[] = [{ id: "sd", name: "SD", from: 1, to: 6 }, { id: "smp", name: "SMP", from: 7, to: 9 }, { id: "sma", name: "SMA", from: 10, to: 12 }];
const levels: Level[] = LEVELS.map(l => ({ id: l.id, name: l.name, classes: classes.filter(c => c.id >= l.from && c.id <= l.to).map(c => ({ classId: c.id, slug: c.slug,
  chapters: materials.filter(m => m.classId === c.id).sort((a, b) => a.chapter - b.chapter).map(m => ({ title: m.title, slug: m.slug, chapter: m.chapter })) })).filter(c => c.chapters.length) }));
const totalChapters = materials.filter(m => m.classId >= 1 && m.classId <= 12).length;
const classCount = levels.reduce((s, l) => s + l.classes.length, 0);
const onSale = offers.filter(o => o.onSale);
const cheapest = Math.min(...onSale.map(o => o.price));
const buy = (name?: string) => accessUrl(name ? `Halo admin BeSmartKids, saya ingin membeli ${name}.` : undefined);
const shortName = (id: string) => ({ sd: "SD", smp: "SMP", sma: "SMA", semua: "Semua Kelas" })[id] ?? id;

/* Gaya bersama */
const wrap = "mx-auto w-full max-w-xl px-4";
const card = "rounded-2xl border-2 border-[#d4ebdf] bg-white";
const cta = "btn h-auto min-h-14 w-full rounded-2xl border-0 bg-[#ffd34f] text-base font-extrabold text-[#3f3210] shadow-[0_5px_0_#d9a91c] hover:bg-[#ffcb2b] active:translate-y-1 active:shadow-[0_1px_0_#d9a91c] motion-reduce:active:translate-y-0";
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="text-center text-[1.65rem] font-extrabold leading-tight text-[#17352a] sm:text-3xl">{children}</h2>;
const Sub = ({ children }: { children: React.ReactNode }) => <p className="mx-auto mt-2 max-w-md text-center text-[0.95rem] leading-6 text-[#4b5f57]">{children}</p>;

/** Warna latar kartu bergantian: mint, kuning, biru muda, peach. Teks tetap gelap agar kontras cukup. */
const TINTS = [
  { bg: "bg-[#e6f6ec]", bd: "border-[#b7e4c7]", dot: "bg-[#2b8a3e]" },
  { bg: "bg-[#fff6d6]", bd: "border-[#ffe08a]", dot: "bg-[#e67700]" },
  { bg: "bg-[#e7f3ff]", bd: "border-[#a5d8ff]", dot: "bg-[#1c7ed6]" },
  { bg: "bg-[#ffece2]", bd: "border-[#ffc9a9]", dot: "bg-[#e8590c]" },
];
const tint = (i: number) => TINTS[i % TINTS.length];
const tcard = (i: number) => `rounded-2xl border-2 ${tint(i).bg} ${tint(i).bd}`;
const PAINS = [
  { Icon: IconNotebook, title: "Contoh bisa, soal diubah langsung macet", text: "Angka atau ceritanya diganti sedikit, anak sudah bingung harus mulai dari mana." },
  { Icon: IconFamily, title: "Ingin membantu, tapi caranya sudah beda", text: "Sekarang sekolah memakai gambar, pola, dan cerita, bukan sekadar rumus." },
  { Icon: IconCoins, title: "Les tambahan menyita waktu dan biaya", text: "Biaya tiap bulan, antar-jemput, dan latihan berhenti saat les selesai." },
];
const STEPS = [
  { n: 1, title: "Benda", text: "Jeruk, kue, kelereng yang bisa digeser dan diketuk" },
  { n: 2, title: "Gambar", text: "Batang, garis bilangan, dan diagram yang bisa diubah" },
  { n: 3, title: "Angka", text: "Baru soal angka, plus pembahasan kalau salah" },
];
const FEATURES = [
  { Icon: IconHand, title: "Peraga interaktif", text: "Setiap bagian materi punya peraga yang bisa digeser, diketuk, dan diputar." },
  { Icon: IconNotebook, title: "Latihan tiap bagian", text: "Soal pendek setelah setiap bagian, langsung dinilai." },
  { Icon: IconClipboard, title: "Evaluasi 24 soal", text: "Setiap bab ditutup dengan soal bertingkat lengkap dengan skor." },
  { Icon: IconBulb, title: "Pembahasan jawaban", text: "Jawaban salah langsung diberi penjelasan cara mengerjakannya." },
  { Icon: IconCalendar, title: "Latihan harian", text: "7 soal hitungan yang berganti setiap hari, 3 tingkat." },
  { Icon: IconFamily, title: "Beberapa akun", text: "Kakak dan adik punya akun dan riwayat belajar sendiri." },
  { Icon: IconReport, title: "Laporan untuk orang tua", text: "Lihat bab yang sudah dikerjakan, skornya, dan kapan dikerjakan." },
];
const COMPARE: [string, string, string][] = [
  ["Biaya", "Bayar tiap bulan", `Sekali bayar, mulai ${rupiah(cheapest).replace(".000", "rb")}`],
  ["Waktu", "Ikut jadwal", "Kapan saja"],
  ["Latihan", "Sebatas jam les", "Bisa diulang terus"],
  ["Anak", "Per anak", "2–3 akun per paket"],
];
const FAQ: [string, string][] = [
  ["Untuk kelas berapa?", "Kelas 1 sampai 12 (SD, SMP, SMA). Bab Kelas 11 sedang disusun dan ditambahkan bertahap."],
  ["Perlu install aplikasi?", "Tidak. Cukup buka lewat browser di HP, tablet, atau laptop."],
  ["Bayar bulanan?", "Tidak. Sekali bayar, akses berlaku 12 bulan (24 bulan untuk paket Semua Kelas)."],
  ["Bisa untuk kakak dan adik?", "Bisa. Setiap paket berisi 2 akun, paket Semua Kelas berisi 3 akun. Satu akun bisa dipakai di dua perangkat."],
  ["Bagaimana cara mendapatkan akses?", "Setelah pembayaran diterima, admin mengirim username dan PIN lewat WhatsApp."],
  ["Bisa dicoba dulu?", "Bisa. Bab pertama setiap kelas dapat dibuka gratis tanpa akun."],
  ["Apakah ada videonya?", "Video sedang disiapkan bertahap. Materi, peraga, latihan, dan evaluasi sudah bisa dipakai sekarang."],
];

export function ParentLanding() {
  return <main data-theme="besmartkids" className="min-h-screen bg-[#eef7f2] text-[#17352a]">
    {/* Pembuka */}
    <section className="rounded-b-[2rem] bg-gradient-to-b from-[#1f8f6c] to-[#18785a] pb-8 pt-6 text-white">
      <div className={wrap}>
        <span className="inline-block rounded-xl bg-white px-2.5 py-1.5"><BrandMark /></span>
        <p className="mt-4 text-sm font-bold text-white/80">Matematika Kelas 1 sampai 12</p>
        <h1 className="mt-1 text-[2rem] font-extrabold leading-[1.15] sm:text-[2.4rem]">Anak bilang matematika itu susah? <span className="text-[#ffd34f]">Mulai dari yang bisa dilihat dan dicoba.</span></h1>
        <p className="mt-3 text-[0.98rem] leading-7 text-white/90">BeSmartKids membuat anak <strong>paham</strong>, bukan sekadar hafal: lihat bendanya, ubah gambarnya, baru kerjakan angkanya. Orang tua cukup menemani dan melihat laporannya.</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          {[[BookOpenCheck, `${totalChapters} bab`], [Hand, "Peraga interaktif"], [CalendarCheck, "Latihan harian"], [ShieldCheck, "Laporan orang tua"]].map(([I, t]) => { const Icon = I as typeof Check;
            return <li key={t as string} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Icon className="size-4" strokeWidth={2} aria-hidden="true" />{t as string}</li>; })}
        </ul>
        <a href="#paket" className={`${cta} mt-5`}>Lihat paket, mulai {rupiah(cheapest)}</a>
        <div className="relative mx-auto mt-8 w-full max-w-[18.5rem]">
          <p className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ffd34f] px-3 py-0.5 text-xs font-bold text-[#3f3210]">Coba langsung di sini</p>
          <div className="rounded-[2.2rem] border-[9px] border-[#17352a] bg-white shadow-2xl">
            <div className="min-h-[24rem]"><LandingDemo /></div>
          </div>
          <p className="mt-3 text-center text-xs text-white/80">Soal di atas bisa dijawab. Seperti inilah cara belajar di setiap bab.</p>
        </div>
      </div>
    </section>

    {/* Masalah */}
    <section className={`${wrap} pt-12`}>
      <H2>Sering begini di rumah?</H2>
      <Sub>Biasanya bukan karena anaknya kurang pintar, tetapi karena konsepnya belum pernah benar-benar ia lihat.</Sub>
      <div className="mt-6 space-y-3">
        {PAINS.map(({ Icon, title, text }, i) => <div key={title} className={`${tcard(i + 1)} flex items-start gap-3 p-4`}>
          <Icon className="size-11 shrink-0" />
          <div><h3 className="font-bold">{title}</h3><p className="mt-0.5 text-sm leading-6 text-[#4b5f57]">{text}</p></div>
        </div>)}
      </div>
    </section>

    {/* Metode */}
    <section className={`${wrap} pt-12`}>
      <p className="mx-auto w-fit rounded-full bg-[#d4ebdf] px-3 py-1 text-xs font-bold text-[#18785a]">Cara belajar bertahap</p>
      <div className="mt-3"><H2>Benda, gambar, lalu angka</H2></div>
      <Sub>Urutan ini dipakai di setiap bab. Isinya mengikuti buku siswa kurikulum sekolah.</Sub>
      <ol className="mt-6 grid grid-cols-3 gap-2.5">
        {STEPS.map((s, i) => <li key={s.n} className={`${tcard(i)} p-3 text-center`}>
          <span className={`mx-auto flex size-7 items-center justify-center rounded-full ${tint(i).dot} text-sm font-bold text-white`}>{s.n}</span>
          <h3 className="mt-2 font-bold">{s.title}</h3><p className="mt-0.5 text-xs leading-5 text-[#4b5f57]">{s.text}</p>
        </li>)}
      </ol>
      <dl className="mt-2.5 grid grid-cols-3 gap-2.5">
        {[[String(totalChapters), "bab interaktif"], [String(classCount), "kelas, 1 sampai 12"], ["24", "soal evaluasi per bab"]].map(([v, k], i) => <div key={k} className="rounded-2xl bg-[#18785a] p-3 text-center text-white">
          <dd className={`text-2xl font-extrabold ${["text-[#ffd34f]", "text-[#a5d8ff]", "text-[#ffc9a9]"][i]}`}>{v}</dd><dt className="text-xs text-white/85">{k}</dt></div>)}
      </dl>
    </section>

    {/* Isi */}
    <section className={`${wrap} pt-12`}>
      <H2>Isi BeSmartKids</H2>
      <Sub>Satu akun, dibuka di browser HP, tablet, atau laptop. Tanpa install.</Sub>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {FEATURES.map(({ Icon, title, text }, i) => <div key={title} className={`${tcard(i)} p-4 ${i === FEATURES.length - 1 ? "col-span-2" : ""}`}>
          <Icon className="size-11" />
          <h3 className="mt-2 font-bold leading-snug">{title}</h3><p className="mt-1 text-sm leading-5 text-[#4b5f57]">{text}</p>
        </div>)}
      </div>
      <div className={`${card} mt-2.5 p-4`}>
        <h3 className="flex items-center gap-2 font-bold"><IconBook className="size-8" />Bab yang sudah tersedia</h3>
        <div className="mt-3"><JenjangTabs levels={levels} /></div>
      </div>
    </section>

    {/* Perbandingan */}
    <section className={`${wrap} pt-12`}>
      <H2>Les atau BeSmartKids?</H2>
      <Sub>Bukan pengganti guru, tapi teman latihan harian di rumah.</Sub>
      <div className={`${card} mt-6 overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead><tr className="text-white"><th className="bg-[#495057] p-3" /><th className="bg-[#495057] p-3">Les</th><th className="bg-[#208f6d] p-3">BeSmartKids</th></tr></thead>
          <tbody>{COMPARE.map(([k, a, b]) => <tr key={k} className="border-t border-[#e3f1e9]"><th className="p-3 font-bold">{k}</th><td className="bg-[#f1f3f5] p-3 text-[#4b5f57]">{a}</td><td className="bg-[#e6f6ec] p-3 font-semibold"><span className="flex items-start gap-1.5"><Check className="mt-0.5 size-4 shrink-0 text-[#2b8a3e]" strokeWidth={3} aria-hidden="true" />{b}</span></td></tr>)}</tbody>
        </table>
      </div>
    </section>

    {/* Paket */}
    <section id="paket" className={`${wrap} scroll-mt-4 pt-12`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f8f6c] to-[#18785a] p-5 text-white shadow-lg">
        <span className="inline-block rounded-xl bg-white px-2 py-1 [&_img]:w-[130px]"><BrandMark /></span>
        <p className="mt-3 text-xl font-extrabold leading-snug">Satu akun untuk belajar matematika dari Kelas 1 sampai 12</p>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold">{["Peraga", "Latihan", "Evaluasi", "Laporan"].map(t => <li key={t} className="rounded-full bg-white/15 px-2.5 py-1">{t}</li>)}</ul>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-4 flex rotate-[-8deg] gap-1.5 opacity-90">
          {["½", "×", "π"].map(s => <span key={s} className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-3xl font-extrabold">{s}</span>)}
        </div>
      </div>
      <div className="mt-8"><H2>Pilih paket</H2></div>
      <Sub>Sekali bayar. Username dan PIN dikirim lewat WhatsApp setelah pembayaran diterima.</Sub>
      <div className="mt-6 space-y-4">
        {onSale.map((o, i) => { const best = o.classes === "all", band = ["bg-[#2b8a3e]", "bg-[#1c7ed6]", "bg-[#e8590c]", "bg-[#18785a]"][i % 4];
          return <div key={o.id} className={`relative overflow-hidden rounded-2xl border-2 bg-white ${best ? "border-[#208f6d] shadow-lg shadow-[#208f6d]/20" : "border-[#d4ebdf]"}`}>
            <div className={`${band} flex items-center justify-between gap-2 px-5 py-3 text-white`}><h3 className="text-lg font-extrabold">{o.name}</h3>
              {best && <span className="shrink-0 rounded-full bg-[#ffd34f] px-2.5 py-0.5 text-xs font-bold text-[#3f3210]">Paling hemat</span>}</div>
            <div className="p-5 pt-3">
            <p className="flex items-baseline gap-2"><span className="text-[2rem] font-extrabold text-[#17352a]">{rupiah(o.price)}</span><span className="text-sm text-[#4b5f57]">sekali bayar</span></p>
            <ul className="mt-3 space-y-2 text-sm">
              {[o.classes === "all" ? "Kelas 1 sampai 12" : `Kelas ${o.classes[0]} sampai ${o.classes[o.classes.length - 1]}`, `${o.accounts} akun anak, akses ${o.months} bulan`, "Semua bab, latihan, evaluasi, dan laporan"].map(t => <li key={t} className="flex gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-[#d4ebdf]"><Check className="size-3.5 text-[#18785a]" strokeWidth={3} aria-hidden="true" /></span>{t}</li>)}
            </ul>
            <a href={buy(o.name)} target="_blank" rel="noopener noreferrer" className={`${cta} mt-5`}>Pilih {shortName(o.id)}</a>
            </div>
          </div>; })}
      </div>
    </section>

    {/* Pertanyaan */}
    <section className={`${wrap} pt-12`}>
      <H2>Pertanyaan umum</H2>
      <div className="mt-6 space-y-2.5">
        {FAQ.map(([qq, a], i) => <details key={qq} className={`${tcard(i)} group px-4 py-3`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">{qq}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
          <p className="mt-2 text-sm leading-6 text-[#4b5f57]">{a}</p>
        </details>)}
      </div>
    </section>

    {/* Cara pesan */}
    <section className="mt-12 rounded-t-[2rem] bg-[#18785a] pb-28 pt-10 text-white">
      <div className={wrap}>
        <h2 className="text-center text-[1.65rem] font-extrabold leading-tight sm:text-3xl">Cara pesan</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-[0.95rem] leading-6 text-white/85">Pembayaran diproses lewat halaman pembayaran BeSmartKids. Akses dikirim setelah pembayaran diterima.</p>
        <ol className="mt-6 space-y-2.5 text-[#17352a]">
          {[["Pilih paket", "SD, SMP, SMA, atau Semua Kelas."], ["Selesaikan pembayaran", "Tulis nama anak dan nomor WhatsApp orang tua."], ["Terima username dan PIN", "Dikirim admin lewat WhatsApp, lalu anak bisa langsung masuk."]].map(([t, d], i) => <li key={t} className={`${tcard(i + 1)} flex gap-3 p-4`}>
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${tint(i + 1).dot} text-sm font-bold text-white`}>{i + 1}</span><div><p className="font-bold">{t}</p><p className="text-sm text-[#4b5f57]">{d}</p></div></li>)}
        </ol>
        <a href={buy()} target="_blank" rel="noopener noreferrer" className={`${cta} mt-5 gap-2`}>Pesan sekarang<ArrowRight className="size-5" aria-hidden="true" /></a>
        <p className="mt-4 text-center text-xs text-white/85"><Lock className="me-1 inline size-3.5 align-[-2px]" aria-hidden="true" />Belum yakin? Bab pertama setiap kelas bisa <Link href="/#kelas" className="link font-semibold">dicoba gratis</Link>.</p>
        <a href={accessUrl("Halo admin BeSmartKids, saya ingin bertanya tentang paket belajar.")} target="_blank" rel="noopener noreferrer" className="btn btn-sm mx-auto mt-3 flex w-fit gap-1.5 border-white/40 bg-white/10 text-white hover:bg-white/20"><MessageCircle className="size-4" aria-hidden="true" />Tanya admin</a>
        <p className="mt-8 text-center text-xs text-white/75">© BeSmartKids. <Link href="/" className="link">Beranda</Link> <span aria-hidden="true">|</span> <Link href="/syarat-layanan" className="link">Syarat layanan</Link> <span aria-hidden="true">|</span> <Link href="/kebijakan-privasi" className="link">Kebijakan privasi</Link></p>
      </div>
    </section>

    {/* Bar beli */}
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d4ebdf] bg-white/95 backdrop-blur print:hidden">
      <div className={`${wrap} flex items-center gap-3 py-2.5`}>
        <div className="leading-tight"><p className="text-xs text-[#4b5f57]">Mulai dari</p><p className="text-lg font-extrabold text-[#208f6d]">{rupiah(cheapest)}</p></div>
        <a href="#paket" className={`${cta} min-h-12 flex-1`}>Pilih paket</a>
      </div>
    </div>
  </main>;
}
