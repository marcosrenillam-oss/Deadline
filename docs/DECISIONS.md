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

### D-012 · Backend propio TS + PostgreSQL — **SUSTITUIDA por D-016**
Propuesta archivada en `docs/BACKEND.md` para una posible versión futura.

### D-013 · "Precargados" para los 500 diarios — **resuelta por D-016/D-018**
Interpretación propuesta: los 500 diarios están escritos, validados y
publicados de antemano en paquetes de contenido; la app descarga el texto
de los próximos días por adelantado (p. ej. 30 días) para que el desbloqueo
diario no necesite conexión, y las imágenes por caso. Incluir los 500
completos con imágenes dentro de la app ocuparía cientos de MB y iOS podría
desalojarlos. Nada se genera a diario.

### D-014 · Soluciones en el dispositivo **(a decidir en Etapa 3)**
Actualización (D-016): sin servidor no hay revalidación ni custodia de
soluciones cooperativas. Se mantiene la idea de guardar la solución como
resúmenes con sal para que no se lea por accidente; leer el código publicado
seguirá siendo posible para quien lo busque.

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

---

## Estrategia local-first (cambio de producto)

### D-016 · Primera versión sin servidor ni costes recurrentes
Requisito del producto: compartir DEADLINE con un grupo reducido sin pagar
infraestructura. → Aplicación estática local-first: todo el estado en
IndexedDB, sin cuentas, sin servidor, sin servicios externos. Detalle y
limitaciones en `LOCAL_FIRST.md`.

### D-017 · Distribución por GitHub Pages con GitHub Actions
Repositorio público → Pages gratuito, HTTPS incluido, actualizaciones con
cada publicación. Compilación con `DEADLINE_BASE=/Deadline/` y `404.html`
como respaldo de rutas. Ver `DISTRIBUTION.md`. Riesgo principal: el límite
de ≈ 1 GB del sitio frente a 3 000 casos con imágenes.

### D-018 · Calendario diario por jugador
El día 1 de cada jugador es el de su primer arranque (no hay fecha común
sin servidor). El registro vive en IndexedDB y viaja con las copias.

### D-019 · Perfil local
Número de investigador `DL-00000-X` generado en el dispositivo con letra de
control (detecta erratas al copiarlo). Alias opcional para el cooperativo.
Sin contraseñas: no hay nada que proteger en un servidor.

### D-020 · Copias de seguridad exportables
Archivo JSON versionado con SHA-256; importar con fusión (sin duplicar
recompensas) o reemplazo. Se prepara de antemano para que iOS permita abrir
la hoja de compartir dentro del gesto del usuario.

### D-021 · Cooperativo sin servidor: mesa compartida y correspondencia
Ver `COOP.md`. No se simula tiempo real.

### D-022 · Sonido sintetizado en el dispositivo
Efectos (papel, teclas, timbre, interruptor, sello) y ambientes (lluvia,
ciudad de noche) generados con Web Audio: sin archivos, sin descargas ni
licencias. La música por época queda para cuando haya piezas; mientras,
no hay control de música (no se muestra un control sin efecto).

### D-023 · Hápticos como mejora progresiva
Vibration API donde existe; en iOS 18+ el "tic" del interruptor del sistema
(`<input type="checkbox" switch>`). Sin soporte, silencio. [verificar en iPhone]

### D-024 · La mesa se dibuja con código, no con imágenes
Objetos en SVG/CSS y madera generada en un `<canvas>` del dispositivo:
nítidos en cualquier pantalla, personalizables por material y casi sin peso
de descarga (importante para el límite de tamaño de GitHub Pages).

### D-025 · No pintar hasta leer los ajustes
La app espera a leer los ajustes de IndexedDB (milisegundos) antes de pintar,
para que la mesa no aparezca un instante con valores por defecto.

### D-026 · Ambiente "radio" retirado del esquema de ajustes
Se eliminó la opción `radio` (no publicada) porque no hay forma de
sintetizarla con calidad; los ajustes antiguos se normalizan solos.

---

## Etapa 3 · Motor de expedientes

