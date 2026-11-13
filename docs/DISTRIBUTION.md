# Distribución gratuita

## Recomendación: GitHub Pages + GitHub Actions

Tu repositorio es **público**, así que GitHub Pages funciona con el plan
gratuito. (Con el plan Free, Pages solo está disponible para repositorios
públicos; publicar desde uno privado requiere un plan de pago.)

Condiciones y límites relevantes (documentación de GitHub; la página oficial
`docs.github.com` no era accesible desde el entorno de desarrollo, así que
conviene revisarla antes de publicar):

| Aspecto | Condición |
|---|---|
| Coste | Gratuito para repositorios públicos |
| Ancho de banda | Límite blando de **100 GB/mes** |
| Tamaño del sitio | Recomendado/límite **≈ 1 GB** publicado |
| Compilaciones | Límite blando de 10/hora, **no aplica** si se publica con GitHub Actions (nuestro caso) |
| Despliegue | Se cancela si tarda más de 10 minutos |
| HTTPS | Incluido (`https://<usuario>.github.io/Deadline/`); necesario para el service worker |
| Uso permitido | No está pensado como hosting gratuito de un negocio online ni para transacciones sensibles (contraseñas, pagos). DEADLINE no tiene ni lo uno ni lo otro. |
| Visibilidad | El sitio es **público**: cualquiera con el enlace puede abrirlo. No hay control de acceso. |
| Código | El repositorio es público: **las soluciones de los casos son legibles** en el código. Aceptable para un grupo de confianza. |
| Privacidad | GitHub registra las peticiones al sitio (IP, etc.) según su declaración de privacidad. DEADLINE no añade ninguna analítica. |

### Consumo estimado

- Armazón de la app: ≈ 1 MB (≈ 140 KB de JavaScript comprimido + tipografías).
- 20 personas × 1 MB de instalación + actualizaciones ≈ muy por debajo de 1 GB/mes.
- **El límite que importa es el tamaño del sitio (≈ 1 GB) frente a 3 000
  expedientes.** Presupuesto: ≈ 250–300 KB de media por expediente, imágenes
  incluidas. Es alcanzable con WebP/AVIF muy comprimido, resoluciones
  ajustadas a iPhone y reutilización de recursos entre casos (retratos de
  época, texturas, mapas). Se medirá en la Etapa 8. Si no bastara, opciones
  gratuitas: repartir el contenido en paquetes servidos desde un segundo
  repositorio público con su propio Pages.

### Activación (una sola vez, la haces tú)

1. GitHub → repositorio → **Settings → Pages → Build and deployment →
   Source: GitHub Actions**.
2. Pestaña **Actions → "Publicar en GitHub Pages" → Run workflow** (rama
   `claude/deadline-detective-app-ejx239`, que es la predeterminada). A
   partir de ahí, cada push a esa rama (o a `main`, si se crea) publica
   solo. Antes de activar Pages, el paso de despliegue falla aunque la
   compilación y las pruebas pasen: es lo esperado.
3. Al terminar, la app queda en `https://marcosrenillam-oss.github.io/Deadline/`.

El flujo (`.github/workflows/pages.yml`) comprueba tipos, ejecuta las
pruebas y valida los expedientes antes de publicar: si algo falla, no se
publica.

### Cómo llegan las actualizaciones

1. Se publica una nueva versión (push / Run workflow).
2. Al abrir la app, el service worker detecta la nueva edición y muestra
   *"Hay una nueva edición del archivo"*. El jugador elige cuándo actualizar:
   nunca se recarga en mitad de una investigación.
3. Los datos locales se conservan (mismo origen).

### Instalar en iPhone

Safari → abrir el enlace → Compartir → **Añadir a pantalla de inicio**.
Abrir siempre desde el icono (la app instalada y Safari no comparten datos).

### Detalles técnicos

- `DEADLINE_BASE=/Deadline/` en la compilación: rutas, manifiesto y alcance
  del service worker bajo la subruta del proyecto.
- `404.html` es una copia de la app: GitHub Pages no reescribe rutas, y así
  un enlace directo a `/Deadline/lampara` funciona en la primera visita.
  Después, el service worker resuelve todas las rutas sin red.
- `.nojekyll` evita el procesado de Jekyll.

## Alternativas (no adoptadas)

| Opción | Por qué no ahora |
|---|---|
| Cloudflare Pages | Plan gratuito generoso, pero requiere otra cuenta y conectar el repositorio. Buena opción si se supera el límite de tamaño de GitHub Pages; condiciones a verificar en su momento. |
| Netlify / Vercel | Planes gratuitos con límites y condiciones de uso (Vercel Hobby: uso no comercial). Otra cuenta más. |
| Pasar el archivo `.zip` | Una PWA necesita HTTPS para instalarse y funcionar offline en iPhone. |
