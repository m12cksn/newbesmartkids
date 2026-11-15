"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Bag, Card, CardGrid, DiceTable, M, plainMath, RoundTable, SceneView, Slots, Tiles, Tree, Venn } from "./GradeTwelveProbabilityArt";
import {
  arrangements, assessment, C, cardEvents, cells, correct, DECK, fact, formatAnswer, idn, labWords, letterCounts, P, practice, ready, sections, SEP, simp,
  splitParts, topics, vennSets, type Part, type PQuestion,
} from "@/data/grade-twelve-probability";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - 1 < min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-7 text-center text-base font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + 1 > max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div className="space-y-1"><p className="text-xs font-semibold">{label}</p><div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div></div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const fracStr = (p: number, q: number) => { const [a, b] = simp(p, q); return b === 1 ? String(a) : `${a}/${b}`; };
const fracM = (p: number, q: number) => { const [a, b] = simp(p, q); return b === 1 ? String(a) : `{${a}/${b}}`; };
function perms<T>(xs: T[], r: number): T[][] { if (r === 0) return [[]]; return xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)], r - 1).map(p => [x, ...p])); }

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const EVENTS = Object.keys(cardEvents);
const MODES = ["atau", "lalu (tanpa dikembalikan)"] as const;
function AturanLab() {
  const [a, setA] = useState("Ace"); const [b, setB] = useState("Queen"); const [mode, setMode] = useState<(typeof MODES)[number]>("atau");
  const A = DECK.filter(cardEvents[a]), B = DECK.filter(cardEvents[b]), both = A.filter(c => B.includes(c));
  const count = mode === "atau" ? A.length + B.length - both.length : A.reduce((s, x) => s + B.filter(y => y !== x).length, 0);
  return <div className="space-y-3">
    <Radios label="Kegiatan 1" options={EVENTS} value={a} set={setA} />
    <Radios label="Kegiatan 2" options={EVENTS} value={b} set={setB} />
    <Radios label="Cara menggabungkan" options={MODES} value={mode} set={setMode} />
    <CardGrid cards={DECK} marksOf={c => (A.includes(c) && B.includes(c) ? "ab" : A.includes(c) ? "a" : B.includes(c) ? "b" : undefined)} caption="Hijau: kegiatan 1. Biru: kegiatan 2. Kuning: memenuhi keduanya." />
    <Result value={`${a}|${b}|${mode === "atau" ? "atau" : "lalu"}|${count}`}>{mode === "atau"
      ? `${a} (${A.length}) atau ${b} (${B.length}): ${both.length ? `tidak saling lepas, ${A.length} + ${B.length} − ${both.length}` : `saling lepas, ${A.length} + ${B.length}`} = ${count} cara.`
      : `${a} lalu ${b}: ${both.length ? `${A.length} × ${B.length} = ${A.length * B.length}, dikurangi ${both.length} pasangan yang memakai kartu yang sama, jadi ${count}` : `${A.length} × ${B.length} = ${count}`} cara.`}</Result>
  </div>;
}

const ACE_SET = ["A♣", "A♠", "A♥", "A♦", "K♥"];
function SusunLab() {
  const [n, setN] = useState(4); const [r, setR] = useState(2); const [mode, setMode] = useState<"Menyusun" | "Mengambil">("Menyusun");
  const cards = ACE_SET.slice(0, n), all = perms(cards, r), list = mode === "Menyusun" ? all : all.filter(p => p.every((c, i) => i === 0 || cards.indexOf(p[i - 1]) < cards.indexOf(c)));
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Banyak kartu" value={n} set={v => { setN(v); setR(Math.min(r, v)); }} min={2} max={5} /><Stepper label="Banyak dipilih" value={r} set={setR} min={1} max={n} /></div>
    <Radios label="Kegiatan" options={["Menyusun", "Mengambil"] as const} value={mode} set={setMode} />
    <div className="flex flex-wrap justify-center gap-1.5">{cards.map(c => <Card key={c} card={c} />)}</div>
    <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto rounded-xl bg-base-100 p-2 text-sm">{list.slice(0, 60).map(p => <span key={p.join()} className="rounded-md bg-base-200 px-1.5 py-0.5 font-semibold">{p.join(" ")}</span>)}{list.length > 60 && <span className="text-xs">… dan seterusnya</span>}</div>
    <Result value={`${n}|${r}|${mode}|${list.length}`}><M text={mode === "Menyusun" ? `Menyusun ${r} dari ${n} kartu: ${list.length} susunan, P(${n}, ${r}) = ${P(n, r)}.` : `Mengambil ${r} dari ${n} kartu: ${list.length} cara, C(${n}, ${r}) = ${C(n, r)}. Setiap pengambilan muncul ${fact(r)} kali sebagai susunan.`} /></Result>
  </div>;
}

