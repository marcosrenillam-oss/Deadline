# Registro de decisiones

Formato: contexto → decisión → consecuencias. Las marcadas **(pendiente de
confirmar)** necesitan tu visto bueno antes de su etapa.

### D-001 · Monorepo con núcleo compartido
Cliente y servidor deben aplicar las mismas reglas (tiempo, diarios,
condiciones, puntos). → npm workspaces con `@deadline/core` (TS puro, sin
dependencias de navegador) y `apps/web`. El servidor se añadirá como `apps/server`.

### D-002 · React 19 + TypeScript estricto + Vite 8 + vite-plugin-pwa
Stack pedido; versiones estables actuales. TypeScript 7 (compilador nativo).
Consecuencia: `typescript-eslint` aún no soporta TS 7, así que **no hay
ESLint** por ahora; la calidad se apoya en `tsc` estricto
(`noUncheckedIndexedAccess`, `verbatimModuleSyntax`…) y en pruebas.

### D-003 · Estilos: CSS Modules + tokens globales
Sin framework de utilidades: la identidad visual (papel, madera, sellos,
luz) necesita CSS propio. Tokens en `styles/tokens.css`; las preferencias
del usuario (escala de texto, luz, movimiento) se aplican como variables CSS.

### D-004 · Tipografías autoalojadas
Cormorant Garamond (titulares), Courier Prime (documentos mecanografiados),
IBM Plex Sans Condensed (controles, cabe bien en horizontal), Caveat
(anotaciones a mano). Vía `@fontsource`, solo subconjunto latino, precacheadas
para offline. Sin peticiones a terceros.

### D-005 · Contenido como datos + lenguaje de condiciones
Los casos son JSON validados con zod; la lógica dependiente del conocimiento
del jugador se expresa con condiciones/efectos declarativos. Permite validar
estáticamente y simular la resolubilidad de cada caso.

### D-006 · Tiempo dentro de la ficción en minutos relativos al incidente
Funciona igual en el año 64 que en 2096 y evita problemas de calendarios
antiguos. Cada evento lleva además un texto de época.

### D-007 · Acusación con hipótesis de motivo y método que se desbloquean
Para evaluar por criterios (no por texto libre) sin convertirlo en un test
de opciones: las hipótesis aparecen cuando el jugador tiene base para
formularlas, e incluyen hipótesis plausibles pero erróneas. La prueba
definitiva es una evidencia que el jugador ha obtenido.

### D-008 · Cronómetro por marcas de tiempo absolutas
`deadlineAt` fijo; restante = `deadlineAt − ahora`; `lastObservedAt` impide
"devolver" tiempo retrasando el reloj; desfase con servidor estimado tipo NTP.
En cooperativo el servidor fija `startedAt` y `deadlineAt`.

### D-009 · Diarios por día civil local + reconciliación con servidor
Índice = días civiles desde el inicio del calendario (aritmética UTC sobre
Y-M-D, inmune al horario de verano). Nunca se re-bloquea un diario. El
servidor recorta desbloqueos por encima del día civil de UTC+14 en su
instante (máximo legítimo en cualquier huso). La fecha de inicio del
calendario se fijará al lanzar.

### D-010 · IndexedDB para datos, Cache Storage para recursos
Ver `docs/ARCHITECTURE.md`. Verificación por bytes + SHA-256 antes de marcar
un caso como offline.

### D-011 · Actualizaciones de la app a elección del usuario
`registerType: 'prompt'`: nunca se recarga la app en mitad de una
investigación.

### D-012 · Backend propio TS + PostgreSQL **(pendiente de confirmar)**
Ver `docs/BACKEND.md`.

### D-013 · "Precargados" para los 500 diarios **(pendiente de confirmar)**
Interpretación propuesta: los 500 diarios están escritos, validados y
publicados de antemano en paquetes de contenido; la app descarga el texto
de los próximos días por adelantado (p. ej. 30 días) para que el desbloqueo
diario no necesite conexión, y las imágenes por caso. Incluir los 500
completos con imágenes dentro de la app ocuparía cientos de MB y iOS podría
desalojarlos. Nada se genera a diario.

### D-014 · Soluciones en el dispositivo **(a decidir en Etapa 3/5)**
El modo individual offline necesita evaluar la acusación sin servidor, así
que la solución debe estar en el dispositivo. Propuesta: guardar la
solución como resúmenes con sal (el cliente comprueba sin leerla en claro),
el servidor revalida al sincronizar (es quien concede puntos), y en
cooperativo la solución **nunca** llega al cliente antes de acusar. Leer el
JSON solo permitiría hacerse trampas a uno mismo; la clasificación es entre
amigos.

### D-015 · Dificultad en el catálogo pero oculta antes de abrir
El filtro "Dificultad" del archivo solo actúa sobre casos ya abiertos o
resueltos, para respetar que la dificultad no se muestra antes de empezar.
