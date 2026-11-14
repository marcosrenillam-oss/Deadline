#!/bin/bash
# Retratos e imágenes de todos los expedientes: solo se genera lo que falta.
set -e
cd "$(dirname "$0")/../.."
python3 scripts/portraits/autocast.py
.cache/sdenv/bin/python scripts/portraits/sd.py --steps=24
python3 scripts/portraits/finish.py
python3 scripts/portraits/integrate.py
npm run content