function PermutasiLab() {
  const [n, setN] = useState(5); const [r, setR] = useState(3);
  const boxes = Array.from({ length: r }, (_, i) => n - i), value = P(n, r);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Banyak unsur" value={n} set={setN} min={1} max={10} /><Stepper label="Banyak kotak" value={r} set={setR} min={1} max={10} /></div>
    <Slots values={boxes.map(b => (b > 0 ? String(b) : "0"))} caption="Banyak pilihan untuk setiap kotak" />
    <p className="text-center text-sm"><M text={r > n ? `Kotak lebih banyak dari unsur, jadi P(${n}, ${r}) = 0.` : `P(${n}, ${r}) = ${boxes.join(" × ")} = {${n}!/${n - r}!} = ${idn(value)}`} /></p>
    <Result value={`${n}|${r}|${value}`}><M text={r > n ? "Tidak ada susunan." : `Ada ${idn(value)} susunan ${r} unsur dari ${n} unsur.`} /></Result>
  </div>;
}

const CLUBS = ["2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣"];
function KombinasiLab() {
  const [n, setN] = useState(5); const [sel, setSel] = useState(["2♣", "3♣", "4♣"]);
  const cards = CLUBS.slice(0, n), chosen = sel.filter(c => cards.includes(c)), r = chosen.length, orders = perms(chosen, r);
  const toggle = (c: string) => setSel(s => (s.includes(c) ? s.filter(x => x !== c) : [...s, c].sort((x, y) => CLUBS.indexOf(x) - CLUBS.indexOf(y))));
  return <div className="space-y-3">
    <Stepper label="Banyak kartu" value={n} set={setN} min={3} max={7} />
    <div className="flex flex-wrap justify-center gap-1.5">{cards.map(c => <button key={c} type="button" aria-label={`Pilih ${c}`} aria-pressed={chosen.includes(c)} onClick={() => toggle(c)} className={`rounded-lg p-0.5 ${chosen.includes(c) ? "bg-success/30 ring-2 ring-success" : ""}`}><Card card={c} /></button>)}</div>
    <Pair>
      <div className="text-sm"><p className="font-semibold">Urutan dari kartu yang dipilih ({r}! = {fact(r)}):</p>
        <div className="mt-1 flex max-h-40 flex-wrap gap-1 overflow-y-auto">{r ? orders.slice(0, 24).map(o => <span key={o.join()} className="rounded bg-base-200 px-1 font-semibold">{o.join(" ")}</span>) : <span>Belum ada kartu dipilih.</span>}</div></div>
      <ul className="space-y-1 text-sm leading-7"><li><M text={`P(${n}, ${r}) = ${P(n, r)} susunan`} /></li><li>Setiap pilihan muncul {fact(r)} kali sebagai susunan.</li><li><M text={`C(${n}, ${r}) = {${P(n, r)}/${fact(r)}} = ${C(n, r)}`} /></li></ul>
    </Pair>
    <Result value={`${n}|${chosen.join(",")}|${C(n, r)}`}>{r ? `Pilihanmu salah satu dari ${C(n, r)} cara mengambil ${r} kartu dari ${n} kartu.` : "Ketuk kartu untuk memilih."}</Result>
  </div>;
}

