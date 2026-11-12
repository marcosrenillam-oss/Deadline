# Estado del proyecto

Última actualización: Etapa 1.

## Etapas

| Etapa | Estado |
|---|---|
| 1 · Arquitectura y estructura | **Completada** (pendiente de prueba en iPhone físico) |
| 2 · The Detective's Desk | Pendiente |
| 3 · Motor de expedientes | Modelo de datos y validador listos; interfaz pendiente |
| 4 · Cronómetros, guardado y offline | Reglas puras listas (cronómetro, diarios, cola); integración pendiente |
| 5 · Cuentas y backend | Propuesta escrita; **requiere tu confirmación** |
| 6 · Cooperativo online | Pendiente |
| 7 · Progresión y personalización | Definición de rangos y reglas base; pendiente |
| 8 · Contenido, optimización y pruebas | Pendiente |

## Implementado y probado

- Monorepo npm workspaces (`@deadline/core`, `@deadline/web`), TS estricto.
- Esquema completo de expedientes (zod) y ficha de catálogo.
- Lenguaje de condiciones/efectos y modelo de conocimiento del jugador.
- Validador de expedientes: esquema + integridad + simulación de resolubilidad.
- Modelo de estado del jugador: investigación (intento), registro por caso con
  recompensas cobradas, tablero, cronología del jugador, notas.
- Cronómetro por marcas de tiempo con blindaje de reloj y desfase de servidor.
- Calendario de diarios con registro anti-retroceso y reconciliación.
- Rangos (6 niveles), reglas base de puntos/reapertura/penalización de pistas.
- Ajustes con valores por defecto tolerantes; se aplican a la interfaz
  (escala de texto, luz, tono, reducción de animaciones).
- IndexedDB v1 con 10 almacenes, índices y migraciones.
- PWA: manifiesto, iconos, service worker (armazón offline), aviso de
  actualización a elección del usuario.
- Viewport `viewport-fit=cover`, zonas seguras, raíz fija sin rebote.
- Invitación a girar en vertical sin desmontar la app.
- Navegación entre secciones (pantallas que declaran su etapa, sin simular
  funcionalidad), página 404 temática.
- Pantalla de diagnóstico técnico real (modo, zonas seguras, IndexedDB,
  almacenamiento, persistencia, service worker, prueba de escritura).

## Pruebas

- `@deadline/core`: 34 pruebas unitarias (validador, condiciones, cronómetro,
  diarios, rangos, ajustes, utilidades).
- `@deadline/web`: 5 pruebas (IndexedDB con fake-indexeddb, ajustes).
- E2E (Chromium emulando iPhone 15): 18 comprobaciones — carga horizontal,
  sin desbordamiento, zonas seguras simuladas, navegación, diagnóstico,
  IndexedDB, 404, service worker, **arranque y navegación offline**, aviso de
  giro en vertical y recuperación al girar, sin errores de consola.

## No probado todavía

- **iPhone físico** (Safari/WebKit real, notch real, instalación, modo
  standalone, desalojo de almacenamiento). Necesita un despliegue HTTPS.
- WebKit en automatizado (no está instalado en este entorno; solo Chromium).

## Errores conocidos / deuda

- Sin ESLint (incompatible con TypeScript 7 por ahora).
- `npm audit` informa de avisos moderados en dependencias de compilación de
  `workbox-build` (deepmerge, glob, minimatch). No llegan al bundle de la app;
  se revisarán cuando haya versiones corregidas.
- Bundle JS ≈ 138 KB gzip (zod v4 completo incluido). Se valorará `zod/mini`
  o carga diferida en la Etapa 8.
- Falta `apple-touch-startup-image` horizontal.
- El escritorio actual es un índice provisional (lo sustituye la Etapa 2).
