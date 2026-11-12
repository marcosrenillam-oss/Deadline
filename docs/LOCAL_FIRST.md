# DEADLINE local-first: sin servidor y sin cuotas

> Decisión de producto (D-016): la primera versión de DEADLINE se distribuye
> como una aplicación estática, sin cuentas, sin servidor y sin base de datos
> remota. Todo el juego funciona en el dispositivo.

## Qué cambia respecto a la Etapa 1

| Pieza de la Etapa 1 | Qué pasa ahora | Por qué |
|---|---|---|
| React + TS + Vite + PWA | **Se mantiene** | Ya era estático. |
| IndexedDB y sus almacenes | **Se mantiene**, + almacén `profile` (migración v1→v2) | El dispositivo es ahora la única fuente de verdad. |
| Esquema de expedientes, validador, motor de condiciones | **Se mantiene** sin cambios | No dependía del servidor. |
| Cronómetro por marcas de tiempo | **Se mantiene**; el desfase con servidor queda a 0 | El blindaje contra relojes que retroceden sigue activo. |
| Calendario de diarios | **Cambia**: empieza el día del primer arranque de cada jugador | No hay servidor que fije una fecha común. Así nadie "pierde" los primeros diarios. |
| Reconciliación de diarios con servidor | **Se conserva sin uso** (`reconcileDailyLedger`) | Lista para una futura versión con servidor. |
| Cola de sincronización (`syncQueue`) | **Se conserva vacía** | Evita una migración de datos si algún día hay backend. |
| Perfil de servidor (usuario único, Argon2id, código de recuperación) | **Se sustituye** por un perfil local | Sin cuentas no hay contraseñas que proteger; la recuperación es la copia exportada. |
| Puntos, rangos, logros | **Locales** (misma lógica, el dispositivo es la autoridad) | Ver limitaciones. |
| Amigos, presencia, clasificación verificada | **Requieren servidor** → aplazadas; alternativa local en la Etapa 7 | Ver `COOP.md`. |
| Cooperativo en tiempo real | **Se sustituye** por dos modalidades sin servidor | Ver `COOP.md`. |
| `docs/BACKEND.md` | **Archivado** como propuesta futura | Sigue siendo válido si un día se quiere servidor. |

Nada de lo construido se ha eliminado.

## Limitaciones honestas de guardar todo en el dispositivo

1. **Los datos pueden desaparecer.** iOS puede borrar el almacenamiento de
   una web app si el dispositivo se queda sin espacio o si la app no se usa
   durante un tiempo; borrar los datos de Safari también los elimina. Pedir
   "almacenamiento persistente" ayuda, pero iOS no lo garantiza.
2. **No hay copia en la nube.** Si se pierde o se cambia el iPhone sin una
   copia exportada, el progreso no se puede recuperar.
3. **App instalada y Safari no comparten datos.** Son almacenamientos
   distintos aunque sea la misma web.
4. **Cambiar la dirección web = empezar de cero.** El almacenamiento va
   ligado al origen (`https://usuario.github.io`). Si algún día se cambia de
   dominio, cada jugador debe exportar antes y luego importar.
5. **Nada es verificable desde fuera.** Puntos, rangos, tiempos y diarios se
   calculan en el dispositivo. Cualquiera con conocimientos puede editar su
   copia, adelantar el reloj para abrir diarios o leer las soluciones en el
   código publicado. Es un juego entre personas de confianza: las trampas
   solo estropean la propia partida.
6. **El número de investigador no es único con garantía.** Se genera al azar
   en el dispositivo (≈ 100 000 combinaciones con letra de control).
7. **La suma de control de las copias detecta daños, no manipulación.**
   Cualquiera puede recalcularla.

## Lo que sí se garantiza

- El juego individual funciona sin conexión una vez cargado.
- Ningún dato del jugador sale del dispositivo salvo que él exporte una copia.
- No hay analítica, cuentas, cookies de terceros ni servicios externos.
- Exportar / importar el **archivo personal** (Lámpara → Archivo):
  - Copia JSON con formato, versión y suma SHA-256.
  - En iPhone se entrega con la hoja de compartir (Archivos, iCloud Drive,
    AirDrop, Mensajes…); en otros dispositivos se descarga.
  - Al importar: vista previa, **fusionar** (une sin perder nada; ante el
    mismo elemento gana el más reciente; las recompensas cobradas se unen
    y nunca se cobran dos veces) o **reemplazar** (con doble confirmación).
  - La mesa avisa si la última copia tiene más de 14 días.
