#!/usr/bin/env bash
# Analisis video/gambar referensi: info teknis, potongan adegan, dan lembar kontak.
# Pakai: bash ref.sh <file-referensi> <folder-keluar>
set -euo pipefail
IN="$1"; OUT="$2"; mkdir -p "$OUT"
case "${IN,,}" in
  *.png|*.jpg|*.jpeg|*.webp) ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$IN" > "$OUT/info.txt"; cp "$IN" "$OUT/"; echo "gambar: $(cat "$OUT/info.txt")"; exit 0;;
esac
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "$IN" > "$OUT/info.txt"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
# 1) frame di setiap pergantian adegan (ritme potongan)
ffmpeg -loglevel error -y -i "$IN" -vf "select='gt(scene,0.28)',showinfo,scale=270:-2" -vsync vfr "$OUT/adegan-%03d.jpg" 2> "$OUT/adegan.log" || true
grep -o 'pts_time:[0-9.]*' "$OUT/adegan.log" | cut -d: -f2 > "$OUT/waktu-potong.txt" || true
# 2) 16 frame merata untuk lembar kontak
ffmpeg -loglevel error -y -i "$IN" -vf "fps=16/$DUR,scale=270:-2,tile=8x2" -frames:v 1 "$OUT/kontak.jpg"
# 3) 3 detik pertama lebih rapat (hook)
ffmpeg -loglevel error -y -t 3 -i "$IN" -vf "fps=4,scale=270:-2,tile=12x1" -frames:v 1 "$OUT/hook-3detik.jpg"
POT=$(wc -l < "$OUT/waktu-potong.txt" | tr -d ' ')
echo "durasi ${DUR}s, potongan adegan ${POT} (~$(python3 -c "print(round($POT/max($DUR,1),2))") per detik)"
cat "$OUT/info.txt"
