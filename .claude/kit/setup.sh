#!/usr/bin/env bash
# Linux setup for the /stick-figure skill (Claude Code cloud / Ubuntu). Safe to run again.
#   bash .claude/kit/setup.sh [--voice]
# Installs into .claude/kit: node_modules (uses the preinstalled global Playwright when present),
# and with --voice a Python venv with Kokoro (TTS) + sherpa-onnx (word timing) and ~1.3 GB of models.
# The heavy folders (node_modules, .venv, models) are git-ignored.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$KIT"
GLOBAL_PW="$(npm root -g 2>/dev/null)/playwright"
if [ -d "$GLOBAL_PW" ]; then
  # This environment already ships Playwright with its Chromium; do not install another copy.
  mkdir -p node_modules && ln -sfn "$GLOBAL_PW" node_modules/playwright
  [ -d "$(npm root -g)/playwright-core" ] && ln -sfn "$(npm root -g)/playwright-core" node_modules/playwright-core
else
  npm install --no-audit --no-fund --loglevel=error
  npx --yes playwright install chromium
fi
echo "kit: node ok"
if [ "${1:-}" = "--voice" ]; then
  [ -x .venv/bin/python ] || python3 -m venv .venv
  .venv/bin/python -m pip install -q --upgrade pip
  .venv/bin/python -m pip install -q numpy scipy soundfile kokoro-onnx sherpa-onnx
  mkdir -p models
  [ -s models/kokoro-v1.0.onnx ] || curl -fL -# -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  [ -s models/voices-v1.0.bin ] || curl -fL -# -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  if ! ls -d models/sherpa-onnx-nemo-parakeet* >/dev/null 2>&1; then
    curl -fL -# -o models/p.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2
    (cd models && tar xjf p.tar.bz2 && rm -f p.tar.bz2)
  fi
  .venv/bin/python -c "import kokoro_onnx, sherpa_onnx"
  echo "kit: voice ok"
fi