function UnsurLab() {
  const [w, setW] = useState(labWords[0]); const counts = letterCounts(w), total = arrangements(w);
  return <div className="space-y-3">
    <Radios label="Kata" options={labWords} value={w} set={setW} />
    <Tiles text={w} caption="Huruf yang sama diberi warna yang sama" />
    <table className="mx-auto border-collapse bg-white text-sm"><thead><tr><th className="border border-base-300 px-2">Huruf</th>{counts.map(([c]) => <th key={c} className="border border-base-300 px-2">{c}</th>)}</tr></thead>
      <tbody><tr><th className="border border-base-300 px-2">Banyak</th>{counts.map(([c, k]) => <td key={c} className="border border-base-300 px-2 text-center">{k}</td>)}</tr></tbody></table>
    <p className="text-center text-sm"><M text={`{${w.length}!/(${counts.filter(([, k]) => k > 1).map(([, k]) => `${k}!`).join(" ") || "1"})} = {${idn(fact(w.length))}/${idn(fact(w.length) / total)}} = ${idn(total)}`} /></p>
    <Result value={`${w}|${total}`}>{`Kata ${w} punya ${w.length} huruf dan dapat disusun menjadi ${idn(total)} susunan berbeda.`}</Result>
  </div>;
}

const NAMES = ["Ani", "Budi", "Cici", "Dodi", "Eka", "Fani", "Gita"];
function SiklisLab() {
  const [n, setN] = useState(4); const [rot, setRot] = useState(0);
  const people = NAMES.slice(0, n), k = rot % n, seats = people.map((_, i) => people[(i - k + n) % n]);
  const rows = people.map((_, s) => people.map((__, i) => people[(s + i) % n]).join(", "));
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3"><Stepper label="Banyak orang" value={n} set={setN} min={3} max={7} />
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => setRot(rot + 1)}><RotateCw className="size-4" aria-hidden="true" />Putar satu kursi</button></div>
    <Pair>
      <RoundTable labels={seats} caption={`Dibaca dari kursi atas: ${seats.join(", ")}`} />
      <div className="text-sm"><p className="font-semibold">Susunan sebaris yang sama dengan meja ini:</p><ol className="list-decimal ps-5">{rows.map(r => <li key={r}>{r}</li>)}</ol></div>
    </Pair>
    <Result value={`${n}|${k}|${fact(n - 1)}`}><M text={`Setelah diputar, setiap orang tetap diapit tetangga yang sama. ${n}! = ${fact(n)} susunan sebaris dibagi ${n}: (${n} − 1)! = ${fact(n - 1)} susunan melingkar.`} /></Result>
  </div>;
}

const EVEN = [2, 4, 6, 8, 10, 12];
function MajemukLab() {
  const [bk, setBk] = useState(Object.keys(vennSets)[0]); const [op, setOp] = useState<"A ∪ B" | "A ∩ B">("A ∪ B");
  const B = vennSets[bk], members = Array.from({ length: 12 }, (_, i) => i + 1).filter(x => (op === "A ∪ B" ? EVEN.includes(x) || B.includes(x) : EVEN.includes(x) && B.includes(x)));
  return <div className="space-y-3">
    <Radios label="Kejadian B" options={Object.keys(vennSets)} value={bk} set={setBk} />
    <Radios label="Operasi" options={["A ∪ B", "A ∩ B"] as const} value={op} set={setOp} />
    <Pair>
      <Venn universe={Array.from({ length: 12 }, (_, i) => i + 1)} a={EVEN} b={B} la="A genap" lb={`B ${bk}`} highlight={op === "A ∪ B" ? "union" : "inter"} />
      <ul className="space-y-1 text-sm leading-7"><li>S = ｛1, 2, …, 12｝</li><li>A = ｛{EVEN.join(", ")}｝</li><li>B = ｛{B.join(", ")}｝</li><li className="font-bold">{op} = ｛{members.join(", ")}｝</li></ul>
    </Pair>
    <Result value={`${bk}|${op}|${members.join(",")}`}>{`${op === "A ∪ B" ? "A atau B" : "A dan B"}: ${members.length} anggota.`}</Result>
  </div>;
}

