"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Hand } from "lucide-react";
import { SaveResult } from "@/components/auth/SaveResult";
import { BrandMark } from "@/components/home/BrandMark";
import JarimatikaLab, { JarimatikaPractice } from "./JarimatikaLab";
import { correctAnswer, dailyQuestions, LEVELS, questionLabel, readPractice, storageKey, wibDate, type Level, type SavedPractice } from "@/lib/daily-jarimatika";
import "./DailyMastering.css";

const s = (k: string) => `bsk-daily-${k}`;
const empty = (date: string): SavedPractice => ({ date, answers: Array(7).fill(""), checked: false });
const firstPair: Record<Level, [number, number]> = { 1: [7, 8], 2: [9, 4], 3: [4, 6] };

const noop = () => () => {};
const subscribeDay = (cb: () => void) => { const t = setInterval(cb, 1000); window.addEventListener("focus", cb); document.addEventListener("visibilitychange", cb); return () => { clearInterval(t); window.removeEventListener("focus", cb); document.removeEventListener("visibilitychange", cb); }; };
function loadSave(level: Level): { save: SavedPractice; stored: boolean } {
  const day = wibDate();
  try { const v = readPractice(localStorage.getItem(storageKey(level))); return { save: v && (v.date === day || v.answers.some(Boolean)) ? v : empty(day), stored: true }; }
  catch { return { save: empty(day), stored: false }; }
}

