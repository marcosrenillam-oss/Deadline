# Arquitectura

## Visión general (versión local-first, sin servidor)

```
            GitHub (repositorio público)
              │ push / Run workflow
              ▼
   GitHub Actions: typecheck · tests · validación de casos · build
              │
              ▼
   GitHub Pages (estático, HTTPS) ── https://<usuario>.github.io/Deadline/
              │ primera visita + actualizaciones
              ▼
┌──────────────────────── iPhone (PWA standalone, horizontal) ────────────────────────┐
│  React 19 + TypeScript · React Router · CSS Modules + tokens                        │
│  Escenas: escritorio (SVG/CSS + madera en canvas), ajustes, secciones…              │
│  Audio sintetizado (Web Audio) · hápticos (mejora progresiva)                       │
│        │                                                                            │
│  @deadline/core ← condiciones, validación, cronómetro, diarios, rangos,             │
│                   cosméticos, copias de seguridad                                    │
│        │                                                                            │
│  IndexedDB (fuente de verdad): perfil, ajustes, progreso, notas, diarios…           │
│  Service worker: la app completa funciona sin conexión                              │
│        │                                                                            │
│  Archivo personal ⇄ archivo JSON (Archivos / iCloud Drive / AirDrop)                │
│  Cooperativo ⇄ códigos e informes de campo entre dispositivos (Etapa 6)             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

No hay servidor, base de datos remota, cuentas ni servicios externos. Ver
`LOCAL_FIRST.md` (qué cambió y limitaciones), `DISTRIBUTION.md` y `COOP.md`.

## Principios

1. **El contenido es datos, no código.** Un expediente es un JSON validado por
   esquema. Todo lo que depende de lo que sabe el jugador se expresa con el
   lenguaje de condiciones (`packages/core/src/case/conditions.ts`).
2. **Separación estricta** entre contenido del expediente, estado de la
   investigación, progreso/recompensas, recursos descargados y datos
   cooperativos.
3. **El tiempo son marcas absolutas** (`deadlineAt − ahora`), con blindaje
   frente a relojes que retroceden.
4. **El dispositivo es la autoridad** sobre puntos, rangos, recompensas y
   diarios. Las piezas para un futuro servidor (desfase de reloj,
   reconciliación de diarios, cola de sincronización) se conservan sin uso.
5. **Offline-first total**: también el cooperativo, que se basa en
   intercambio de códigos y paquetes.
6. **El jugador es dueño de sus datos**: puede exportarlos e importarlos.

## Paquetes

### `@deadline/core`
| Módulo | Contenido |
|---|---|
| `case/taxonomy.ts` | Épocas, categorías, orígenes, dificultades, tipos de evidencia, límites de tiempo |
| `case/conditions.ts` | Lenguaje de condiciones y efectos; modelo de conocimiento del jugador |
| `case/schema.ts` | Esquema zod del expediente completo y ficha de catálogo |
| `case/validate.ts` | Validación en 3 capas: esquema, integridad, resolubilidad |
| `investigation/state.ts` | Investigación (intento), registro por caso, tablero, cronología del jugador, notas |
| `timer/timer.ts` | Cronómetro por marcas de tiempo, desfase con servidor |
| `daily/schedule.ts` | Calendario de 500 diarios, registro anti-duplicados, reconciliación |
| `progression/*` | Rangos (6 niveles, 2 progresiones) y reglas económicas |
| `settings/settings.ts` | Ajustes del dispositivo con valores por defecto tolerantes |
| `profile/profile.ts` | Perfil local y nº de investigador con letra de control |
| `cosmetics/catalog.ts` | Huecos de la oficina, variantes y reglas de desbloqueo |
| `backup/archive.ts` | Formato de copia, suma SHA-256, validación y fusión |
| `engine/engine.ts` | Motor de investigación: acciones y consultas puras |
| `engine/resolution.ts` | Acusación, finales, cronología, puntuación, cierre por tiempo |
| `sync/queue.ts` | Reservado para un futuro servidor |

### `apps/web`
| Carpeta | Contenido |
|---|---|
| `app/` | Raíz, router, registro de secciones, puerta de orientación, avisos del SW |
| `scenes/` | Escritorio (`desk/`), ajustes (`settings/`), secciones pendientes, diagnóstico |
| `storage/` | IndexedDB (esquema y migraciones), repositorios, copias de seguridad |
| `settings/` | Proveedor de ajustes (lee/escribe IDB y aplica variables CSS, audio y hápticos) |
| `profile/` | Proveedor del perfil local y equipamiento de la oficina |
| `audio/` | Motor de sonido sintetizado y hápticos |
| `platform/` | Detección de entorno, hooks de orientación/conexión |
| `ui/` | Primitivas visuales compartidas (superficies, sellos…) |
| `styles/` | Tokens de diseño, tipografías autoalojadas, base |

## Navegación

Rutas con nombres del universo: `/` (escritorio), `/archivo`, `/calendario`,
`/telefono`, `/maquina`, `/lampara`, `/libreta`, `/diagnostico`. El registro
`app/sections.ts` es la fuente única de rutas, nombres y etapa de cada sección.
Las transiciones usan View Transitions cuando el navegador las soporta.

Expediente: `/expediente/:caseId` (portada o expediente) y las
subrutas `evidencias`, `evidencias/:id`, `personas`, `personas/:id`,
`interrogatorio/:characterId`, `cronologia`, `tablero`, `acusacion` e
`informe`. `CaseProvider` carga el contenido, mantiene la investigación,
ejecuta las acciones del motor, guarda en IndexedDB y vigila el reloj.

## Almacenamiento local (IndexedDB `deadline`, v2)

| Almacén | Clave | Índices | Contenido |
|---|---|---|---|
| `meta` | key | — | Valores sueltos (primer arranque, desfase servidor…) |
| `settings` | `device` | — | Ajustes |
| `profile` (v2) | `local` | — | Perfil local, equipamiento, saldo y mérito |
| `catalog` | id | modo, época, categoría, diario | Fichas de catálogo |
| `caseContent` | id | — | JSON completo de expedientes descargados |
| `caseAssets` | caseId | estado | Estado de verificación de recursos offline |
| `investigations` | id | caso, estado | Cada intento de investigación |
| `caseRecords` | caseId | estado, modo | Resumen por caso y recompensas cobradas |
| `notes` | id | caso, actualización | Libreta |
| `dailyLedger` | `ledger` | — | Calendario del jugador y diarios desbloqueados |
| `syncQueue` | opId | próximo intento, entidad | Reservado (vacío) para un futuro servidor |

Migraciones incrementales en `storage/db.ts` (nunca se edita una publicada).
