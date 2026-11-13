/**
 * Secciones de la aplicación. Cada una corresponde a un objeto del escritorio
 * (la mesa ES el menú). Este registro es la única fuente de verdad para rutas,
 * nombres y estado de implementación: el escritorio y las pantallas de
 * sección lo leen de aquí.
 */
export type SectionId = 'archive' | 'daily' | 'coop' | 'history' | 'settings' | 'notebook';

export interface SectionDef {
  id: SectionId;
  path: string;
  /** Objeto físico de la mesa que da acceso a la sección. */
  object: string;
  title: string;
  description: string;
  contents: string[];
  /** Etapa del plan en la que la sección pasa a ser funcional. */
  stage: number;
  /** La sección ya está construida y operativa. */
  ready: boolean;
}

export const SECTIONS: readonly SectionDef[] = [
  {
    id: 'archive',
    path: '/archivo',
    object: 'Carpeta de expedientes',
    title: 'Biblioteca de expedientes',
    description: 'Todos los casos individuales del archivo, los ya resueltos y los que aún esperan en el cajón.',
    contents: ['Casos individuales', 'Expedientes resueltos', 'Búsqueda por título, número y palabras clave', 'Filtros por época, crimen, lugar, origen y estado'],
    stage: 3,
    ready: true,
  },
  {
    id: 'daily',
    path: '/calendario',
    object: 'Calendario',
    title: 'Caso del día',
    description: 'Un expediente nuevo cada día durante 500 días. Los que no se juegan pasan al archivo; ninguno se pierde.',
    contents: ['Expediente de hoy', 'Días anteriores', 'Progreso de los 500 diarios'],
    stage: 4,
    ready: true,
  },
  {
    id: 'coop',
    path: '/telefono',
    object: 'Teléfono',
    title: 'Investigación en pareja',
    description: 'Dos detectives y un mismo expediente: en un solo iPhone pasándolo de mano en mano, o en dos iPhone intercambiando informes de campo.',
    contents: ['Partida en un mismo dispositivo', 'Partida entre dos dispositivos con códigos e informes', 'Información compartida o dividida', 'Acusación conjunta'],
    stage: 6,
    ready: true,
  },
  {
    id: 'history',
    path: '/maquina',
    object: 'Máquina de escribir',
    title: 'Registro de investigaciones',
    description: 'El historial de cada caso abierto, cerrado o reabierto, mecanografiado línea a línea.',
    contents: ['Historial de investigaciones', 'Registro de actividad', 'Estadísticas personales', 'Logros', 'Clasificación entre amigos'],
    stage: 7,
    ready: true,
  },
  {
    id: 'settings',
    path: '/lampara',
    object: 'Lámpara',
    title: 'Ajustes',
    description: 'Luz, sonido y comodidad de lectura de tu oficina, su decoración y la copia de tu archivo.',
    contents: ['Iluminación', 'Efectos y ambiente', 'Hápticos', 'Lectura y animaciones', 'Personalización de la oficina', 'Archivo personal: exportar e importar'],
    stage: 2,
    ready: true,
  },
  {
    id: 'notebook',
    path: '/libreta',
    object: 'Libreta',
    title: 'Libreta del investigador',
    description: 'Notas personales, hipótesis y sospechas. Nada de lo que escribas aquí revela la solución.',
    contents: ['Notas personales', 'Apuntes de investigación', 'Teorías y deducciones', 'Recordatorios'],
    stage: 3,
    ready: true,
  },
];

export function sectionById(id: SectionId): SectionDef {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Sección desconocida: ${id}`);
  return s;
}
