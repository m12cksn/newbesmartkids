/**
 * Kelas 1 Bab 7 - Mengukur Panjang Benda (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 197-217).
 * A. Membandingkan dan Mengurutkan Panjang Benda  B. Mengukur Panjang Benda.
 * Bentuk soal mengikuti buku: lingkari benda yang lebih panjang/pendek/paling tinggi, "Pohon yang paling tinggi adalah …",
 * "Urutan … dari paling pendek: …, …, …", posisi hewan terbang (lebih tinggi, lebih rendah, sama tinggi), menghitung
 * penjepit kertas/stik es krim/koin/jengkal, tinggi hewan dalam kotak, benda pada petak kotak ("Pensil A lebih … dari pensil B"),
 * cara mengukur yang benar, dan menilai cara Kira mengukur.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Color = "merah" | "biru" | "hijau" | "kuning" | "ungu" | "merahmuda" | "oranye" | "toska";
/** Benda mendatar; panjang dalam satuan dasar (1 penjepit kertas = 12). */
export type HObj = "pensil" | "krayon" | "sisir" | "sikat" | "daun" | "pita" | "sendok" | "jam" | "gunting" | "botol" | "buku" | "sedotan" | "meja";
/** Benda berdiri; tinggi dalam satuan dasar. */
export type VObj = "pohon" | "kelapa" | "payung" | "kapal";
export type Flyer = "burung" | "kupu" | "capung";
export type Animal = "kucing" | "sapi" | "jerapah";
export type Unit = "penjepit" | "koin" | "stik" | "sedotan" | "jengkal" | "jengkalAyah";
export type Way = "benar" | "celah" | "tumpuk" | "geser" | "miring";

export const unitLen: Record<Unit, number> = { penjepit: 12, koin: 8, stik: 48, sedotan: 60, jengkal: 40, jengkalAyah: 60 };
export const unitName: Record<Unit, string> = { penjepit: "penjepit kertas", koin: "koin", stik: "stik es krim", sedotan: "sedotan", jengkal: "jengkal", jengkalAyah: "jengkal" };
export const objName: Record<HObj | VObj, string> = {
  pensil: "pensil", krayon: "krayon", sisir: "sisir", sikat: "sikat gigi", daun: "daun", pita: "pita", sendok: "sendok", jam: "jam tangan", gunting: "gunting",
  botol: "botol minum", buku: "buku", sedotan: "sedotan", meja: "meja", pohon: "pohon", kelapa: "pohon kelapa", payung: "payung", kapal: "kapal",
};
export const flyerName: Record<Flyer, string> = { burung: "burung", kupu: "kupu-kupu", capung: "capung" };
export const colorName: Record<Color, string> = { merah: "merah", biru: "biru", hijau: "hijau", kuning: "kuning", ungu: "ungu", merahmuda: "merah muda", oranye: "oranye", toska: "toska" };

export type HItem = { obj: HObj; len: number; color: Color; label?: string };
/** Benda pada petak kotak: x, y, dan panjang dalam kotak. */
export type GItem = { obj: "pensil" | "krayon" | "pita"; x: number; y: number; len: number; vertical?: boolean; color: Color; label: string };
export type Scene =
  /** Benda mendatar disusun ke bawah, ujung kiri rata. */
  | { type: "stack"; items: HItem[] }
  /** Benda berdiri berjajar di atas tanah. */
  | { type: "row"; obj: VObj; items: { h: number; color?: Color; label: string }[] }
  /** Hewan terbang; y = ketinggian 1–10. */
  | { type: "sky"; flyer: Flyer; items: { y: number; color: Color; label?: string }[] }
  /** Benda yang diukur dengan deretan alat ukur. */
  | { type: "measure"; items: { obj: HObj; len: number; color: Color; vertical?: boolean; units: Unit[] }[] }
  | { type: "grid"; w: number; h: number; items: GItem[] }
  /** Tinggi hewan dalam kotak. */
  | { type: "animals"; items: { animal: Animal; h: number }[] }
  /** Meja yang diukur dengan jengkal; satu baris per orang. */
  | { type: "span"; len: number; rows: { who: string; unit: Unit }[] }
  /** Kotak pensil yang diukur Kira dengan koin, stik es krim, dan penghapus. */
  | { type: "kira" }
  | { type: "kids"; items: { name: string; h: number; look: number }[] }
  /** Hewan terbang yang hinggap (tanpa posisi). */
  | { type: "perch"; flyer: Flyer; items: Color[] };

