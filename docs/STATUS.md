# Estado del proyecto

Última actualización: Etapa 4.

## Etapas

| Etapa | Estado |
|---|---|
| 1 · Arquitectura y estructura | Completada; adaptada a local-first (ver `LOCAL_FIRST.md`) |
| 2 · The Detective's Desk | **Completada** (pendiente de prueba en iPhone físico) |
| 3 · Motor de expedientes | **Completada** con un expediente completo (pendiente de prueba en iPhone físico) |
| 4 · Cronómetros, guardado y offline | Reglas puras listas; integración pendiente |
| 5 · ~~Cuentas y backend~~ → Perfil local y copias | Perfil local y exportar/importar **hechos**; no habrá cuentas (D-016) |
| 6 · Cooperativo | Diseño sin servidor en `COOP.md`; implementación pendiente |
| 7 · Progresión y personalización | Cosméticos de serie y equipamiento **hechos**; puntos, logros y desbloqueos pendientes |
| 8 · Contenido, optimización y pruebas | Pendiente |

## Implementado y probado

### Etapa 1
- Monorepo, TypeScript estricto, esquema y validador de expedientes,
  condiciones, cronómetro, calendario diario, rangos, ajustes, IndexedDB,
  PWA con armazón offline, zonas seguras, aviso de giro, diagnóstico.

### Cambio a local-first
- IndexedDB v2 (almacén `profile`) con migración desde v1.
- Perfil local con número de investigador y letra de control.
- Calendario diario que empieza el día del primer arranque.
- **Archivo personal**: exportar (hoja de compartir o descarga), importar
  con vista previa, fusionar o reemplazar, suma SHA-256, aviso de copia
  antigua, estado del almacenamiento y solicitud de persistencia.
- Publicación en GitHub Pages: subruta configurable, `404.html`,
  `.nojekyll`, flujo de GitHub Actions (**preparado; requiere que lo actives**).

### Etapa 2 · The Detective's Desk
- Mesa cenital a pantalla completa: madera generada en el dispositivo, vade
  de cuero, luz de lámpara con caída cinematográfica y polvo en el haz.
- Seis objetos interactivos que son el menú: carpeta (archivo), calendario
  (diario), teléfono (pareja), máquina de escribir (historial), lámpara
  (ajustes), libreta (notas). Respuesta al toque, animación propia de cada
  objeto al abrirse (la carpeta se abre, la hoja se arranca, el auricular se
  levanta, el carro se desplaza, la libreta se abre, la lámpara parpadea),
  sonido y háptico.
- Datos reales sobre la mesa: fecha y diario del día en el calendario,
  actividad y estado de conexión en la hoja de la máquina, nº de notas en
  la libreta, rango y nº de investigador en la placa.
- Cadenita de la lámpara: enciende/apaga la luz de la oficina (persistente).
- Nota de bienvenida opcional (sin tutorial obligatorio) que se puede retirar
  y volver a poner.
- Ajustes completos (Lámpara): luz, sonido (efectos y ambiente sintetizados),
  tacto, lectura, oficina, archivo personal.
- Personalización inicial: mesa (3), lámpara (2), teléfono (2), máquina (2),
  libreta (2), objeto personal (3). Cambia materiales, nunca la composición.
- Escalado a cualquier pantalla horizontal con unidades de contenedor,
  respetando zonas seguras.

### Etapa 3 · Motor de expedientes
- Motor puro: examinar, detalles ocultos (texto e imagen), interrogar con
  respuestas condicionadas, relacionar piezas, señalar contradicciones,
  pistas en tres niveles con límite y penalización, acusación por criterios,
  finales alternativos, cronología comparada, cierre por tiempo, puntuación
  sin recompensas duplicadas.
- Compilador de contenido (`npm run content`): recursos generados, huellas
  SHA-256, validación y publicación del catálogo.
- **DL-I-0001 «Revelado en negro»** (Londres, 1987; detective): víctima,
  4 sospechosos y 1 testigo, 16 evidencias, 23 detalles ocultos, 6
  deducciones, 5 contradicciones, 4 secretos, 4 interrogatorios ramificados
  (36 preguntas), 15 eventos de cronología (3 falsos), 4 líneas de pista, 4
  objetivos (1 oculto) y 7 finales. Validado: 0 errores, 0 avisos.
- Interfaz: biblioteca con búsqueda y filtros; portada precintada (la
  dificultad no se ve hasta abrir); expediente; evidencias con lupa, zoom,
  destacar/descartar, asociar y relacionar; personas con ficha, relaciones,
  secretos y declaraciones; interrogatorios por temas con transcripción;
  cronología ordenable con fichas, anotaciones, vínculos y marcas de duda;
  tablero de corcho (añadir, mover, conectar con hilo, quitar, zoom,
  desplazar); libreta dentro del caso y en el escritorio; herramienta de
  contradicciones; pistas; acta de acusación; informe final completo; modo
  archivo tras cerrar con lo omitido marcado.
- Puntos al perfil local al resolver.

### Etapa 4 · Cronómetros, cierre, reapertura, guardado y offline
- Cronómetro por marcas de tiempo con avisos a 10, 5 y 1 minuto, aviso si
  el reloj del dispositivo retrocede y registro cada 30 s del instante más
  tardío visto (retrasar el reloj no devuelve tiempo aunque no se juegue).
