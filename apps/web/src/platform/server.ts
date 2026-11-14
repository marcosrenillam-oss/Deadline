/**
 * Dirección del servidor de DEADLINE (Cloudflare Workers, plan gratuito).
 * Cuentas con usuario y contraseña, copia del progreso y salas en pareja.
 * Se puede cambiar en compilación con VITE_SERVER_URL (p. ej. para pruebas).
 */
export const SERVER_URL: string = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'https://deadline-archivo.deadline-archivo.workers.dev';
