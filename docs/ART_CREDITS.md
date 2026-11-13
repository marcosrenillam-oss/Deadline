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

## Cómo regenerar

```bash
python3 scripts/desk-render/fetch_assets.py   # descarga CC0 a .cache/
python3 scripts/desk-render/labels.py         # texturas impresas
blender -b --factory-startup -P scripts/desk-render/scene.py -- --final
python3 scripts/desk-render/finalize.py       # WebP para la app
```

Requiere Blender 4.0 o posterior y `python3-numpy` para el importador glTF.