export type Part =
  /** Ketuk benda pada gambar untuk melingkarinya. */
  | { kind: "circle"; scene: Extract<Scene, { type: "stack" | "row" | "grid" }>; ans: number[] }
  /** Kalimat dengan kotak □; tiap kotak dipilih dari pilihan. */
  | { kind: "choose"; text: string; options: string[]; answers: string[]; anyOrder?: boolean }
  /** Ketuk pilihan sesuai urutan; nilai untuk memeriksa urutan (yang sama boleh bertukar). */
  | { kind: "order"; text: string; labels: string[]; values: number[]; dir: "asc" | "desc" }
  /** Kalimat dengan kotak angka □. */
  | { kind: "fill"; text: string; answers: number[] }
  /** Tambahkan alat ukur sampai ujung benda. */
  | { kind: "lay"; obj: HObj; len: number; color: Color; unit: Unit }
  /** Pilih gambar cara mengukur yang benar. */
  | { kind: "pick"; obj: "meja" | "buku"; unit: Unit; ways: Way[] };
export type LQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
export const fieldCount = (p: Part) => (p.kind === "fill" || p.kind === "choose" ? p.answers.length : p.kind === "order" ? p.labels.length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
export const layCount = (p: Extract<Part, { kind: "lay" }>) => p.len / unitLen[p.unit];
/** Urutan kunci: diurutkan menurut nilai; yang sama tetap berurutan seperti label. */
export const orderKey = (p: Extract<Part, { kind: "order" }>) => p.labels.map((l, i) => [l, p.values[i]] as const).sort((a, b) => (p.dir === "asc" ? a[1] - b[1] : b[1] - a[1])).map(x => x[0]);
export function partKey(p: Part): string {
  switch (p.kind) {
    case "circle": return [...p.ans].sort((a, b) => a - b).join(",");
    case "choose": return p.answers.join("|");
    case "order": return orderKey(p).join("|");
    case "fill": return p.answers.join("|");
    case "lay": return String(layCount(p));
    case "pick": return String(p.ways.indexOf("benar"));
  }
}
export function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "circle": return v === partKey(p);
    case "choose": return p.anyOrder ? [...x].sort().join("|") === [...p.answers].sort().join("|") : x.join("|") === p.answers.join("|");
    case "order": { if (new Set(x).size !== p.labels.length || !x.every(l => p.labels.includes(l))) return false;
      const val = x.map(l => p.values[p.labels.indexOf(l)]);
      return val.every((n, i) => i === 0 || (p.dir === "asc" ? n >= val[i - 1] : n <= val[i - 1])); }
    case "fill": return p.answers.every((a, i) => num(x[i]) === a);
    case "lay": case "pick": return v === partKey(p);
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "circle") return v !== "";
  if (p.kind === "lay") return v !== "" && v !== "0";
  if (p.kind === "pick") return v !== "";
  return cells(p, v).every(c => c.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: LQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: LQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };

