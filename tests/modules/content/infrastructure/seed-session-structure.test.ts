import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { listExercises } from '@/modules/content/application/list-exercises';
import { CATEGORY_IDS, type CategoryId } from '@/modules/content/domain/category';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { SESSION_PARTS, type SessionPart } from '@/modules/content/domain/session-part';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();

const LEGACY_EXERCISE_IDS = [
  'salida-3-1-presion-alta',
  'circulacion-cierre-ala',
  'presion-tras-perdida',
  'rondo-4v1-orientacion',
  'pase-y-va-carril-central',
  'juego-posicion-3-1-pivote',
  'ataque-4-0-rotaciones',
  'basculacion-rombo-defensivo',
  'transicion-3v2-tras-robo',
  'conduccion-entre-conos',
  'pases-por-parejas',
  'juego-3v3-conos-porteria',
  'rondo-4v1-dos-toques',
  'pase-y-va-cambio-orientacion',
  'salida-portero-3v2',
  'conservacion-4v2-carriles',
  'reaccion-tras-perdida-3v2',
  'ataque-3v2-banda',
  'juego-posicion-4v4-comodines',
  'basculacion-bloque-1-2-1',
  'salida-4v3-con-portero',
  'transicion-4v3-tras-robo',
  'presion-alta-4v4',
  'salida-3-2-cambio-ala',
  'defensa-3-1-presion-cierre',
  'transicion-5v4-carril-central',
];

const GROUPED_IDS_BY_CATEGORY: Record<CategoryId, Record<SessionPart, string[]>> = {
  prebenjamin: {
    'warm-up': ['conduccion-entre-conos', 'pases-por-parejas'],
    main: [
      'juego-3v3-conos-porteria',
      'juego-4v4-dos-porterias',
      'conduccion-y-pase-en-cuadrado',
    ],
    'cool-down': ['rondo-libre-3v1', 'vuelta-a-la-calma-con-balon'],
  },
  benjamin: {
    'warm-up': ['rondo-4v1-dos-toques', 'pase-y-va-cambio-orientacion'],
    main: ['salida-portero-3v2', 'juego-posicion-3v3-apoyos', 'salida-3v1-desde-portero'],
    'cool-down': ['rondo-4v0-control-orientado', 'circulacion-suave-y-movilidad'],
  },
  alevin: {
    'warm-up': ['rondo-5v1-activacion', 'pase-y-control-en-movimiento'],
    main: [
      'conservacion-4v2-carriles',
      'reaccion-tras-perdida-3v2',
      'ataque-3v2-banda',
    ],
    'cool-down': ['conservacion-suave-4v0', 'rondo-final-4v1'],
  },
  infantil: {
    'warm-up': ['pase-y-va-carril-central', 'juego-posicion-3-1-pivote'],
    main: [
      'salida-3-1-presion-alta',
      'presion-tras-perdida',
      'ataque-4-0-rotaciones',
      'basculacion-rombo-defensivo',
      'transicion-3v2-tras-robo',
    ],
    'cool-down': ['circulacion-cierre-ala', 'rondo-4v1-orientacion'],
  },
  cadete: {
    'warm-up': ['rondo-4v2-activacion', 'movilidad-y-pases-largos'],
    main: [
      'salida-3-1-presion-alta',
      'juego-posicion-4v4-comodines',
      'basculacion-bloque-1-2-1',
    ],
    'cool-down': ['conservacion-5v2-baja-intensidad', 'estiramientos-guiados-con-balon'],
  },
  juvenil: {
    'warm-up': ['rondo-4v2-con-salida', 'activacion-con-duelos-1v1'],
    main: ['salida-4v3-con-portero', 'transicion-4v3-tras-robo', 'presion-alta-4v4'],
    'cool-down': ['conservacion-6v3-baja-intensidad', 'rondo-final-y-movilidad'],
  },
  senior: {
    'warm-up': ['rondo-5v2-activacion', 'activacion-con-movilidad-y-pases'],
    main: [
      'salida-3-2-cambio-ala',
      'defensa-3-1-presion-cierre',
      'transicion-5v4-carril-central',
    ],
    'cool-down': ['conservacion-6v2-baja-intensidad', 'vuelta-a-la-calma-y-analisis'],
  },
};

