# Backend: propuesta archivada para el futuro

> **Estado: ARCHIVADA.** Por decisión de producto (D-016), la primera
> versión de DEADLINE no tiene servidor ni costes recurrentes: ver
> `LOCAL_FIRST.md`, `DISTRIBUTION.md` y `COOP.md`. Este documento se
> conserva como referencia por si en el futuro se quiere añadir cuentas,
> cooperativo en tiempo real o clasificaciones verificadas. Los precios eran
> orientativos y habría que verificarlos de nuevo.

## Requisitos que condicionan la elección

- Registro **solo con usuario + contraseña** (sin email ni teléfono), hash
  **Argon2id**, **código de recuperación** propio.
- **Cooperativo en tiempo real** con **reloj autoritativo del servidor**,
  **información dividida real** (el servidor no envía a un jugador lo que no
  le corresponde), 5 minutos de reconexión, anti-duplicado de recompensas.
- **Puntos, rangos y recompensas validados en servidor**.
- Clasificación **solo entre amigos**, presencia online.
- Sincronización offline-first con cola idempotente.

## Opciones evaluadas

| | Firebase | Supabase | Servidor propio TS + PostgreSQL |
|---|---|---|---|
| Auth usuario+contraseña sin email | No nativo: hay que emular emails o usar *custom tokens* desde Functions | No nativo (GoTrue usa email/teléfono, bcrypt). Se puede emular con emails ficticios o con auth propia en Edge Functions | Nativo: diseño propio con Argon2id y código de recuperación |
| Argon2id | Solo con auth propia en Functions | Solo con auth propia | Sí (`argon2` nativo en Node) |
| Tiempo real | Firestore/RTDB listeners | Realtime (broadcast/presence/cambios en BD) | WebSocket propio |
| Reloj autoritativo y lógica de partida | Cloud Functions (sin estado, arranques en frío) | Edge Functions + timestamps de BD | Proceso de sala con estado en memoria + persistencia |
| Información dividida | Reglas de seguridad por documento | RLS por fila | Filtrado explícito en el servidor de salas |
| Modelo de datos | NoSQL (amigos/clasificaciones incómodos) | PostgreSQL | PostgreSQL |
| Coste | Pago por lectura/escritura: un tablero cooperativo que sincroniza movimientos genera muchas escrituras | Plan gratuito con pausas por inactividad; Pro ≈ 25 $/mes por proyecto + uso | Contenedor pequeño ≈ 5–15 $/mes + PostgreSQL gestionado ≈ 0–25 $/mes |
| Dependencia del proveedor | Alta | Media (Postgres estándar) | Baja |
| Esfuerzo de desarrollo/operación | Bajo en CRUD, alto en la lógica de partida | Bajo en CRUD, medio en la lógica de partida | Mayor: hay que escribir auth, API y operar (copias, monitorización) |

## Recomendación

**Servidor propio en TypeScript (Fastify + WebSocket) con PostgreSQL gestionado,
desplegado en una plataforma de contenedores (p. ej. Fly.io o Railway) y
recursos de expedientes en un almacenamiento de objetos con CDN (p. ej.
Cloudflare R2, sin coste de salida).**

Por qué:
1. Los dos requisitos más delicados (auth sin email con Argon2id y partida
   cooperativa con reloj autoritativo e información dividida) **no encajan en
   los servicios gestionados**: en Firebase o Supabase acabaríamos escribiendo
   igualmente un servidor propio en Functions, con peores herramientas para
   mantener estado de sala.
2. **Reutiliza `@deadline/core`**: el servidor valida acusaciones, puntos,
   diarios y tiempos con exactamente las mismas reglas que el cliente.
3. PostgreSQL es estándar y portable: se puede mover de proveedor sin reescribir.
4. Coste bajo y predecible al empezar.

Contrapartida honesta: hay más trabajo de backend y de operación
(migraciones, copias de seguridad, monitorización, límites de peticiones).

Alternativa razonable si prefieres menos operación: **Supabase como
PostgreSQL + Realtime**, con la autenticación y la lógica de partida en un
servicio propio pequeño. Reduce algo la operación, pero mantiene dos piezas.

## Coste estimado (orientativo, a verificar)

| Usuarios activos/mes | Infraestructura | Estimación mensual |
|---|---|---|
| Desarrollo / beta (< 500) | 1 instancia pequeña + Postgres básico + R2 | 5 – 30 $ |
| ~10 000 | 2 instancias + Postgres con copias + CDN | 40 – 120 $ |
| ~100 000 | Varias instancias, Redis para presencia/salas, Postgres mayor | 250 – 800 $ |

Lo que más pesa: tamaño de imágenes de expedientes (mitigado con WebP/AVIF,
reutilización y CDN sin coste de salida), número de partidas cooperativas
simultáneas y copias de seguridad. Ningún plan gratuito se asume permanente.

## Seguridad prevista (Etapa 5)

- Argon2id con parámetros OWASP vigentes; pimienta en variable de entorno.
- Código de recuperación: alta entropía, mostrado una sola vez, almacenado
  con hash; regenerable al usarse.
- Sesiones: token de acceso corto + token de renovación opaco rotatorio
  (almacenado con hash, revocable). Cookie `HttpOnly; Secure; SameSite=Strict`
  cuando el dominio lo permita.
- Limitación de intentos por usuario e IP; mensajes de error que no revelan
  si el usuario existe en el login.
- Ningún secreto en el frontend. Toda operación de puntos, rangos y
  recompensas se valida en el servidor.
- Los formularios usan `autocomplete="username"` / `new-password` /
  `current-password` para el gestor de contraseñas de iOS.