const B_EVENTS: Record<string, (a: number, b: number) => boolean> = { "Jumlah 7": (a, b) => a + b === 7, "Jumlah 9": (a, b) => a + b === 9, "Dadu merah 4": a => a === 4, "Dadu merah genap": a => a % 2 === 0 };
const all36 = [1, 2, 3, 4, 5, 6].flatMap(a => [1, 2, 3, 4, 5, 6].map(b => [a, b] as [number, number]));
function LepasLab() {
  const [s, setS] = useState(5); const [bk, setBk] = useState("Jumlah 7");
  const A = all36.filter(([a, b]) => a + b === s), B = all36.filter(([a, b]) => B_EVENTS[bk](a, b)), AB = A.filter(([a, b]) => B_EVENTS[bk](a, b)), u = A.length + B.length - AB.length;
  return <div className="space-y-3">
    <Stepper label="Kejadian A: jumlah" value={s} set={setS} min={2} max={12} />
    <Radios label="Kejadian B" options={Object.keys(B_EVENTS)} value={bk} set={setBk} />
    <Pair>
      <DiceTable marks={A} marks2={B} caption="Hijau: A. Biru: B. Kuning: keduanya. Baris: dadu merah." />
      <ul className="space-y-1 text-sm leading-7"><li>n(A) = {A.length}, n(B) = {B.length}, n(A ∩ B) = {AB.length}</li><li>{AB.length ? "Tidak saling lepas" : "Saling lepas"}</li>
        <li><M text={AB.length ? `P(A ∪ B) = {${A.length}/36} + {${B.length}/36} − {${AB.length}/36} = ${fracM(u, 36)}` : `P(A ∪ B) = {${A.length}/36} + {${B.length}/36} = ${fracM(u, 36)}`} /></li></ul>
    </Pair>
    <Result value={`${s}|${bk}|${A.length}|${B.length}|${AB.length}|${fracStr(u, 36)}`}><M text={`Peluang jumlah ${s} atau ${bk.toLowerCase()} adalah ${fracM(u, 36)}.`} /></Result>
  </div>;
}

function BebasLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(5);
  const marks = all36.filter(([x, y]) => x <= a && y >= b), nAB = marks.length;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Dadu merah paling besar" value={a} set={setA} min={1} max={6} /><Stepper label="Dadu putih paling kecil" value={b} set={setB} min={1} max={6} /></div>
    <Pair>
      <DiceTable marks={marks} caption="Baris: dadu merah. Kolom: dadu putih." />
      <ul className="space-y-1 text-sm leading-7"><li><M text={`P(A) = P(merah ≤ ${a}) = {${a}/6}`} /></li><li><M text={`P(B) = P(putih ≥ ${b}) = {${7 - b}/6}`} /></li>
        <li><M text={`P(A) × P(B) = {${a * (7 - b)}/36} = ${fracM(nAB, 36)}`} /></li><li>Dihitung langsung: {nAB} kotak dari 36.</li></ul>
    </Pair>
    <Result value={`${a}|${b}|${nAB}|${fracStr(nAB, 36)}`}><M text={`Daerah yang memenuhi berbentuk persegi panjang ${a} × ${7 - b}, jadi P(A ∩ B) = P(A) × P(B) = ${fracM(nAB, 36)}.`} /></Result>
  </div>;
}