/** Nama benda yang bisa dilingkari, untuk label dan pembahasan. */
export function circleNames(s: Extract<Part, { kind: "circle" }>["scene"]): string[] {
  if (s.type === "stack") return s.items.map((it, k) => it.label ?? `${objName[it.obj]} ${colorName[it.color]}${s.items.filter(o => o.obj === it.obj && o.color === it.color).length > 1 ? ` ${k + 1}` : ""}`);
  if (s.type === "row") return s.items.map(it => `${objName[s.obj]} ${it.label}`);
  return s.items.map(it => `${it.obj} ${it.label}`);
}
export const wayName: Record<Way, string> = { benar: "rapat dari ujung ke ujung", celah: "ada celah", tumpuk: "bertumpuk", geser: "tidak mulai dari ujung", miring: "miring" };
export function formatAnswer(q: LQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "circle": { const names = circleNames(p.scene); return v[i] ? `melingkari ${v[i].split(",").map(k => names[Number(k)]).join(" dan ")}` : "belum melingkari"; }
      case "choose": case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "order": return `${p.text} ${x.map(l => l || "…").join(", ")}`;
      case "lay": return `${objName[p.obj]} = ${v[i] || 0} ${unitName[p.unit]}`;
      case "pick": return v[i] ? `gambar ${Number(v[i]) + 1} (${wayName[p.ways[Number(v[i])]]})` : "belum memilih";
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Membandingkan dan Mengurutkan Panjang Benda", short: "Membandingkan", lab: "banding", steps: [
    "Letakkan ujung benda pada garis awal yang sama. Ujung lain yang lebih jauh berarti lebih panjang, yang lebih dekat berarti lebih pendek.",
    "Benda yang berdiri di tanah yang sama dibandingkan puncaknya: lebih tinggi, lebih pendek, atau sama tinggi.",
    "Untuk tiga benda atau lebih, cari yang paling panjang (paling tinggi) dan yang paling pendek, lalu urutkan.",
    "Hewan yang terbang dibandingkan posisinya: lebih tinggi, lebih rendah, paling tinggi, atau paling rendah.",
  ], demo: "Ubah panjang pensil, tinggi pohon, atau posisi kupu-kupu. Kalimat perbandingannya ikut berubah." },
  { code: "B", title: "Mengukur Panjang Benda", short: "Mengukur", lab: "ukur", steps: [
    "Panjang benda bisa diukur dengan jengkal, telapak kaki, depa, stik es krim, pensil, koin, sedotan, atau penjepit kertas.",
    "Cara mengukur yang benar: mulai dari ujung benda, alat ukur rapat, tidak bertumpuk, dan tidak miring.",
    "Hitung banyak alat ukur dari ujung sampai ujung. Panjang meja 4 sedotan.",
    "Alat ukur yang berbeda panjangnya memberi hasil yang berbeda: buku 2 stik es krim, tetapi 12 koin.",
  ], demo: "Pilih benda dan alat ukur, lalu tambahkan satu per satu sampai ujung benda. Lihat juga cara mengukur yang benar." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): LQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const choose = (text: string, options: string[], answers: string[], anyOrder = false): Part => ({ kind: "choose", text, options, answers, anyOrder });
const order = (text: string, labels: string[], values: number[], dir: "asc" | "desc"): Part => ({ kind: "order", text, labels, values, dir });
const ABC = ["A", "B", "C"], ABCD = ["A", "B", "C", "D"];
const row = (obj: VObj, hs: number[], colors?: Color[]): Extract<Scene, { type: "row" }> => ({ type: "row", obj, items: hs.map((h, k) => ({ h, label: ABCD[k], color: colors?.[k] })) });
const pos = ["lebih tinggi", "lebih rendah", "sama tinggi"];