type SeedPlan = {
  id: string;
  category: CategoryId;
  sessionPart: SessionPart;
  focus: string;
  title: string;
  summary: string;
  objective: string;
  players: { total: number; goalkeepers: number };
  space: { label: string; widthM: number; lengthM: number };
  durationMinutes: number;
  intensity: { level: 'low' | 'medium' | 'high'; percent: number };
  workStructure: string;
  phases: { id: string; title: string }[];
};

const NEW_PLANS: SeedPlan[] = [
  {
    id: 'juego-4v4-dos-porterias',
    category: 'prebenjamin',
    sessionPart: 'main',
    focus: 'Juego reducido',
    title: 'Juego 4 contra 4 en dos porterías',
    summary:
      'Partido 4 contra 4 con dos porterías para buscar el gol tras circular el balón por todo el cuadrado.',
    objective:
      'Ocupar los espacios libres y finalizar en la portería contraria con pase o conducción.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Cuadrado de juego', widthM: 20, lengthM: 20 },
    durationMinutes: 10,
    intensity: { level: 'medium', percent: 60 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'circulacion', title: 'Circulación y apoyos' },
      { id: 'finalizacion', title: 'Finalización en portería' },
    ],
  },
  {
    id: 'conduccion-y-pase-en-cuadrado',
    category: 'prebenjamin',
    sessionPart: 'main',
    focus: 'Conducción y pase',
    title: 'Conducción y pase en el cuadrado',
    summary:
      'Conducción por el cuadrado con entrega al compañero libre y cambio de sentido en la recepción.',
    objective:
      'Conducir con la cabeza levantada y entregar el balón al compañero mejor perfilado.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Cuadrado de trabajo', widthM: 15, lengthM: 15 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 50 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'conduccion-entrega', title: 'Conducción y entrega' },
      { id: 'recepcion-cambio', title: 'Recepción y cambio de sentido' },
    ],
  },
  {
    id: 'rondo-libre-3v1',
    category: 'prebenjamin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Rondo libre 3 contra 1',
    summary:
      'Rondo tranquilo de tres contra uno para cerrar la sesión con el balón en el pie.',
    objective:
      'Mantener el balón sin prisa y terminar la sesión con sensaciones positivas.',
    players: { total: 4, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 8, lengthM: 8 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 35 },
    workStructure: 'Rondos de 60 segundos x 4 series',
    phases: [
      { id: 'rondo-suave', title: 'Rondo suave' },
      { id: 'cambio-defensor', title: 'Cambio de defensor' },
    ],
  },
  {
    id: 'vuelta-a-la-calma-con-balon',
    category: 'prebenjamin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Vuelta a la calma con balón',
    summary:
      'Círculo de pases lentos y movilidad suave para bajar el ritmo al final del entrenamiento.',
    objective:
      'Recuperar la calma con pases controlados y movilidad de las articulaciones.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Círculo de cierre', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 25 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'pases-en-circulo', title: 'Pases en círculo' },
      { id: 'movilidad', title: 'Movilidad y respiración' },
    ],
  },
  {
    id: 'juego-posicion-3v3-apoyos',
    category: 'benjamin',
    sessionPart: 'main',
    focus: 'Juego de posición',
    title: 'Juego de posición 3 contra 3 con apoyos',
    summary:
      'Juego de posición 3 contra 3 con dos apoyos por fuera que sostienen la posesión.',
    objective:
      'Conservar el balón con apoyos exteriores y cambiar de orientación cuando el centro se cierra.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Rectángulo de juego', widthM: 20, lengthM: 15 },
    durationMinutes: 12,
    intensity: { level: 'medium', percent: 65 },
    workStructure: 'Bloques de 4 minutos x 3 series',
    phases: [
      { id: 'posesion-apoyos', title: 'Posesión con apoyos' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
      { id: 'progresion', title: 'Progresión al espacio libre' },
    ],
  },
  {
    id: 'salida-3v1-desde-portero',
    category: 'benjamin',
    sessionPart: 'main',
    focus: 'Salida de balón',
    title: 'Salida 3 contra 1 desde portero',
    summary:
      'Salida desde portero con tres jugadores ante la presión de un rival en medio campo.',
    objective:
      'Superar al defensor con el pase al hombre libre y ocupar el carril de progresión.',
    players: { total: 4, goalkeepers: 1 },
    space: { label: 'Medio campo', widthM: 20, lengthM: 20 },
    durationMinutes: 10,
    intensity: { level: 'medium', percent: 60 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'salida-portero', title: 'Portero con balón' },
      { id: 'apoyo-cierre', title: 'Apoyo del cierre' },
      { id: 'progresion-banda', title: 'Progresión por banda' },
    ],
  },
  {
    id: 'rondo-4v0-control-orientado',
    category: 'benjamin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Rondo 4 contra 0 con control orientado',
    summary:
      'Rondo sin defensor para cerrar la sesión con control orientado y pases cómodos.',
    objective:
      'Terminar con el balón controlado y el cuerpo orientado hacia el compañero.',
    players: { total: 4, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 8, lengthM: 8 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 35 },
    workStructure: 'Rondos de 60 segundos x 4 series',
    phases: [
      { id: 'control-orientado', title: 'Control orientado' },
      { id: 'pase-companero', title: 'Pase al compañero libre' },
    ],
  },
  {
    id: 'circulacion-suave-y-movilidad',
    category: 'benjamin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Circulación suave y movilidad',
    summary:
      'Circulación lenta entre compañeros combinada con movilidad de tobillo, rodilla y cadera.',
    objective:
      'Bajar la intensidad con circulación tranquila y movilidad articular guiada.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Círculo de cierre', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 30 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'circulacion-lenta', title: 'Circulación lenta' },
      { id: 'movilidad-articular', title: 'Movilidad articular' },
    ],
  },
  {
    id: 'rondo-5v1-activacion',
    category: 'alevin',
    sessionPart: 'warm-up',
    focus: 'Rondo',
    title: 'Rondo 5 contra 1 de activación',
    summary:
      'Rondo de activación con cinco jugadores por fuera y un defensor que entra al recuperar.',
    objective:
      'Activar el pase y el control orientado con superioridad y ritmo creciente.',
    players: { total: 6, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 10, lengthM: 10 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 45 },
    workStructure: 'Rondos de 90 segundos x 4 series',
    phases: [
      { id: 'rondo-activacion', title: 'Rondo de activación' },
      { id: 'presion-defensor', title: 'Presión del defensor' },
    ],
  },
  {
    id: 'pase-y-control-en-movimiento',
    category: 'alevin',
    sessionPart: 'warm-up',
    focus: 'Pase',
    title: 'Pase y control en movimiento',
    summary:
      'Pases entre dos cuadrados con control en movimiento y cambio de cuadrado tras la entrega.',
    objective:
      'Recibir en movimiento y orientar el primer toque hacia el espacio libre.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Doble cuadrado', widthM: 20, lengthM: 20 },
    durationMinutes: 10,
    intensity: { level: 'medium', percent: 55 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'pase-control', title: 'Pase y control' },
      { id: 'movimiento-espacio', title: 'Movimiento al espacio libre' },
    ],
  },
  {
    id: 'conservacion-suave-4v0',
    category: 'alevin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Conservación suave 4 contra 0',
    summary:
      'Conservación sin oposición para cerrar el entrenamiento con pases tranquilos y cambios de orientación.',
    objective:
      'Terminar la sesión conservando el balón a ritmo bajo y con apoyos claros.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Rectángulo de cierre', widthM: 15, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 30 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'conservacion-tranquila', title: 'Conservación tranquila' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación suave' },
    ],
  },
  {
    id: 'rondo-final-4v1',
    category: 'alevin',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Rondo final 4 contra 1',
    summary:
      'Rondo final de cuatro contra uno con ritmo bajo y cierre con estiramientos.',
    objective:
      'Cerrar la sesión con el balón en el pie y el grupo conectado.',
    players: { total: 5, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 35 },
    workStructure: 'Rondos de 60 segundos x 4 series',
    phases: [
      { id: 'rondo-final', title: 'Rondo final' },
      { id: 'cierre-estiramiento', title: 'Cierre y estiramiento' },
    ],
  },
  {
    id: 'rondo-4v2-activacion',
    category: 'cadete',
    sessionPart: 'warm-up',
    focus: 'Rondo',
    title: 'Rondo 4 contra 2 de activación',
    summary:
      'Rondo de activación con cuatro jugadores por fuera y dos defensores que presionan juntos.',
    objective:
      'Activar la circulación con dos toques y el cambio de orientación ante dos defensores.',
    players: { total: 6, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 12, lengthM: 12 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 50 },
    workStructure: 'Rondos de 90 segundos x 5 series',
    phases: [
      { id: 'rondo-dos-defensores', title: 'Rondo con dos defensores' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
    ],
  },
  {
    id: 'movilidad-y-pases-largos',
    category: 'cadete',
    sessionPart: 'warm-up',
    focus: 'Activación',
    title: 'Movilidad y pases largos',
    summary:
      'Activación con movilidad articular y pases largos entre parejas a lo ancho de la pista.',
    objective:
      'Preparar tobillos, cadera y hombro mientras se ajusta la precisión del pase largo.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Franja de activación', widthM: 20, lengthM: 10 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 45 },
    workStructure: 'Bloques de 2 minutos x 4 series',
    phases: [
      { id: 'movilidad', title: 'Movilidad articular' },
      { id: 'pase-largo', title: 'Pase largo y control' },
    ],
  },
  {
    id: 'conservacion-5v2-baja-intensidad',
    category: 'cadete',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Conservación 5 contra 2 a baja intensidad',
    summary:
      'Conservación tranquila en superioridad para cerrar la sesión con el balón controlado.',
    objective:
      'Bajar el ritmo conservando el balón y manteniendo los apoyos del 5 contra 2.',
    players: { total: 7, goalkeepers: 0 },
    space: { label: 'Rectángulo de cierre', widthM: 20, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 40 },
    workStructure: 'Bloques de 3 minutos x 2 series',
    phases: [
      { id: 'conservacion-tranquila', title: 'Conservación sin presión' },
      { id: 'cambio-lado', title: 'Cambio de lado' },
    ],
  },
  {
    id: 'estiramientos-guiados-con-balon',
    category: 'cadete',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Estiramientos guiados con balón',
    summary:
      'Estiramientos guiados con el balón en el pie para cerrar la sesión y recuperar la calma.',
    objective:
      'Relajar piernas y tronco con estiramientos suaves y respiración controlada.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Círculo de cierre', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 20 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'estiramiento-balon', title: 'Estiramiento con balón' },
      { id: 'respiracion-cierre', title: 'Respiración y cierre' },
    ],
  },
  {
    id: 'rondo-4v2-con-salida',
    category: 'juvenil',
    sessionPart: 'warm-up',
    focus: 'Rondo',
    title: 'Rondo 4 contra 2 con salida',
    summary:
      'Rondo de activación que termina en salida al espacio libre cuando se supera a los dos defensores.',
    objective:
      'Activar la circulación con dos toques y reconocer el momento de salir del cuadrado.',
    players: { total: 6, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 12, lengthM: 12 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 50 },
    workStructure: 'Rondos de 90 segundos x 5 series',
    phases: [
      { id: 'rondo-activacion', title: 'Rondo de activación' },
      { id: 'salida-cuadrado', title: 'Salida del cuadrado' },
      { id: 'progresion-espacio', title: 'Progresión al espacio libre' },
    ],
  },
  {
    id: 'activacion-con-duelos-1v1',
    category: 'juvenil',
    sessionPart: 'warm-up',
    focus: 'Activación',
    title: 'Activación con duelos 1 contra 1',
    summary:
      'Duelos 1 contra 1 en franjas cortas para activar el cuerpo y la conducción a la línea.',
    objective:
      'Activar el cuerpo con duelos cortos y ganar la línea de conducción con el primer apoyo.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Franja de duelos', widthM: 20, lengthM: 15 },
    durationMinutes: 10,
    intensity: { level: 'medium', percent: 60 },
    workStructure: 'Series de 45 segundos x 6 repeticiones',
    phases: [
      { id: 'duelo-balon', title: 'Duelo por el balón' },
      { id: 'conduccion-linea', title: 'Conducción a la línea' },
    ],
  },
  {
    id: 'conservacion-6v3-baja-intensidad',
    category: 'juvenil',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Conservación 6 contra 3 a baja intensidad',
    summary:
      'Conservación en superioridad a ritmo bajo para cerrar la sesión con el grupo junto.',
    objective:
      'Bajar la intensidad conservando el balón y cambiando de orientación sin riesgo.',
    players: { total: 9, goalkeepers: 0 },
    space: { label: 'Rectángulo de cierre', widthM: 20, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 40 },
    workStructure: 'Bloques de 3 minutos x 2 series',
    phases: [
      { id: 'conservacion-tranquila', title: 'Conservación tranquila' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
    ],
  },
  {
    id: 'rondo-final-y-movilidad',
    category: 'juvenil',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Rondo final y movilidad',
    summary:
      'Rondo final de baja intensidad combinado con movilidad y respiración para cerrar la sesión.',
    objective:
      'Cerrar con el balón en el pie y recuperar la movilidad de tobillo y cadera.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Círculo de cierre', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 25 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'rondo-final', title: 'Rondo final' },
      { id: 'movilidad-respiracion', title: 'Movilidad y respiración' },
    ],
  },
  {
    id: 'rondo-5v2-activacion',
    category: 'senior',
    sessionPart: 'warm-up',
    focus: 'Rondo',
    title: 'Rondo 5 contra 2 de activación',
    summary:
      'Rondo de activación con cinco por fuera y dos defensores que ajustan la presión.',
    objective:
      'Activar la circulación con dos toques y el cambio de orientación bajo presión.',
    players: { total: 7, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 14, lengthM: 14 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 50 },
    workStructure: 'Rondos de 90 segundos x 5 series',
    phases: [
      { id: 'rondo-defensores', title: 'Rondo con dos defensores' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
      { id: 'salida-espacio', title: 'Salida al espacio libre' },
    ],
  },
  {
    id: 'activacion-con-movilidad-y-pases',
    category: 'senior',
    sessionPart: 'warm-up',
    focus: 'Activación',
    title: 'Activación con movilidad y pases',
    summary:
      'Activación articular combinada con pases y control orientado a ritmo progresivo.',
    objective:
      'Preparar el cuerpo y ajustar el control orientado antes de la parte general.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Franja de activación', widthM: 20, lengthM: 15 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 45 },
    workStructure: 'Bloques de 2 minutos x 4 series',
    phases: [
      { id: 'movilidad', title: 'Movilidad articular' },
      { id: 'pases-control', title: 'Pases y control orientado' },
    ],
  },
  {
    id: 'conservacion-6v2-baja-intensidad',
    category: 'senior',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Conservación 6 contra 2 a baja intensidad',
    summary:
      'Conservación sin presión alta para cerrar la sesión con pases seguros y cambios de lado.',
    objective:
      'Recuperar la calma conservando el balón a ritmo bajo y con apoyos amplios.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Rectángulo de cierre', widthM: 20, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 40 },
    workStructure: 'Bloques de 3 minutos x 2 series',
    phases: [
      { id: 'conservacion-sin-presion', title: 'Conservación sin presión' },
      { id: 'cambio-lado', title: 'Cambio de lado' },
    ],
  },
  {
    id: 'vuelta-a-la-calma-y-analisis',
    category: 'senior',
    sessionPart: 'cool-down',
    focus: 'Vuelta a la calma',
    title: 'Vuelta a la calma y análisis',
    summary:
      'Estiramientos guiados y charla breve de análisis para cerrar la sesión en grupo.',
    objective:
      'Relajar el cuerpo y fijar dos ideas del entrenamiento con una charla corta.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Círculo de cierre', widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: 'low', percent: 20 },
    workStructure: 'Bloques de 2 minutos x 3 series',
    phases: [
      { id: 'estiramiento-guiado', title: 'Estiramiento guiado' },
      { id: 'analisis-cierre', title: 'Análisis y cierre' },
    ],
  },
];

