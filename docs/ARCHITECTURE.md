# Arquitectura

## Visión general

```
┌──────────────────────────── iPhone (PWA standalone, horizontal) ───────────────────────────┐
│  React 19 + TypeScript · React Router · CSS Modules + tokens                               │
│                                                                                             │
│  Escenas (escritorio, archivo, expediente, tablero…)                                        │
│        │                                                                                    │
│  @deadline/core  ← motor de condiciones, validación, cronómetro, diarios, reglas            │
│        │                                                                                    │
│  Repositorios locales ── IndexedDB (idb): progreso, notas, catálogo, contenido, cola sync   │
│                       └─ Cache Storage: imágenes/audio de expedientes verificados (Etapa 4) │
│  Service worker (Workbox): armazón de la app offline                                        │
└───────────────┬───────────────────────────────────────────────┬────────────────────────────┘
                │ HTTPS (REST)                                  │ WebSocket (cooperativo)
┌───────────────▼───────────────────────────────────────────────▼────────────────────────────┐
│  Servidor (Etapa 5–6, pendiente de confirmar proveedor): cuentas Argon2id, sesiones,        │
│  perfiles, amigos, presencia, salas cooperativas con reloj autoritativo, validación de      │
│  acusaciones y puntos, sincronización. Reutiliza @deadline/core.                            │
│  PostgreSQL · CDN de recursos de expedientes                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Principios

1. **El contenido es datos, no código.** Un expediente es un JSON validado por
   esquema. Todo lo que depende de lo que sabe el jugador se expresa con el
   lenguaje de condiciones (`packages/core/src/case/conditions.ts`). Añadir un
   caso no requiere programar.
2. **Separación estricta** entre contenido del expediente, estado de la
   investigación, progreso/recompensas, recursos descargados y datos
   cooperativos (tipos y almacenes distintos).
3. **El tiempo son marcas absolutas.** `deadlineAt` se fija al empezar y el
   restante se calcula siempre como `deadlineAt − ahora` (con blindaje frente
   a relojes que retroceden y corrección con el servidor).
4. **El servidor es la autoridad** sobre puntos, rangos, recompensas cobradas,
   reloj cooperativo y desbloqueo de diarios. El cliente calcula previsiones
   para funcionar offline y las reconcilia al sincronizar.
5. **Offline-first para el modo individual**; el cooperativo exige conexión.
6. **Código compartido** entre cliente y servidor (`@deadline/core`) para que
   las reglas no diverjan.

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
| `profile/profile.ts` | Perfil público, formato de usuario y nº de investigador |
| `sync/queue.ts` | Operaciones idempotentes de la cola de sincronización |

### `apps/web`
| Carpeta | Contenido |
|---|---|
| `app/` | Raíz, router, registro de secciones, puerta de orientación, avisos del SW |
| `scenes/` | Una carpeta por escena (escritorio, secciones, diagnóstico…) |
| `storage/` | IndexedDB (esquema y migraciones), repositorios, persistencia |
| `settings/` | Proveedor de ajustes (lee/escribe IDB y aplica variables CSS) |
| `platform/` | Detección de entorno, hooks de orientación/conexión |
| `ui/` | Primitivas visuales compartidas (superficies, sellos…) |
| `styles/` | Tokens de diseño, tipografías autoalojadas, base |

## Navegación

Rutas con nombres del universo: `/` (escritorio), `/archivo`, `/calendario`,
`/telefono`, `/maquina`, `/lampara`, `/libreta`, `/diagnostico`. El registro
`app/sections.ts` es la fuente única de rutas, nombres y etapa de cada sección.
Las transiciones usan View Transitions cuando el navegador las soporta.

En la Etapa 3 se añadirán `/expediente/:caseId/{dossier,evidencias,sospechosos,cronologia,tablero}`.

## Almacenamiento local (IndexedDB `deadline`, v1)

| Almacén | Clave | Índices | Contenido |
|---|---|---|---|
| `meta` | key | — | Valores sueltos (primer arranque, desfase servidor…) |
| `settings` | `device` | — | Ajustes |
| `catalog` | id | modo, época, categoría, diario | Fichas de catálogo |
| `caseContent` | id | — | JSON completo de expedientes descargados |
| `caseAssets` | caseId | estado | Estado de verificación de recursos offline |
| `investigations` | id | caso, estado | Cada intento de investigación |
| `caseRecords` | caseId | estado, modo | Resumen por caso y recompensas cobradas |
| `notes` | id | caso, actualización | Libreta |
| `dailyLedger` | `ledger` | — | Registro de diarios desbloqueados |
| `syncQueue` | opId | próximo intento, entidad | Cola de sincronización |

Migraciones incrementales en `storage/db.ts` (nunca se edita una publicada).