/* ---------- Latihan (4 soal per subtopik) ---------- */
const treesP = row("pohon", [70, 50, 100, 70]);
const birdsP: Scene = { type: "sky", flyer: "burung", items: [{ y: 5, color: "merah", label: "A" }, { y: 2, color: "biru", label: "B" }, { y: 8, color: "kuning", label: "C" }] };
const gridP: Scene = { type: "grid", w: 9, h: 7, items: [{ obj: "pensil", x: 2, y: 1, len: 3, color: "merah", label: "A" }, { obj: "pensil", x: 0, y: 3, len: 6, color: "biru", label: "B" }, { obj: "pensil", x: 8, y: 2, len: 4, vertical: true, color: "hijau", label: "C" }] };
export const practice: LQuestion[][] = [
  [
    A({ prompt: "Lingkari benda yang lebih pendek pada setiap gambar.", parts: [{ kind: "circle", scene: { type: "stack", items: [{ obj: "krayon", len: 90, color: "ungu" }, { obj: "krayon", len: 60, color: "merah" }] }, ans: [1] }, { kind: "circle", scene: row("pohon", [70, 100]), ans: [0] }], explanation: "Ujung kiri krayon rata, jadi lihat ujung kanannya: krayon merah lebih pendek. Pohon berdiri di tanah yang sama: puncak pohon A lebih rendah, jadi pohon A lebih pendek." }),
    A({ prompt: "Lingkari benda yang lebih panjang pada setiap gambar.", parts: [{ kind: "circle", scene: { type: "stack", items: [{ obj: "sikat", len: 70, color: "hijau" }, { obj: "sikat", len: 90, color: "biru" }] }, ans: [1] }, { kind: "circle", scene: { type: "stack", items: [{ obj: "daun", len: 90, color: "hijau" }, { obj: "daun", len: 65, color: "hijau" }] }, ans: [0] }], explanation: "Sikat gigi biru ujungnya lebih jauh, jadi lebih panjang. Daun pertama lebih panjang dari daun kedua." }),
    A({ prompt: "Perhatikan pohon berikut.", scene: treesP, parts: [choose("Pohon yang sama tinggi adalah □ dan □.", ABCD, ["A", "D"], true), choose("Pohon yang paling pendek adalah □.", ABCD, ["B"])], explanation: "Puncak pohon A dan D rata, jadi sama tinggi. Puncak pohon B paling rendah, jadi pohon B paling pendek." }),
    A({ prompt: "Amati burung yang terbang.", scene: birdsP, parts: [choose("Burung yang terbang paling rendah adalah □.", ABC, ["B"]), order("Urutan burung dari yang paling tinggi:", ABC, [5, 2, 8], "desc")], explanation: "Burung C paling dekat ke awan, lalu burung A, dan burung B paling dekat ke tanah. Urutannya C, A, B." }),
  ],
  [
    B({ prompt: "Hitunglah panjang benda berikut.", scene: { type: "measure", items: [{ obj: "pensil", len: 96, color: "ungu", units: ["penjepit"] }, { obj: "sisir", len: 72, color: "hijau", units: ["penjepit"] }] }, parts: [fill("Panjang pensil = □ penjepit kertas", 8), fill("Panjang sisir = □ penjepit kertas", 6)], explanation: "Hitung penjepit kertas dari ujung sampai ujung benda: pensil 8 penjepit, sisir 6 penjepit." }),
    B({ prompt: "Ukurlah panjang gunting. Tambahkan penjepit kertas sampai ujung gunting.", parts: [{ kind: "lay", obj: "gunting", len: 60, color: "merahmuda", unit: "penjepit" }], explanation: "Penjepit kertas disusun rapat mulai dari ujung gunting. Tepat sampai ujung setelah 5 penjepit." }),
    B({ prompt: "Temukan panjang pensil berikut.", scene: gridP, parts: [fill("Pensil A □ kotak, pensil B □ kotak, pensil C □ kotak.", 3, 6, 4), choose("Pensil yang paling panjang adalah □.", ABC, ["B"])], explanation: "Hitung kotak yang dilewati setiap pensil: A 3 kotak, B 6 kotak, C 4 kotak (tegak). Pensil B paling panjang." }),
    B({ prompt: "Manakah cara mengukur buku dengan penjepit kertas yang benar? Ketuk gambarnya.", parts: [{ kind: "pick", obj: "buku", unit: "penjepit", ways: ["miring", "celah", "geser", "benar"] }], explanation: "Cara yang benar: mulai dari ujung buku, penjepit rapat, tidak bertumpuk, dan tidak miring. Itu gambar 4." }),
  ],
];