/** Mastering Jarimatika: peraga tangan, lalu tujuh soal harian per level (paket baru setiap 00.00 WIB). */
export default function JarimatikaMastering({ level }: { level: Level }) {
  // Lembar soal dibuat setelah halaman berjalan di browser, karena jawaban tersimpan di perangkat.
  const ready = useSyncExternalStore(noop, () => true, () => false);
  return ready ? <Sheet key={level} level={level} /> : <Sheet level={level} loading />;
}
function Sheet({ level, loading = false }: { level: Level; loading?: boolean }) {
  const [pair, setPair] = useState<[number, number]>(firstPair[level]);
  const [init] = useState(() => (loading ? null : loadSave(level)));
  const [practice, setPractice] = useState<SavedPractice | null>(init?.save ?? null);
  const storageAvailable = init?.stored ?? true;
  const today = useSyncExternalStore(subscribeDay, wibDate, () => "");
  const [hint, setHint] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (!practice) return; try { localStorage.setItem(storageKey(level), JSON.stringify(practice)); } catch { /* penyimpanan tidak tersedia */ } }, [practice, level]);
  const info = LEVELS[level - 1];
  const questions = practice ? dailyQuestions(practice.date, level) : [];
  const filled = practice?.answers.filter(Boolean).length ?? 0;
  const correct = practice ? questions.filter((q, i) => correctAnswer(practice.answers[i], q.answer)).length : 0;
  const dateText = practice ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(practice.date + "T00:00:00+07:00")) : "";
  const startToday = () => { setPractice(empty(wibDate())); setHint(null); setNotice("Paket hari ini siap. Selamat berlatih!"); };
  return <main className={s("page")} data-theme="besmartkids">
    <header className={s("header")}><Link href="/" aria-label="Beranda BeSmartKids"><BrandMark /></Link><Link href="/" className={`${s("back")} inline-flex items-center gap-1`}><ArrowLeft className="size-3.5" aria-hidden="true" />Beranda</Link></header>
    <div className={s("content")}>
      <section className={s("intro")}><h1>Mastering <span>Jarimatika</span></h1><p>Kalikan bilangan 1 sampai 10 dengan jari. Peragakan dulu, lalu kerjakan tujuh soal yang berganti setiap hari.</p></section>
      <nav className={s("levels")} aria-label="Pilih level latihan">{LEVELS.map(l => <Link key={l.id} href={`/mastering-jarimatika/level-${l.id}`} aria-current={l.id === level ? "page" : undefined} className={l.id === level ? s("activeLevel") : ""}><Hand className="size-5" strokeWidth={1.7} aria-hidden="true" /><span><strong>Level {l.id}</strong><small>{l.name}</small></span></Link>)}</nav>
      <div className="mx-auto mb-8 max-w-3xl"><JarimatikaLab key={`${pair[0]}x${pair[1]}`} a={pair[0]} b={pair[1]} setPair={(a, b) => setPair([a, b])} /></div>
      <div className={s("workspace")}>
        <aside className={s("side")}><div className={s("levelBadge")}><Hand className="size-4" strokeWidth={1.7} aria-hidden="true" />Level {level}: {info.name}</div><h2>Jari bantu,<br />otak ingat.</h2><p>{info.description} {info.detail}</p><p className={s("dailyNote")}>Paket baru setiap 00.00 WIB. Soal tetap sama sepanjang hari.</p></aside>
        <section className={s("paper")} aria-label="Lembar latihan harian">
          <div className={s("paperTop")}><div><p className={s("kicker")}>{practice && practice.date !== today ? "Paket sebelumnya" : "Latihan hari ini"}</p><h2>{dateText || "Menyiapkan latihan…"}</h2></div><span className={s("seven")}>7 soal</span></div>
          {practice && practice.date !== today && <div className={s("newDay")} role="status"><strong>Paket hari baru sudah tersedia.</strong><p>Jawaban paket ini tetap tersimpan. Beralih akan membuka lembar baru untuk level ini.</p><button type="button" onClick={startToday}>Mulai paket hari ini</button></div>}
          {!storageAvailable && <p className={s("warning")} role="status">Penyimpanan perangkat tidak tersedia. Jawaban tetap bisa diperiksa, tetapi tidak tersimpan setelah halaman ditutup.</p>}
          {practice ? <form onSubmit={e => { e.preventDefault(); if (filled === 7) { setPractice({ ...practice, checked: true }); setNotice(""); } }}>
            <div className={s("progressLabel")}><span>Isi kotak yang kosong</span><span>{filled}/7 terisi</span></div><progress className={s("progress")} value={filled} max={7} aria-label="Soal terisi" />
            <ol className={s("rows")}>{questions.map((q, i) => {
              const good = correctAnswer(practice.answers[i], q.answer), reviewed = practice.checked, [a, b] = q.fact;
              return <li className={s("row")} key={`${practice.date}-${i}`} data-testid={`question-${i}`}><span className={s("number")}>{String(i + 1).padStart(2, "0")}</span><div className={s("rowBody")}><div className={s("equation")}>
                {[q.left, q.right, q.result].map((value, j) => <span key={j} className={s("term")}>{j > 0 && <span aria-hidden="true" className={s("operator")}>{j === 1 ? "×" : "="}</span>}{q.blank === j ? <input aria-label={`Jawaban soal ${i + 1}: ${questionLabel(q)}`} aria-invalid={reviewed && !good} className={`${s("answer")} ${reviewed ? (good ? s("good") : s("wrong")) : ""}`} type="text" inputMode="numeric" pattern="[0-9]{1,3}" maxLength={3} autoComplete="off" required value={practice.answers[i]} onChange={e => { const v = e.target.value; if (!/^\d{0,3}$/.test(v)) return; setPractice({ ...practice, answers: practice.answers.map((x, k) => (k === i ? v : x)), checked: false }); setNotice(""); }} /> : <span className={s("given")}>{value}</span>}</span>)}
              </div>
                <div className={s("feedback")}>{reviewed && (good ? <span>Tepat!</span> : <span>Coba lagi</span>)}<button type="button" onClick={() => setHint(hint === i ? null : i)} aria-expanded={hint === i}>{hint === i ? "Tutup peraga" : "Tampilkan peraga"}</button></div>
                {hint === i && <div className="mt-2"><JarimatikaPractice a={a} b={b} blank={q.blank} /></div>}
              </div></li>;
            })}</ol>
            {practice.checked && <div className={s("result")} role="status"><strong>{correct === 7 ? "Hebat, lengkap dan tepat!" : "Bagus, lanjutkan usahamu!"}</strong><p>Benar {correct}, perlu diperbaiki {7 - correct}, skor {Math.round((correct / 7) * 100)}/100</p><SaveResult kind="harian" part={`Level ${level}, ${dateText}`} correct={correct} total={7} title="Mastering Jarimatika" once={`jarimatika-${level}-${practice.date}`} />{correct < 7 && <small>Ubah jawaban yang belum tepat, lalu periksa kembali. Ketuk Tampilkan peraga untuk mencoba dengan jari.</small>}</div>}
            <button type="submit" className={s("check")} disabled={filled < 7}>Periksa jawaban <ArrowRight className="size-4" aria-hidden="true" /></button>
            <div className={s("bottom")}><span>{filled < 7 ? "Lengkapi 7 jawaban untuk memeriksa." : storageAvailable ? "Jawaban tersimpan di perangkat ini." : "Siap diperiksa."}</span>{practice.checked && <button type="button" onClick={() => { setPractice(empty(practice.date)); setHint(null); setNotice("Jawaban dikosongkan. Soal hari ini tetap sama."); }}>Ulangi paket ini</button>}</div>
          </form> : <p role="status" className={s("loading")}>Menyiapkan tujuh soal untukmu…</p>}
          {notice && <p role="status" className={s("notice")}>{notice}</p>}
        </section>
      </div>
      <footer className={s("footer")}><Link href="/mastering-perkalian-pembagian/level-1" className="inline-flex items-center gap-1">Latihan perkalian dan pembagian<ArrowRight className="size-3" aria-hidden="true" /></Link><br />BeSmartKids. Belajar sedikit demi sedikit, paham lebih lama.</footer>
    </div>
  </main>;
}
