/**
 * Dirección del servidor de DEADLINE (Cloudflare Workers, plan gratuito).
 * Cuentas con usuario y contraseña, copia del progreso y salas en pareja.
 * Se puede cambiar en compilación (VITE_SERVER_URL) o, para pruebas, con
 * localStorage['deadline:server'].
 */
const BUILT: string = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'https://deadline-archivo.deadline-archivo.workers.dev';

export function serverUrl(): string {
  try {
    return localStorage.getItem('deadline:server') || BUILT;
  } catch {
    return BUILT;
  }
}
