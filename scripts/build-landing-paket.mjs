// Membangun aset halaman penjualan Scalev (public/landing/paket-belajar.css dan .js) dari satu berkas sumber
// yang mudah dibaca: scripts/landing/paket-belajar.src.html (HTML, <style>, dan <script> dalam satu dokumen).
// Pakai: node scripts/build-landing-paket.mjs [folder-keluaran]   (bawaan: public/landing)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] ?? path.join(here, "..", "public", "landing"));
const src = readFileSync(path.join(here, "landing", "paket-belajar.src.html"), "utf8");

const css = src.match(/<style>\n([\s\S]*?)\n<\/style>/)?.[1];
const start = src.indexOf("<body>\n") + "<body>\n".length;
const firstScript = src.indexOf("<script>", start);
if (!css || start < 7 || firstScript < 0) throw new Error("Sumber landing tidak lengkap: <style>, <body>, atau <script> tidak ditemukan.");
// Isi halaman dirapikan: baris kosong dan komentar HTML dibuang, indentasi di awal baris dihapus (sama seperti aset yang sudah tayang).
const body = src.slice(start, firstScript).replace(/\n(?:[ \t]*\n)+/g, "\n").replace(/<!--[\s\S]*?-->/g, "").replace(/^[ \t]+/gm, "").replace(/\s+$/, "");
// Skrip: komentar blok dibuang dan indentasi dihapus agar berkas tetap ringkas.
const scripts = [...src.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)].map(m => m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]+/gm, "").replace(/^\n+/, ""));
if (scripts.length < 2) throw new Error("Sumber landing harus punya minimal dua blok <script>.");

const js = `(function(){var root=document.getElementById("bsk-app");root.innerHTML=${JSON.stringify(body)};})();\n\n${scripts.join("\n\n")}\n`;
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "paket-belajar.css"), `${css}\n`);
writeFileSync(path.join(out, "paket-belajar.js"), js);
console.log(`landing: ${path.relative(process.cwd(), out)}/paket-belajar.css (${css.length + 1} B), paket-belajar.js (${js.length} B), ${scripts.length} skrip`);
