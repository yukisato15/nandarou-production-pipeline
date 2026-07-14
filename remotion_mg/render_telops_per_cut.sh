#!/bin/bash
# カット単位でテロップを個別の透過MOVとして書き出す。
# 実編集(Premiere)のTCはコンテの「TC目安」とズレるため、絶対時間ではなく
# 各カットの実尺の上に個別配置できる形で納品する(2026-07-14方針転換)。
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out/telops_by_cut

CUTS=$(python3 -c "
import json
d = json.load(open('data/ep01_telops.json'))
print(' '.join(c['cut'] for c in d['cuts']))
")

for cut in $CUTS; do
  echo "=== $cut ==="
  npx remotion render TelopOverlay "out/telops_by_cut/ep01_${cut}_telop.mov" \
    --props="{\"cut\":\"${cut}\"}" \
    --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
done