const TARGETS = { "Merah lalu biru": [0, 1], "Merah lalu merah": [0, 0], "Putih lalu putih": [2, 2] } as const;
function BersyaratLab() {
  const [m, setM] = useState(8); const [bl, setBl] = useState(4); const [w, setW] = useState(3); const [t, setT] = useState<keyof typeof TARGETS>("Merah lalu biru");
  const cnt = [m, bl, w], names = ["Merah", "Biru", "Putih"], N = m + bl + w, [i, j] = TARGETS[t];
  const second = cnt.map((_, x) => cnt.map((c, y) => [names[y], `${c - (x === y ? 1 : 0)}/${N - 1}`] as [string, string]));
  const num = cnt[i] * (cnt[j] - (i === j ? 1 : 0)), den = N * (N - 1);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Spidol merah" value={m} set={setM} min={1} max={8} /><Stepper label="Spidol biru" value={bl} set={setBl} min={1} max={6} /><Stepper label="Spidol putih" value={w} set={setW} min={1} max={5} /></div>
    <Radios label="Urutan yang dicari" options={Object.keys(TARGETS) as (keyof typeof TARGETS)[]} value={t} set={setT} />
    <Pair>
      <Bag items={[{ label: "merah", color: "#e03131", count: m, kind: "spidol" }, { label: "biru", color: "#1c64b5", count: bl, kind: "spidol" }, { label: "putih", color: "#f8f9fa", count: w, kind: "spidol" }]} caption={`Isi tas: ${N} spidol`} />
      <Tree first={cnt.map((c, x) => [names[x], `${c}/${N}`])} second={second} hot={[i, j]} />
    </Pair>
    <Result value={`${m},${bl},${w}|${t}|${fracStr(num, den)}`}><M text={`P = {${cnt[i]}/${N}} × {${cnt[j] - (i === j ? 1 : 0)}/${N - 1}} = {${num}/${den}} = ${fracM(num, den)}. Spidol pertama tidak dikembalikan, jadi penyebut kedua ${N - 1}.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { aturan: AturanLab, susun: SusunLab, permutasi: PermutasiLab, kombinasi: KombinasiLab, unsur: UnsurLab, siklis: SiklisLab, majemuk: MajemukLab, lepas: LepasLab, bebas: BebasLab, bersyarat: BersyaratLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "frac": return <div role="group" aria-label={plainMath(p.label)} className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-1"><In label={`${plainMath(p.label)} pembilang`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="h-0.5 w-full bg-neutral" aria-hidden="true" /><In label={`${plainMath(p.label)} penyebut`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span>
      <span className="basis-full text-xs text-base-content/60">Tulis sebagai pecahan. Pecahan yang senilai juga diterima.</span></div>;
    case "row": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.cells.map((c, k) => <label key={c} className="flex flex-col items-center gap-1 rounded-lg bg-base-100 p-1.5 text-xs font-semibold ring-1 ring-base-300"><M text={c} /><In label={`${plainMath(p.label)} ${plainMath(c)}`} value={x[k]} set={v => put(k, v)} disabled={checked} w="w-24" /></label>)}</div></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold"><M text={r.text} /></span><span className="flex shrink-0 flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTwelveProbability() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 12, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Peluang</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menghitung banyak cara dengan aturan penjumlahan, aturan perkalian, permutasi, dan kombinasi, lalu menghitung peluang kejadian majemuk: saling lepas, saling bebas, dan bersyarat.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-2"><Card card="A♠" /><Card card="Q♥" /><Card card="K♦" /></div>
        <p className="mt-1 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berapa banyak caranya, dan seberapa mungkin terjadi?</h2>
        <p className="mt-2 text-sm">Menyusun paket menu, memilih pengurus kelas, mengatur tempat duduk di meja bundar, sampai menebak hasil undian. Semua dimulai dari menghitung banyak cara dengan teliti.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-peluang-12">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-peluang-12" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map(x => <button key={x.code} type="button" aria-current={x === t ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${x === t ? "btn-success" : "btn-outline"}`} onClick={() => go(sections.findIndex(o => o.topic === x))}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {inTopic.map(({ x, i }) => <button key={x.code} type="button" role="tab" aria-selected={i === idx} onClick={() => go(i)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${i === idx ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{x.code} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={idx} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{s.code} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Studi kasus sehari-hari</p><p><M text={s.life} /></p></div>
            <div className="mt-4 border-s-4 border-success ps-3 text-sm leading-7"><p><span className="font-bold">Contoh. </span><M text={s.example} /></p>
              <ol className="mt-1 list-decimal space-y-0.5 ps-5">{s.work.map(w => <li key={w}><M text={w} /></li>)}</ol></div>
            <div className="mt-4 text-sm leading-7"><p className="font-bold">Perlu diperhatikan</p><ul className="list-disc space-y-1 ps-5">{s.notes.map(w => <li key={w}><M text={w} /></li>)}</ul></div>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={idx === 0} onClick={() => go(idx - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {s.code}</button>
            {idx < sections.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(idx + 1)}>{sections[idx + 1].topic === t ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