- Tocar el reloj **tapa** el expediente; el tiempo sigue corriendo.
- Cierre automático al agotarse el tiempo: se cobran los descubrimientos (no
  la acusación) y el expediente queda en modo archivo.
- **Reapertura** pagando puntos (150 / 300 / 500 según dificultad), en una
  transacción: reloj nuevo; se conservan evidencias, detalles, hechos,
  fichas, deducciones, tablero, cronología y notas; las conversaciones se
  reinician. Historial de intentos por expediente.
- Guardado inmediato de cada acción; los cambios rápidos (arrastrar en el
  tablero) se agrupan y se fuerzan al ocultar o cerrar la app. Aviso si una
  escritura falla.
- **Descarga verificada** por expediente: huella del JSON contra el
  catálogo, tamaño y SHA-256 de cada recurso, reintentos con espera,
  reanudación, Cache Storage compartida con el service worker, URLs con
  huella de versión. «Disponible sin conexión» solo con todo verificado.
- Al arrancar se comprueba lo descargado (iOS puede borrarlo) y se
  precargan los diarios de los próximos 7 días. Comprobación a fondo desde
  Ajustes → Archivo.
- Se pide almacenamiento persistente al descargar el primer expediente.
- **Calendario**: caso del día, días anteriores, progreso de los 500,
  fecha de desbloqueo; los diarios pasados entran en la biblioteca.
- **DL-D-0001 «Cenizas en el Celio»** (Roma, 64 d. C.; inspirado en hechos
  reales, con hechos documentados, hipótesis y recreación separados y
  fuentes citadas): 3 sospechosos y 2 testigos, 9 evidencias, 3
  deducciones, 3 contradicciones, 3 interrogatorios, 6 finales. Validado:
  0 errores, 0 avisos.

## Pruebas

- `@deadline/core`: 61 pruebas (validador, condiciones, motor, acusación y
  puntuación, cronómetro, diarios, rangos, ajustes, perfil, cosméticos,
  copias de seguridad).
- `@deadline/web`: 9 pruebas (IndexedDB, ajustes, perfil, calendario,
  exportar → restaurar en otro dispositivo, fusionar/reemplazar).
- E2E (Chromium emulando iPhone 15): 37 comprobaciones — objetos de la mesa,
  zonas seguras simuladas, nota de bienvenida, lámpara persistente,
  navegación por objetos, ajustes persistentes, material de la mesa,
  exportar/importar/rechazar copia manipulada, IndexedDB v2, 404, service
  worker, arranque offline, giro a vertical y vuelta.
- E2E del caso (Chromium, iPhone 15 en horizontal): 25 comprobaciones —
  resolver «Revelado en negro» de principio a fin solo con la interfaz
  (lupa en texto e imagen, relacionar, interrogar, contradicción,
  confrontación, cronología, tablero, acusación, final con confesión,
  informe, modo archivo, reflejo en archivo y escritorio).
- E2E de la Etapa 4 (reloj simulado): 20 comprobaciones — aviso del diario
  en la mesa, calendario, origen real, aviso de 10 minutos sin jugar, tapar
  sin pausar, cierre automático a los 60 minutos, cobro de descubrimientos,
  reapertura pagando 150 puntos con reloj nuevo y descubrimientos
  conservados, descarga verificada, apertura sin conexión con imágenes,
  detección de recursos borrados por el sistema.
- Build con `DEADLINE_BASE=/Deadline/`: navegación, alcance del service
  worker, manifiesto, iconos y enlace profundo sin conexión verificados.

## No probado todavía

- **iPhone físico**: Safari/WebKit real, notch real, instalación, hápticos
  de iOS, hoja de compartir, audio con modo silencio, rendimiento de las
  capas de luz y del `canvas` de madera.
- Publicación real en GitHub Pages (el flujo está escrito; hay que activarlo).
- WebKit automatizado (no disponible en el entorno de desarrollo).

## Errores conocidos / deuda

- Sin ESLint (incompatible con TypeScript 7 por ahora).
- `npm audit`: avisos moderados en dependencias de compilación de
  `workbox-build`; no llegan al bundle.
- Bundle JS ≈ 140 KB gzip; revisar `zod/mini` en la Etapa 8.
- Un cambio de ajustes hecho milisegundos antes de cerrar a la fuerza la app
  podría no llegar a guardarse (escritura asíncrona en IndexedDB).
- Diario, pareja e historial siguen siendo pantallas que indican su etapa.
- **Arte provisional:** retratos en silueta y evidencias gráficas
  esquemáticas. Faltan retratos y fotografías con calidad final (Etapa 8;
  necesita decidir una fuente de imágenes sin coste).
- **Riesgo de bloqueo en la reapertura:** si un jugador cierra un caso sin
  descubrir casi nada y no tiene otros casos que resolver, puede no llegar a
  los puntos de la reapertura. Con 2 expedientes publicados es posible.
  Opciones a decidir: saldo inicial, primera reapertura gratis o coste
  menor. No lo he cambiado por mi cuenta.
- Solo hay un diario escrito: del día 2 en adelante el calendario dice
  honestamente «en redacción».
- La descarga de un expediente con muchas imágenes no se ha medido aún en
  un iPhone (los dos casos actuales pesan pocos KB).
- Música por época: no hay piezas todavía.
- Falta `apple-touch-startup-image` horizontal.
