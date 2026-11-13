# Créditos y licencias del arte

## Despacho fotorrealista

La mesa del despacho es un render de Blender (Cycles) hecho con
`scripts/desk-render/`. Los recursos de terceros proceden de
[Poly Haven](https://polyhaven.com), con licencia **CC0** (dominio público:
uso libre, también comercial, sin atribución obligatoria). Se citan por
cortesía:

| Recurso | Tipo |
|---|---|
| Camera_01 | modelo |
| service_pistol | modelo |
| round_spectacles | modelo |
| vintage_pocket_watch | modelo |
| vintage_lighter | modelo |
| magnifying_glass_01 | modelo |
| fishermans_hat | modelo |
| tea_set_01 (taza y plato) | modelo |
| vintage_stapler | modelo |
| black_walnut_veneer_01 | textura (mesa) |
| brown_leather | textura (vade, libreta) |
| dark_wood | textura (fichero) |
| anniversary_lounge | HDRI (reflejos) |

Modelado propio (en el script): máquina de escribir, teléfono de disco,
lámpara de banquero, carpetas, calendario de sobremesa, fichero, corcho,
libreta, lápiz y placa. Las etiquetas, el papel y el corcho impresos se
generan con Pillow (`labels.py`) usando las tipografías de la app (SIL
Open Font License).

Variantes de las piezas de oficina y adornos: `scripts/desk-render/variants.py`
(misma escena y recursos). Las dos instantáneas del adorno se generaron con el
modelo de imagen descrito abajo.

## Retratos y fotografías de los expedientes

Generados en local para DEADLINE con un modelo de imagen de pesos abiertos,
sin servicios externos (`scripts/portraits/`):

| Componente | Licencia |
|---|---|
| Realistic Vision 5.1 (SG161222), basado en Stable Diffusion 1.5 | CreativeML OpenRAIL-M |
| sd-vae-ft-mse (Stability AI) | MIT |

Todas las personas retratadas son inventadas. Cada recurso lleva en el
expediente su texto alternativo y el crédito «Generada para DEADLINE…».
Los acabados de época (cartón de estudio, papel de copia, líneas de
escáner) se aplican con Pillow (`finish.py`).

```bash
python3 -m venv .cache/sdenv && .cache/sdenv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch
.cache/sdenv/bin/pip install diffusers transformers accelerate safetensors
# modelos en .cache/models (rv51, vae-mse) desde Hugging Face
.cache/sdenv/bin/python scripts/portraits/sd.py          # retratos e imágenes
python3 scripts/portraits/finish.py                     # acabado de época → content/cases/*/portraits|img
python3 scripts/portraits/integrate.py                  # recursos y bloques en case.ts
npm run content                                         # tamaños y SHA-256
```

## Cómo regenerar

```bash
python3 scripts/desk-render/fetch_assets.py   # descarga CC0 a .cache/
python3 scripts/desk-render/labels.py         # texturas impresas
blender -b --factory-startup -P scripts/desk-render/scene.py -- --final
python3 scripts/desk-render/finalize.py       # WebP para la app
python3 scripts/desk-render/polaroids.py      # instantáneas del adorno
blender -b --factory-startup -P scripts/desk-render/variants.py
python3 scripts/desk-render/finalize_variants.py
```

Requiere Blender 4.0 o posterior y `python3-numpy` para el importador glTF.