/* ---------- Evaluasi (24 soal: A dan B bergantian) ---------- */
const kidsS: Scene = { type: "kids", items: [{ name: "Kira", h: 88, look: 0 }, { name: "Upe", h: 96, look: 1 }, { name: "Malosi", h: 104, look: 2 }, { name: "Wei", h: 88, look: 3 }] };
export const assessment: LQuestion[] = [
  A({ level: "Sedang", prompt: "Lingkari sisir yang lebih panjang.", parts: [{ kind: "circle", scene: { type: "stack", items: [{ obj: "sisir", len: 80, color: "ungu" }, { obj: "sisir", len: 100, color: "merahmuda" }] }, ans: [1] }], explanation: "Ujung kiri kedua sisir rata. Ujung kanan sisir merah muda lebih jauh, jadi sisir merah muda lebih panjang." }),
  B({ level: "Sedang", prompt: "Hitunglah panjang benda berikut.", scene: { type: "measure", items: [{ obj: "jam", len: 108, color: "biru", units: ["penjepit"] }, { obj: "sendok", len: 132, color: "merahmuda", vertical: true, units: ["penjepit"] }] }, parts: [fill("Panjang jam tangan = □ penjepit kertas", 9), fill("Panjang sendok = □ penjepit kertas", 11)], explanation: "Hitung penjepit dari ujung ke ujung: jam tangan 9 penjepit, sendok yang tegak 11 penjepit." }),
  A({ level: "Sedang", prompt: "Lingkari kapal yang paling tinggi.", parts: [{ kind: "circle", scene: row("kapal", [80, 60, 95]), ans: [2] }], explanation: "Ketiga kapal berada di air yang sama. Tiang kapal C paling atas, jadi kapal C paling tinggi." }),
  B({ level: "Sedang", prompt: "Temukan tinggi hewan berikut.", scene: { type: "animals", items: [{ animal: "kucing", h: 3 }, { animal: "sapi", h: 6 }, { animal: "jerapah", h: 10 }] }, parts: [fill("Kucing □ kotak, sapi □ kotak, jerapah □ kotak.", 3, 6, 10), choose("Hewan yang paling tinggi adalah □.", ["kucing", "sapi", "jerapah"], ["jerapah"])], explanation: "Hitung kotak di samping setiap hewan: kucing 3, sapi 6, jerapah 10. Jerapah paling tinggi." }),
  A({ level: "Sedang", prompt: "Perhatikan pohon berikut.", scene: row("pohon", [110, 60, 90]), parts: [choose("Pohon yang paling tinggi adalah □.", ABC, ["A"]), choose("Pohon yang paling pendek adalah □.", ABC, ["B"]), order("Urutan pohon dari yang paling tinggi:", ABC, [110, 60, 90], "desc")], explanation: "Pohon A paling tinggi, pohon B paling pendek. Urutan dari yang paling tinggi: A, C, B." }),
  B({ level: "Sedang", prompt: "Ukurlah panjang buku dengan stik es krim. Tambahkan stik sampai ujung buku.", parts: [{ kind: "lay", obj: "buku", len: 144, color: "hijau", unit: "stik" }], explanation: "Stik es krim disusun rapat dari ujung buku. Tepat sampai ujung setelah 3 stik, jadi panjang buku 3 stik es krim." }),
  A({ level: "Sedang", prompt: "Lengkapi cerita capung terbang.", scene: { type: "sky", flyer: "capung", items: [{ y: 8, color: "merah" }, { y: 3, color: "ungu" }, { y: 6, color: "hijau" }, { y: 6, color: "biru" }] }, parts: [choose("Dibandingkan capung ungu, capung merah terbang □.", pos, ["lebih tinggi"]), choose("Dibandingkan capung biru, capung hijau terbang □.", pos, ["sama tinggi"])], explanation: "Capung merah berada di atas capung ungu, jadi terbang lebih tinggi. Capung hijau dan biru sejajar, jadi sama tinggi." }),
  B({ level: "Sedang", prompt: "Kira menebak panjang meja 4 jengkal. Lalu Kira mengukurnya.", scene: { type: "span", len: 200, rows: [{ who: "Kira", unit: "jengkal" }] }, parts: [fill("Panjang meja = □ jengkal", 5), choose("Tebakan Kira □ hasil pengukurannya.", ["kurang dari", "sama dengan", "lebih dari"], ["kurang dari"])], explanation: "Ada 5 jengkal dari ujung ke ujung meja. Tebakan 4 jengkal kurang dari hasil 5 jengkal." }),

  A({ level: "Menantang", prompt: "Perhatikan payung berikut.", scene: row("payung", [90, 80, 100], ["kuning", "merahmuda", "toska"]), parts: [choose("Payung yang paling panjang adalah □.", ABC, ["C"]), order("Urutan payung dari yang paling panjang:", ABC, [90, 80, 100], "desc")], explanation: "Gagang payung rata di bawah, jadi lihat ujung atasnya. C paling panjang, lalu A, dan B paling pendek." }),
  B({ level: "Menantang", prompt: "Panjang botol minum diukur dengan dua alat ukur.", scene: { type: "measure", items: [{ obj: "botol", len: 144, color: "biru", units: ["stik", "penjepit"] }] }, parts: [fill("Panjang botol = □ stik es krim atau □ penjepit kertas.", 3, 12), choose("Hasilnya berbeda karena □.", ["panjang alat ukurnya berbeda", "botolnya berubah panjang", "salah menghitung"], ["panjang alat ukurnya berbeda"])], explanation: "Botolnya sama, tetapi stik es krim lebih panjang dari penjepit kertas. Jadi stik yang dibutuhkan lebih sedikit (3) daripada penjepit (12)." }),
  A({ level: "Menantang", prompt: "Hitung kotak yang dilewati setiap krayon.", scene: { type: "grid", w: 10, h: 7, items: [{ obj: "krayon", x: 1, y: 1, len: 6, color: "oranye", label: "A" }, { obj: "krayon", x: 4, y: 3, len: 4, color: "biru", label: "B" }, { obj: "krayon", x: 9, y: 1, len: 5, vertical: true, color: "ungu", label: "C" }] }, parts: [choose("Krayon A lebih □ dari krayon B.", ["panjang", "pendek"], ["panjang"]), order("Urutan krayon dari yang paling panjang:", ABC, [6, 4, 5], "desc")], explanation: "Ujung krayon tidak rata, jadi hitung kotaknya: A 6, B 4, C 5. Krayon B ujungnya lebih ke kanan, tetapi A lebih panjang dari B. Urutannya A, C, B." }),
  B({ level: "Menantang", prompt: "Manakah cara mengukur meja dengan sedotan yang benar? Ketuk gambarnya.", parts: [{ kind: "pick", obj: "meja", unit: "sedotan", ways: ["celah", "tumpuk", "benar", "geser"] }], explanation: "Sedotan harus mulai dari ujung meja, rapat, tidak bertumpuk, dan tidak miring. Itu gambar 3." }),
  A({ level: "Menantang", prompt: "Lingkari pensil yang paling pendek. Hitung kotaknya.", parts: [{ kind: "circle", scene: { type: "grid", w: 10, h: 7, items: [{ obj: "pensil", x: 0, y: 1, len: 6, color: "merah", label: "A" }, { obj: "pensil", x: 5, y: 3, len: 5, color: "biru", label: "B" }, { obj: "pensil", x: 1, y: 5, len: 7, color: "hijau", label: "C" }] }, ans: [1] }], explanation: "Ujung pensil tidak rata. Pensil B ujungnya paling kanan, tetapi panjangnya hanya 5 kotak. A 6 kotak dan C 7 kotak." }),
  B({ level: "Menantang", prompt: "Kira mengukur kotak pensilnya seperti gambar.", scene: { type: "kira" }, parts: [choose("Cara Kira mengukur □.", ["sudah benar", "belum benar"], ["belum benar"]), choose("Alasannya, □.", ["alat ukurnya berbeda-beda", "alat ukurnya ada celah", "tidak mulai dari ujung"], ["alat ukurnya berbeda-beda"])], explanation: "Kira memakai koin, stik es krim, dan penghapus sekaligus. Alat ukurnya harus sama, misalnya semua stik es krim." }),
  A({ level: "Menantang", prompt: "Burung kuning terbang lebih tinggi dari burung merah. Burung biru terbang lebih rendah dari burung merah.", scene: { type: "perch", flyer: "burung", items: ["merah", "kuning", "biru"] }, parts: [order("Urutan burung dari yang terbang paling tinggi:", ["merah", "kuning", "biru"], [2, 3, 1], "desc"), choose("Burung yang terbang paling rendah adalah burung □.", ["merah", "kuning", "biru"], ["biru"])], explanation: "Kuning di atas merah, biru di bawah merah. Urutan dari yang paling tinggi: kuning, merah, biru. Biru paling rendah." }),
  B({ level: "Menantang", prompt: "Ukurlah panjang pensil dengan koin. Tambahkan koin sampai ujung pensil.", parts: [{ kind: "lay", obj: "pensil", len: 72, color: "biru", unit: "koin" }], explanation: "Koin disusun rapat dari ujung pensil. Tepat sampai ujung setelah 9 koin." }),
  A({ level: "Menantang", prompt: "Perhatikan pohon kelapa berikut.", scene: row("kelapa", [100, 85, 60, 85]), parts: [choose("Pohon yang sama tinggi adalah □ dan □.", ABCD, ["B", "D"], true), order("Urutan pohon dari yang paling pendek:", ABCD, [100, 85, 60, 85], "asc")], explanation: "B dan D sama tinggi. C paling pendek, A paling tinggi. Urutan dari yang paling pendek: C, B, D, A (B dan D boleh bertukar)." }),

  B({ level: "Sangat menantang", prompt: "Temukan panjang pita berikut.", scene: { type: "grid", w: 10, h: 7, items: [{ obj: "pita", x: 0, y: 1, len: 7, color: "merahmuda", label: "A" }, { obj: "pita", x: 3, y: 3, len: 5, color: "kuning", label: "B" }, { obj: "pita", x: 9, y: 0, len: 6, vertical: true, color: "ungu", label: "C" }] }, parts: [fill("Pita A □ kotak, pita B □ kotak, pita C □ kotak.", 7, 5, 6), order("Urutan pita dari yang paling panjang:", ABC, [7, 5, 6], "desc")], explanation: "Hitung kotaknya: A 7, B 5, C 6 (tegak). Urutan dari yang paling panjang: A, C, B." }),
  A({ level: "Sangat menantang", prompt: "Bandingkan tinggi badan mereka.", scene: kidsS, parts: [choose("Dibandingkan Wei, Kira □.", ["lebih tinggi", "lebih pendek", "sama tinggi"], ["sama tinggi"]), choose("Siswa yang paling tinggi adalah □.", ["Kira", "Upe", "Malosi", "Wei"], ["Malosi"])], explanation: "Kepala Kira dan Wei sejajar, jadi sama tinggi. Kepala Malosi paling atas, jadi Malosi paling tinggi." }),
  B({ level: "Sangat menantang", prompt: "Ukur dulu, lalu bandingkan.", scene: { type: "measure", items: [{ obj: "pensil", len: 108, color: "merah", vertical: true, units: ["penjepit"] }, { obj: "sisir", len: 96, color: "toska", units: ["penjepit"] }] }, parts: [fill("Pensil □ penjepit, sisir □ penjepit.", 9, 8), choose("Benda yang lebih panjang adalah □.", ["pensil", "sisir"], ["pensil"])], explanation: "Pensil 9 penjepit dan sisir 8 penjepit. Alat ukurnya sama, jadi pensil lebih panjang." }),
  A({ level: "Sangat menantang", prompt: "Perhatikan kupu-kupu yang terbang.", scene: { type: "sky", flyer: "kupu", items: [{ y: 4, color: "merah" }, { y: 7, color: "kuning" }, { y: 2, color: "hijau" }, { y: 7, color: "biru" }, { y: 5, color: "ungu" }] }, parts: [fill("Ada □ kupu-kupu yang terbang lebih tinggi dari kupu-kupu merah.", 3), choose("Kupu-kupu yang terbang sama tinggi adalah kupu-kupu □ dan □.", ["merah", "kuning", "hijau", "biru", "ungu"], ["kuning", "biru"], true)], explanation: "Kupu-kupu kuning, biru, dan ungu di atas kupu-kupu merah, jadi ada 3. Kuning dan biru sejajar, jadi sama tinggi." }),
  B({ level: "Sangat menantang", prompt: "Kira dan Ayah mengukur meja yang sama dengan jengkal.", scene: { type: "span", len: 240, rows: [{ who: "Kira", unit: "jengkal" }, { who: "Ayah", unit: "jengkalAyah" }] }, parts: [fill("Kira □ jengkal, Ayah □ jengkal.", 6, 4), choose("Hasil Ayah lebih sedikit karena jengkal Ayah lebih □.", ["panjang", "pendek"], ["panjang"])], explanation: "Mejanya sama. Kira butuh 6 jengkal, Ayah hanya 4 jengkal karena jengkal Ayah lebih panjang." }),
  A({ level: "Sangat menantang", prompt: "Lingkari dua pensil yang sama panjang. Hitung kotaknya.", parts: [{ kind: "circle", scene: { type: "grid", w: 10, h: 8, items: [{ obj: "pensil", x: 0, y: 1, len: 5, color: "merah", label: "A" }, { obj: "pensil", x: 2, y: 3, len: 6, color: "biru", label: "B" }, { obj: "pensil", x: 5, y: 5, len: 5, color: "hijau", label: "C" }, { obj: "pensil", x: 1, y: 7, len: 4, color: "ungu", label: "D" }] }, ans: [0, 2] }], explanation: "Hitung kotaknya: A 5, B 6, C 5, D 4. Pensil A dan C sama panjang walaupun ujungnya tidak rata." }),
  B({ level: "Sangat menantang", prompt: "Temukan panjang pensil berikut.", scene: { type: "grid", w: 10, h: 7, items: [{ obj: "pensil", x: 2, y: 1, len: 4, color: "merah", label: "A" }, { obj: "pensil", x: 0, y: 3, len: 7, color: "biru", label: "B" }, { obj: "pensil", x: 9, y: 0, len: 6, vertical: true, color: "hijau", label: "C" }] }, parts: [fill("Pensil A □ kotak, pensil B □ kotak, pensil C □ kotak.", 4, 7, 6), order("Urutan pensil dari yang paling pendek:", ABC, [4, 7, 6], "asc")], explanation: "A 4 kotak, B 7 kotak, C 6 kotak (tegak). Urutan dari yang paling pendek: A, C, B." }),
];
