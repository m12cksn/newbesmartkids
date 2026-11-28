#!/usr/bin/env bash
# Render satu reel penuh: penyelarasan kata -> mix suara -> render adegan -> watermark tengah transparan -> mp4.
# Pakai (dari mana saja):  bash bangun_reel.sh <folder-reel>      Butuh: audio/vo.wav, web/shots.js, cues.json.
set -euo pipefail
SK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENGINE="${NAWI_ENGINE:-/root/.claude/skills/stick-figure/engine}"; KIT="${NAWI_KIT:-/root/.claude/kit}"
DIR="${1:?usage: bangun_reel.sh <folder-reel>}"
export NODE_PATH="$KIT/node_modules" NAWI_SFX="$SK/assets/sfx"
export WATERMARK="$SK/assets/logo/watermark-nawi.png" WM_W="${WM_W:-640}" WM_X='(main_w-overlay_w)/2' WM_Y='(main_h-overlay_h)/2' NO_OUTRO=1
export WORKERS="${WORKERS:-4}"
bash "$ENGINE/make.sh" "$DIR" keep
echo "selesai: $DIR/$(basename "$(cd "$DIR" && pwd)").mp4"
