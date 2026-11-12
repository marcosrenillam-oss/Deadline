# Cooperativo sin servidor

Se conservan los **500 expedientes cooperativos** y sus dos estilos
(investigación compartida e información dividida). Sin servidor no puede
haber sincronización en tiempo real; **no se simula**. En su lugar, dos
modalidades reales. Implementación: Etapa 6.

## Modalidad 1 · Mesa compartida (un dispositivo)

Dos investigadores con un solo iPhone.

- **Compartida:** ambos ven todo y se turnan libremente. Cronómetro de 120
  minutos en el dispositivo.
- **Dividida:** cada papel (A y B) tiene su carpeta privada. Para ver la
  suya, una pantalla de **pase de turno** ("Pasa el iPhone a B. A, no
  mires") oculta la carpeta del otro. Una pieza privada solo pasa a la mesa
  común cuando su dueño la **pone sobre la mesa**. Tablero, cronología y
  notas comunes son visibles para ambos. Opcional: un PIN de 4 cifras por
  papel para disuadir miradas.
- **Acusación conjunta:** ambos confirman en el mismo dispositivo.

Limitación: en un único dispositivo la división es de honor; nada impide
técnicamente mirar la carpeta del compañero.

## Modalidad 2 · Correspondencia (dos dispositivos, sin servidor)

Cada uno en su iPhone; la comunicación es por **códigos y paquetes de
investigación** enviados por cualquier vía que ya usen (Mensajes, WhatsApp,
AirDrop, correo…) mediante la hoja de compartir, o en persona.

1. **Invitación.** A elige el expediente y genera un *código de
   expediente*: caso, versión del contenido, reparto de papeles, alias de A,
   identificador de partida y una clave aleatoria de partida.
2. **Aceptación.** B abre el código, revisa el caso y pulsa *Preparado*. Su
   dispositivo fija el inicio y genera un *código de aceptación*.
3. **Inicio.** A importa la aceptación: ambos cronómetros cuentan desde el
   mismo instante (con los relojes automáticos de iOS la diferencia es de
   segundos; si es mayor se avisa).
4. **Informes de campo.** Cada vez que uno quiere compartir algo, genera un
   paquete con lo nuevo desde el anterior: evidencias o documentos que
   comparte, notas, tarjetas y conexiones del tablero, entradas de la
   cronología y **mensajes** (asíncronos, como telegramas). Los paquetes
   llevan número de secuencia y una firma HMAC con la clave de partida:
   se rechazan los de otra partida o dañados, e importar dos veces el mismo
   no tiene efecto.
5. **Acusación conjunta.** Uno propone la acusación en un paquete; el otro
   la refrenda (o contrapropone). Ambos dispositivos evalúan el resultado de
   forma determinista: el mismo informe final en los dos.

Tamaño: como ambos tienen el contenido del caso, los paquetes envían
**identificadores**, no documentos. Un informe típico ocupa pocos cientos de
bytes; se comprime (`CompressionStream`, disponible en Safari) y se codifica
como texto (`DL1:…`) o archivo `.deadline`. Se valorará un código QR para
intercambios en persona (requiere incluir un lector QR en la app, gratuito
y local).

Limitaciones honestas:
- **No es tiempo real**: el ritmo lo marcan los intercambios.
- **Información dividida de honor**: el contenido de ambos papeles está en
  la app; la interfaz solo muestra al jugador lo suyo y lo recibido, pero
  alguien con conocimientos técnicos podría leer el resto.
- **Sin reconexión de 5 minutos**: no hay conexión que perder. Si uno no
  confirma la acusación antes del límite, la partida queda como
  *cooperativa incompleta*.
- Las recompensas cooperativas se guardan por partida y dispositivo; no se
  duplican al reimportar paquetes.
- Estadísticas y rango cooperativo, independientes de los individuales.

## Lo que necesitaría un servidor (preparado, no implementado)

| Función | Estado |
|---|---|
| Sincronización y chat en tiempo real | Requiere servidor. La cola `syncQueue` y el formato de operaciones idempotentes están listos. |
| Presencia ("quién está conectado") | Requiere servidor. |
| Invitar por nombre de usuario / amigos verificados | Requiere servidor. Alternativa local (Etapa 7): **tarjetas de investigador** intercambiables con estadísticas declaradas y clasificación entre amigos marcada como "declarado por cada jugador". |
| Cronómetro autoritativo | Requiere servidor. `estimateServerOffset` y `reconcileDailyLedger` están listos. |
| División de información garantizada | Requiere que el servidor custodie el contenido de cada papel. |
| Copia en la nube / recuperación de cuenta | Requiere servidor. Hoy: exportar/importar. |

La propuesta de servidor se conserva en `BACKEND.md` por si un día se decide dar ese paso.