### D-027 · Expedientes escritos en TypeScript y compilados a JSON
`case.ts` se comprueba con el compilador mientras se escribe (autocompletado
de campos, errores de forma al momento) y `scripts/build-content.ts` lo
convierte en `case.json`, calcula huellas de los recursos y valida. El
contenido sigue siendo datos: no hay lógica de caso en código.

### D-028 · Motor puro y separado de la interfaz
`packages/core/src/engine`: examinar, advertir detalles, preguntar,
relacionar piezas, señalar contradicciones, pedir pistas, acusar, cerrar por
tiempo. Funciones puras probadas sin navegador; la interfaz solo las invoca.

### D-029 · Pruebas visuales dibujadas como lo haría la policía
Sin presupuesto de arte, las evidencias gráficas del primer caso son
piezas que en la ficción también son dibujos o esquemas: un croquis
policial y una hoja de contactos con fotogramas esquemáticos, generados por
código (SVG, pocos KB). Los retratos son siluetas de ficha generadas por
código y lo dicen: no fingen ser fotografías. La producción de retratos e
imágenes realistas queda para la Etapa 8 (ver STATUS).

### D-030 · Relacionar piezas
Una deducción se reconoce si las piezas elegidas incluyen todas las suyas y
sobra como mucho una. Así no hace falta acertar la combinación exacta, pero
seleccionarlo todo no funciona.

### D-031 · La acusación puntúa una vez por expediente
Los puntos de acusación y de descubrimientos se cobran solo la primera vez
(`rewardedKeys`). Repetir un caso resuelto no suma; perder no impide cobrar
más tarde lo que no se cobró.

### D-032 · Cronología con versiones falsas
Las declaraciones de los sospechosos generan fichas de cronología que pueden
ser falsas. Si el jugador las coloca sin marcarlas como dudosas, restan
precisión. La hora de cada ficha es visible: la dificultad está en saber
qué es cierto, no en adivinar el orden.

### D-033 · Navegación del expediente como separadores de archivador
Carril izquierdo con las cinco secciones, libreta, contradicción, pistas y
acusación siempre a mano; reloj arriba. Sin cabecera convencional. Cabe en
un iPhone en horizontal con objetivos táctiles de 44 pt.

---

## Etapa 4 · Cronómetros, reapertura y offline

### D-034 · Tapar no es pausar
El reloj se puede tapar (tocándolo) para ocultar el expediente, pero nunca
se detiene: así lo pide el diseño y así se le dice al jugador.

### D-035 · Lo descubierto se cobra también al agotarse el tiempo
Antes, cerrar por tiempo daba 0 puntos. Ahora se cobran los descubrimientos
(una sola vez), nunca la acusación. Motivo: sin esto, un jugador que agota
el tiempo en su primer caso no podría pagar nunca una reapertura.

### D-036 · Qué conserva una reapertura
Evidencias, detalles, hechos, fichas de cronología, deducciones, tablero,
cronología del jugador y notas. Se reinician preguntas, contradicciones,
secretos y marcas: hay que volver a interrogar. Encaja con «se mantienen
las evidencias y notas» sin regalar la resolución.

### D-037 · Descargas con verificación y caché compartida
El gestor de descargas escribe en la misma Cache Storage que consulta el
service worker (CacheFirst para recursos, NetworkFirst para JSON). Las URLs
de recursos llevan la huella del contenido (`?v=`) para que una corrección
publicada no conviva con una copia antigua. El armazón de la app no
precachea `content/`.

### D-038 · Precarga de diarios
Se descargan por adelantado los diarios de los próximos 7 días cuando hay
conexión, de modo que el desbloqueo diario no depende de tenerla.

---

## Etapas 5 y 6 · Perfil local y cooperativo sin servidor

### D-039 · La placa de la mesa abre la ficha del investigador
El perfil no tenía objeto propio en la mesa; la placa de latón con el rango
y el número es su sitio natural.

### D-040 · Retrato: silueta o foto, siempre local
La foto se recorta y reduce en el dispositivo (240 × 288, JPEG) y se
muestra virada al tono del archivo. No sale del dispositivo salvo en las
copias que exporte el jugador.

