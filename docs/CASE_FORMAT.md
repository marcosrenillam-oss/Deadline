# Formato de expedientes

## Cómo se escribe un expediente

```
content/cases/DL-I-0001/
  case.ts         ← fuente: el expediente tipado (TypeScript comprueba la forma al escribirlo)
  generate.ts     ← opcional: genera recursos gráficos por código (SVG)
  *.ts            ← módulos auxiliares (p. ej. la geometría de la hoja de contactos)
  case.json       ← generado: lo que se publica
  *.svg / *.webp  ← recursos
```

`npm run content` compila todos los expedientes: genera recursos, calcula
tamaño y SHA-256 de cada uno, valida el caso entero y publica
`case.json`, recursos y `catalog.json` en `apps/web/public/content`. Si un
expediente tiene errores, no se publica y la compilación falla (también en
GitHub Actions).

El esquema completo y comentado está en
[`packages/core/src/case/schema.ts`](../packages/core/src/case/schema.ts).

### Detalles ocultos

- **En el texto:** `{{dt-id|fragmento}}` dentro de un bloque. El fragmento se
  muestra con normalidad; con la lupa, el jugador puede tocar cualquier
  frase, y solo las marcadas revelan algo.
- **En una imagen:** `region: { x, y, w, h }` normalizada (0..1). Con la lupa,
  tocar dentro de la zona revela el detalle.
- **Sin posición:** se revelan con «Examinar a fondo».

## Identificadores

- Expediente: `DL-I-0001` (individual), `DL-D-0001` (diario), `DL-C-0001` (cooperativo).
- Internos: únicos en todo el expediente, con prefijo:
  `ch-` personajes · `ev-` evidencias · `dt-` detalles ocultos · `fa-` hechos ·
  `lo-` lugares · `te-` eventos · `in-` interrogatorios · `tp-` temas ·
  `q-` preguntas · `ln-` líneas citables · `cx-` contradicciones · `se-` secretos ·
  `de-` deducciones · `mo-` motivos · `me-` métodos · `hl-` pistas ·
  `ob-` objetivos · `en-` finales · `as-` recursos.

## Conceptos

- **Hecho (`fact`)**: unidad mínima de conocimiento. Lo que el jugador "sabe".
- **Conocimiento**: hechos, evidencias obtenidas y examinadas, detalles
  encontrados, contradicciones señaladas, secretos, preguntas formuladas,
  marcas y eventos de cronología desbloqueados.
- **Condición**: expresión sobre el conocimiento (`fact`, `evidence`,
  `examined`, `detail`, `contradiction`, `secret`, `asked`, `flag`, `all`,
  `any`, `not`, `atLeast`). Controla qué aparece y cuándo.
- **Efecto**: lo que provoca una acción (`grantFact`, `grantEvidence`,
  `revealSecret`, `setFlag`, `unlockTimelineEvent`).

## Bloques principales

| Bloque | Propósito |
|---|---|
| metadatos | id, versión, modo, título, origen, época, lugar, categoría, dificultad, palabras clave, ambiente |
| `historical` | **Obligatorio si `origin: real`**: hechos documentados, hipótesis, recreación, resolución documentada, fuentes |
| `briefing` | Expediente inicial: contexto, resumen, antecedentes, conocimiento de partida |
| `characters` | Retrato, biografía, personalidad, motivo y coartada visibles bajo condición |
| `relationships` | Relaciones entre personajes (algunas ocultas) |
| `evidence` | Documentos en bloques tipados, imagen, **detalles ocultos** (con región en la imagen), efectos al examinar, fiabilidad real |
| `deductions` | Relaciones que el jugador establece al **comparar** piezas |
| `contradictions` | Pares de afirmaciones incompatibles (evidencia, línea de diálogo, hecho, detalle) |
| `interrogations` | Temas → preguntas (`ask`, `press`, `confront`, `present`, `contradiction`) → variantes de respuesta según conocimiento; tono (verdad, mentira, evasiva, confusión, admisión) |
| `timeline` | Eventos con tiempo relativo al incidente (minutos), eventos falsos declarados por alguien, eventos clave |
| `accusation` | Sospechosos acusables, hipótesis de motivo y método (aparecen al tener base) |
| `solution` | Culpables, motivo, método, pruebas aceptadas, reconstrucción, verdad de coartadas |
| `endings` | Finales por resultado de la acusación (el último es de reserva) |
| `hints` | Líneas de pista con 3 niveles; `maxHints` limita su uso |
| `objectives` | Objetivos secundarios (pueden ser ocultos) |
| `coop` | Estilo (compartido/dividido) y papeles A/B; en dividido cada evidencia indica su receptor |
| `assets` | Manifiesto de recursos con tamaño y SHA-256 para verificar descargas |

## Validación

1. **Esquema**: tipos, formatos, campos obligatorios.
2. **Integridad**: ids únicos, referencias existentes y del tipo correcto,
   coherencia de modo, culpables acusables, final de reserva, última
   respuesta incondicional, marcas consultadas que algún efecto activa,
   regiones dentro de la imagen, recursos sin usar.
3. **Resolubilidad**: un investigador simulado lo examina, pregunta, compara
   y señala todo lo posible hasta agotar el caso. Es **error** que el
   culpable no llegue a aparecer, que el motivo/método correcto no esté
   disponible o que ninguna prueba definitiva sea alcanzable. Es **aviso**
   cualquier evidencia, hecho, secreto, contradicción, evento clave,
   pregunta u objetivo inalcanzable.

La resolubilidad comprueba que la solución es *alcanzable*; que sea *justa*
y deducible la revisa una persona (lista de control en la Etapa 3).
