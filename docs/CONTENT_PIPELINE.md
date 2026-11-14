# Producción de expedientes

El objetivo es un archivo de 2000 casos individuales, 500 diarios y 500
cooperativos. No se generan de golpe: se escriben por tandas pequeñas, cada
expediente revisado y probado (D-054). Hoy hay 5.

## Por qué no se generan en masa
- Un expediente jugable no es un texto: es una red de condiciones
  (evidencias que aparecen, preguntas que dependen de lo que se sabe,
  contradicciones, finales). Un error deja el caso sin solución o con una
  solución que se adivina sin investigar.
- El validador comprueba la estructura y que la solución sea alcanzable,
  pero no la calidad: que las pistas sean justas, que haya sospechosos
  creíbles y que la deducción tenga gracia. Eso hay que revisarlo a mano.

## Proceso por expediente
1. **Ficha de diseño** (en el comentario de cabecera de `case.ts`): verdad
   del caso, culpable, móvil, método, cadena de pruebas y pistas falsas.
2. **Cadena mínima**: las 3–4 deducciones o contradicciones que llevan a la
   solución, cada una con dos piezas obtenibles por caminos distintos.
3. **Sospechosos creíbles**: cada inocente miente o esconde algo (un
   secreto que se descubre), pero su coartada real se puede comprobar.
4. **Redacción**: documentos con detalles ocultos `{{dt-…|texto}}`,
   interrogatorios por temas, cronología con eventos falsos atribuidos.
5. **Validar**: `npm run content` → 0 errores y 0 avisos.
6. **Partida completa**: una prueba en `packages/core/test/` que juegue el
   caso hasta el final con confesión (ver `content-dl-d-0002.test.ts`).
7. **Jugarlo**: abrirlo en la app, sin mirar la solución si lo prueba otra
   persona, y anotar dónde se atasca.
8. **Casos históricos**: separar en `historical` lo documentado, las
   hipótesis y lo recreado, con fuentes.

## Reglas por modalidad
- **Diario**: 60 minutos, dificultad mayoritariamente Detective, 8–10
  evidencias. `dailyIndex` consecutivo (el calendario lo asigna por día
  desde el primer arranque de cada jugador).
- **Individual**: 60 minutos, 12–18 evidencias, recursos gráficos
  generados (`generate.ts`) cuando la imagen es una prueba.
- **Cooperativo**: 120 minutos. En información dividida, el validador
  avisa si un papel puede resolver solo; en compartido, el diseño debe dar
  trabajo para dos (varios interrogatorios en paralelo).

## Ritmo realista
Un expediente bien hecho lleva una sesión de trabajo larga. Con tandas de
3–5 por sesión, mantener 500 diarios por delante del calendario de los
jugadores es el primer objetivo: el calendario de cada jugador empieza su
primer día, así que basta con ir siempre unos días por delante de los
jugadores más antiguos.

## Arte
Hoy los retratos son siluetas (`look`) y las imágenes de prueba se
generan como SVG en el propio repositorio. Para un arte final sin costes
recurrentes, las opciones son ilustración propia, obras de dominio público
(museos con licencia CC0) para los casos históricos, o un encargo único.
Es una decisión de producto pendiente.

## Retratos e imágenes de cada expediente nuevo

Todo personaje (salvo el investigador) lleva retrato. Al escribir un caso,
rellena `appearance` de cada personaje (aspecto en inglés: rasgos, pelo,
ropa de la época, gesto; siempre inventado). Después:

```bash
scripts/portraits/make_all.sh   # reparto automático → genera lo que falte → acabado → integra → npm run content
```

Solo se generan los retratos que faltan (los existentes no se repiten). Ver
`docs/ART_CREDITS.md` para el modelo y su licencia.
