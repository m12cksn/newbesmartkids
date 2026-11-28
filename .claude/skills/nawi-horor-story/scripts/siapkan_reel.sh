#!/usr/bin/env bash
# Menyiapkan folder satu reel: salin templat engine stick-figure, lalu timpa dengan templat Nawi Horor Story.
# Pakai: bash siapkan_reel.sh <folder-reel>
# Setelah ini tulis: script.json (narasi), web/shots.js (adegan), cues.json (efek suara). Lihat SKILL.md.
set -euo pipefail
SK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENGINE="${NAWI_ENGINE:-/root/.claude/skills/stick-figure/engine}"
[ -d "$ENGINE/template" ] || { echo "engine stick-figure tidak ditemukan di $ENGINE (set NAWI_ENGINE). Lihat SKILL.md bagian Ketergantungan."; exit 1; }
DIR="${1:?usage: siapkan_reel.sh <folder-reel>}"
mkdir -p "$DIR"; cp -r "$ENGINE/template/." "$DIR/"
rm -rf "$DIR/audio" "$DIR/seg" "$DIR/stills" "$DIR/web/env.js" "$DIR/web/shots.js"; mkdir -p "$DIR/audio"
cp "$SK/template/web/"* "$DIR/web/"            # nawi.js, nawi-env.js, main.js, index.html
cp "$SK/template/audio.py" "$DIR/audio.py"
cp "$SK/template/shots.contoh.js" "$DIR/web/shots.js"
[ -f "$DIR/cues.json" ] || cp "$SK/template/cues.contoh.json" "$DIR/cues.json"
echo id > "$DIR/lang.txt"; echo '{}' > "$DIR/captions.json"
echo "siap: $DIR  (edit script.json, web/shots.js, cues.json)"