### D-041 · Compartir es explícito y por categorías
En el cooperativo nada se sincroniza solo: cada jugador decide qué pone
sobre la mesa o qué incluye en un informe. Es lo que da sentido a la
información dividida y evita que el reparto sea decorativo.

### D-042 · Formato DL1 con firma de partida
Los códigos se comprimen y se firman con una clave aleatoria de 256 bits
que viaja en la invitación. La firma detecta mezclas de partidas y errores
al copiar; no protege frente a quien tenga la invitación (no se pretende).

### D-043 · El reloj de la pareja empieza cuando el invitado dice «Preparado»
El anfitrión alinea su reloj al importar el código de aceptación. Así ambos
tienen el mismo límite sin servidor, a costa de que el anfitrión pierda el
tiempo que tarde en recibir el código.

### D-044 · Mesa compartida: se puntúa una vez, con lo que sabe el equipo
Las dos carpetas se cierran con la misma acusación, pero los puntos se
calculan una sola vez sobre el conocimiento unido, para no duplicar mérito
en el mismo perfil.

### D-045 · Una acción propia nunca entrega una pieza del compañero
En información dividida, si una pregunta o un detalle de A desbloquearía una
evidencia de B, A no la recibe: tendrá que pedírsela. El contenido debe
diseñarse con esto en cuenta; el validador avisa si un papel puede resolver
solo.

---

## Etapa 7 · Progresión y personalización

### D-046 · La primera reapertura de cada expediente es gratuita
Decisión del usuario para evitar que alguien sin puntos quede atascado. Las
siguientes reaperturas cuestan 150 / 300 / 500 según dificultad. Se guarda
el contador `reopens` en el registro del caso (al fusionar copias gana el
mayor). Se mantiene D-035 (lo descubierto se cobra al agotarse el tiempo),
también por decisión del usuario.

### D-047 · Estadísticas calculadas, nunca acumuladas
Se recalculan a partir de investigaciones y registros guardados. No pueden
desincronizarse y una copia importada las recompone sola. En la mesa
compartida se cuenta una vez por partida (`coopSessionId`).

### D-048 · Los rangos usan todos sus criterios
Antes la placa solo miraba el mérito. Ahora cuentan mérito, actas
impecables, precisión del culpable en las últimas 20 acusaciones y casos
resueltos por dificultad, tal como se definieron en la Etapa 1. La ficha
muestra cuánto falta en cada criterio.

### D-049 · Los logros dan puntos gastables, no mérito
El mérito (y por tanto el rango) solo sale de resolver casos. Los premios
de logros van al saldo, que se gasta en reabrir casos y en piezas de la
oficina. 28 logros, 5 de ellos secretos (no muestran nombre ni condición).

### D-050 · Piezas de oficina: puntos, logros o rangos
Las de puntos se compran (Lámpara → Oficina, transacción atómica); las de
logros y rangos se conceden solas al conseguirlos. Las bloqueadas se ven
con su condición; nunca se pueden equipar.

### D-051 · Clasificación solo entre amigos, por tarjetas
Sin servidor no hay clasificación global ni verificable. Cada fila es la
última tarjeta de investigador que te pasaron (código DL1); se sustituye
solo por una más reciente, la tuya no se puede añadir y la pantalla dice
que son datos declarados. Viaja en las copias de seguridad.

### D-052 · Avisos de progresión en una sola capa
Logros, ascensos y piezas nuevas se anuncian con una tira mecanografiada
en la parte superior, sea cual sea la pantalla, de una en una y tocable
para cerrar. Al arrancar se reevalúan los logros globales (útil tras
importar una copia); los de cierre (detalles, contradicciones, preguntas)
solo al cerrar, porque necesitan el expediente.

### D-053 · Carga diferida por pantallas
La mesa va en el paquete inicial; el resto de pantallas se descargan al
abrirlas y el service worker las precachea. El JS inicial pasa de 199 KB a
~166 KB comprimidos.
