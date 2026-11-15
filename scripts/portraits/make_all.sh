#!/bin/bash
# Retratos e imágenes de todos los expedientes: solo se genera lo que falta.
set -e
cd "$(dirname "$0")/../.."
python3 scripts/portraits/autocast.py
[ -f .cache/models/lcm-lora/pytorch_lora_weights.safetensors ] && FAST="--fast --steps=6 --lcm-guidance=1.0" || FAST="--steps=24"
.cache/sdenv/bin/python scripts/portraits/sd.py $FAST
python3 scripts/portraits/finish.py
python3 scripts/portraits/integrate.py
npm run content