const PLACEHOLDER_PATTERN = /(?:^|\b)(?:tbd|pendiente|xxx)(?:\b|$)/i;

function readBundledPackage(): { contentVersion: string } {
  const packageUrl = new URL(
    '../../../../src/modules/content/infrastructure/content/content-package.json',
    import.meta.url,
  );

  return JSON.parse(readFileSync(packageUrl, 'utf8')) as { contentVersion: string };
}

function groupedIds(categoryId: CategoryId): Record<SessionPart, string[]> {
  const exercises = listExercises(repository, { categoryId });
  const groups = Object.fromEntries(
    SESSION_PARTS.map((part) => [part, [] as string[]]),
  ) as Record<SessionPart, string[]>;

  for (const exercise of exercises) {
    groups[exercise.sessionPart].push(exercise.id);
  }

  return groups;
}

describe('Seed session structure', () => {
  describe('Given the bundled content package', () => {
    describe('When the package is read', () => {
      it('then it holds 50 exercises and 57 audited records', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );

        assert.equal(repository.getExercises().length, 50);
        assert.equal(programming.length, 7);
        assert.equal(repository.getExercises().length + programming.length, 57);
        assert.deepEqual(
          repository.getExercises().slice(0, 26).map((exercise) => exercise.id),
          LEGACY_EXERCISE_IDS,
        );
        assert.equal(repository.getExercises()[0].id, 'salida-3-1-presion-alta');
      });

      it('then every exercise carries one of the three session parts', () => {
        for (const exercise of repository.getExercises()) {
          assert.ok(
            SESSION_PARTS.includes(exercise.sessionPart),
            `Expected ${exercise.id} to declare a valid session part.`,
          );
        }
      });
    });

    describe('When each category is grouped by session part', () => {
      for (const categoryId of CATEGORY_IDS) {
        const expected = GROUPED_IDS_BY_CATEGORY[categoryId];

        it(`then ${categoryId} matches its pinned grouped order`, () => {
          assert.deepEqual(groupedIds(categoryId), expected);
        });
      }

      it('then Cadete and Infantil both open the main part with the crossover exercise', () => {
        assert.deepEqual(groupedIds('cadete').main, [
          'salida-3-1-presion-alta',
          'juego-posicion-4v4-comodines',
          'basculacion-bloque-1-2-1',
        ]);
        assert.equal(groupedIds('infantil').main[0], 'salida-3-1-presion-alta');
      });
    });

    describe('When the 24 new records are inspected', () => {
      for (const plan of NEW_PLANS) {
        it(`then ${plan.id} matches the pinned seed plan`, () => {
          const exercise = repository.getExerciseById(plan.id);

          assert.ok(exercise, `Expected the seeded exercise ${plan.id}.`);
          if (!exercise) {
            return;
          }

          assert.equal(exercise.title, plan.title);
          assert.equal(exercise.summary, plan.summary);
          assert.equal(exercise.focus, plan.focus);
          assert.equal(exercise.sessionPart, plan.sessionPart);
          assert.deepEqual(exercise.categoryIds, [plan.category]);
          assert.equal(exercise.objective, plan.objective);
          assert.deepEqual(exercise.players, plan.players);
          assert.deepEqual(exercise.space, plan.space);
          assert.equal(exercise.durationMinutes, plan.durationMinutes);
          assert.deepEqual(exercise.intensity, plan.intensity);
          assert.equal(exercise.workStructure, plan.workStructure);
          assert.equal(exercise.status, 'published');
          assert.deepEqual(exercise.provenance, {
            kind: 'original',
            sourceName: 'Futsal Manager AI',
            licenseStatus: 'owned',
          });
          assert.equal(exercise.provenance.attribution, undefined);
          assert.equal(exercise.constraints.length, 2);
          assert.equal(exercise.coachingCues.length, 3);

          assert.deepEqual(
            exercise.boardData.phases.map((phase) => ({
              id: phase.id,
              title: phase.title,
            })),
            plan.phases,
          );

          for (const field of [
            exercise.title,
            exercise.summary,
            exercise.focus,
            exercise.objective,
            exercise.workStructure,
            exercise.space.label,
            ...exercise.coachingCues,
            ...exercise.constraints.flatMap((constraint) => [
              constraint.rule,
              constraint.detail,
            ]),
            ...exercise.boardData.phases.flatMap((phase) => [
              phase.title,
              phase.explanation,
            ]),
          ]) {
            assert.ok(field.trim().length > 0, `Expected Spanish copy for ${plan.id}.`);
            assert.ok(
              !PLACEHOLDER_PATTERN.test(field),
              `Expected ${plan.id} not to use placeholder copy.`,
            );
          }
        });
      }
    });

    describe('When every seeded board is re-parsed', () => {
      it('then every board is valid Board Data at 1.0.0', () => {
        assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');

        for (const exercise of repository.getExercises()) {
          assert.equal(exercise.boardData.schemaVersion, BOARD_DATA_SCHEMA_VERSION);

          const board = parseBoardData(exercise.boardData);

          assert.equal(board.pitch.format, 'full');

          board.phases.forEach((phase, index) => {
            assert.equal(phase.order, index + 1);
            assert.equal(phase.positions.length, board.tokens.length);
            assert.equal(new Set(phase.positions.map((entry) => entry.tokenId)).size, board.tokens.length);
            for (const position of phase.positions) {
              assert.ok(
                position.x >= 4 && position.x <= 96 && position.y >= 4 && position.y <= 96,
                `Expected coordinates inside 4-96 for ${exercise.id}.`,
              );
            }
            if (phase.ball) {
              assert.ok(
                phase.ball.x >= 4 && phase.ball.x <= 96 && phase.ball.y >= 4 && phase.ball.y <= 96,
                `Expected the ball inside 4-96 for ${exercise.id}.`,
              );
            }
            for (const arrow of phase.arrows) {
              assert.ok(
                Math.hypot(arrow.to.x - arrow.from.x, arrow.to.y - arrow.from.y) > 0.1,
                `Expected distinct arrow endpoints for ${exercise.id}.`,
              );
            }
          });
        }
      });

      for (const plan of NEW_PLANS) {
        it(`then ${plan.id} definitions and board geometry are coherent`, () => {
          const exercise = repository.getExerciseById(plan.id);

          assert.ok(exercise, `Expected the seeded exercise ${plan.id}.`);
          if (!exercise) {
            return;
          }

          const board = parseBoardData(exercise.boardData);

          assert.equal(board.tokens.length, plan.players.total);
          assert.equal(
            new Set(board.tokens.map((token) => token.id)).size,
            board.tokens.length,
          );
          assert.equal(
            board.tokens.filter((token) => token.kind === 'keeper').length,
            plan.players.goalkeepers,
          );
          assert.equal(board.phases.length, plan.phases.length);
          for (const phase of board.phases) {
            const positioned = new Set(phase.positions.map((entry) => entry.tokenId));
            assert.equal(positioned.size, board.tokens.length);
            for (const token of board.tokens) {
              assert.ok(
                positioned.has(token.id),
                `Expected a position for token "${token.id}" in ${plan.id}.`,
              );
            }
            for (const arrow of phase.arrows) {
              for (const point of [arrow.from, arrow.to]) {
                assert.ok(
                  point.x >= 4 && point.x <= 96 && point.y >= 4 && point.y <= 96,
                  `Expected arrow coordinates inside 4-96 for ${plan.id}.`,
                );
              }
            }
          }
        });
      }
    });

    describe('When versions and forbidden stage names are checked', () => {
      it('then the package is 1.1.0, Board Data is 1.0.0 and the Infantil plan is 1.1.0', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.1.0');
        assert.equal(readBundledPackage().contentVersion, '1.1.0');
        assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');
        assert.equal(
          repository.getProgrammingByCategory('infantil')[0]?.version,
          '1.1.0',
        );
      });

      it('then no record leaks a Chupetín-style stage', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );
        const values = [
          ...repository.getExercises().flatMap((exercise) => [
            exercise.id,
            exercise.title,
            exercise.summary,
            exercise.focus,
            exercise.sessionPart,
            ...exercise.categoryIds,
          ]),
          ...programming.flatMap((record) => [record.id, record.formativeStage]),
        ];

        for (const value of values) {
          assert.ok(!/chupet[ií]n/i.test(value), `Unexpected stage name in "${value}".`);
        }
      });
    });
  });
});
