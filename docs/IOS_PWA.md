# iOS PWA: limitaciones reales y cómo las tratamos

Lo marcado **[verificar]** debe comprobarse en un iPhone físico (Etapa 8 y
antes, en cuanto haya un despliegue HTTPS). Nada de esto se ha probado aún
en un iPhone real: las pruebas automáticas usan Chromium emulando un iPhone.

| Tema | Realidad en iOS | Decisión en DEADLINE |
|---|---|---|
| **Orientación** | Safari/PWA en iOS **ignora** `orientation` del manifiesto y no soporta `screen.orientation.lock()`. No se puede forzar horizontal. | Diseño horizontal; en vertical se superpone una invitación a girar **sin desmontar la app** (no se pierde estado). |
| **Pantalla completa / notch** | Con `viewport-fit=cover` y `black-translucent` el contenido se dibuja detrás de la barra de estado y del notch/Dynamic Island. | Fondo de borde a borde; textos y controles dentro de `env(safe-area-inset-*)` con un margen mínimo. **[verificar]** con el notch a izquierda y derecha. |
| **Barra de estado en horizontal** | En iPhone en horizontal iOS oculta la barra de estado; el inset relevante es el lateral (notch) y el inferior (indicador de inicio). | Tokens `--pad-*` combinan inset y margen mínimo. |
| **Service worker** | Soportado; requiere HTTPS (o localhost). El SW puede detenerse en segundo plano. | El armazón se precachea; actualización a elección del usuario. |
| **Almacenamiento** | IndexedDB y Cache Storage disponibles, pero iOS puede **desalojar** datos de webs/PWAs poco usadas y la cuota es limitada. `navigator.storage.persist()` no garantiza nada. | Se solicita persistencia; se re-verifican recursos antes de jugar offline; el progreso se sincroniza con el servidor. Un caso solo se marca "disponible offline" tras verificar bytes + SHA-256. |
| **Almacenamiento separado** | La PWA instalada y Safari tienen almacenamiento **distinto**. | La sesión se inicia dentro de la app instalada; los datos se recuperan del servidor. |
| **Temporizadores en segundo plano** | JS se congela al bloquear o salir. | El cronómetro usa marcas absolutas (`deadlineAt − ahora`). |
| **Vibración** | **iOS no soporta la Vibration API** (`navigator.vibrate`). | Hápticos: en Safari 18+ alternar un `<input type="checkbox" switch>` produce una respuesta háptica del sistema; se evaluará en la Etapa 2 como mejora progresiva. **[verificar]**. Si no es fiable, el ajuste de vibración solo tendrá efecto en dispositivos compatibles y se indicará así. |
| **Audio** | El audio necesita un gesto del usuario para empezar; el interruptor de silencio afecta a parte del audio web. | El audio se inicia tras el primer toque en el escritorio (Etapa 2/7). **[verificar]** comportamiento con modo silencio. |
| **Notificaciones push** | Existen en iOS 16.4+, pero el producto **no** las usa. | Sin push. |
| **Gestor de contraseñas** | Funciona en PWA con los `autocomplete` correctos. | Formularios con `username` / `new-password` / `current-password` (Etapa 5). **[verificar]**. |
| **Zoom y gestos** | iOS ignora `user-scalable=no`. El doble toque puede hacer zoom. | `touch-action: manipulation` global; los gestos de zoom de evidencias se gestionan dentro de su visor. |
| **Rebote elástico** | El *overscroll* puede mover toda la página. | `overscroll-behavior: none` y raíz `position: fixed`. |
| **Pantalla de carga** | iOS usa `apple-touch-startup-image` (una imagen por tamaño y orientación). | Pendiente: generar imágenes de arranque horizontales (Etapa 8). Mientras, el fondo es color tinta sin destello blanco. |

## Cómo probar en iPhone

1. Desplegar la build en un dominio HTTPS (previsualización).
2. Abrir en Safari → Compartir → Añadir a pantalla de inicio.
3. Abrir desde el icono y entrar en *Diagnóstico técnico*: comprobar modo
   standalone, zonas seguras (`↑ → ↓ ←`), IndexedDB, service worker y
   almacenamiento.
4. Girar a vertical y volver; bloquear y desbloquear; activar modo avión y
   reabrir la app.
