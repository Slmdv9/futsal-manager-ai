import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { getProgramming } from '@/modules/content/application/get-programming';
import { listExercises } from '@/modules/content/application/list-exercises';
import { CATEGORY_IDS, type CategoryId } from '@/modules/content/domain/category';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();

type ExercisePlan = {
  id: string;
  category: CategoryId;
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

type ProgrammingPlan = {
  id: string;
  categoryId: CategoryId;
  duration: { min: number; max: number };
  formativeStage: string;
  focus: string;
  playModel: string;
  keyConcepts: string[];
  objectives: string[];
  structureTitles: string[];
  macrocycles: {
    focus: string;
    microcycles: { focus: string; sessionCount: number }[];
  }[];
};

const NEW_EXERCISE_PLANS: ExercisePlan[] = [
  {
    id: 'conduccion-entre-conos',
    category: 'prebenjamin',
    focus: 'Conducción',
    title: 'Conducción entre conos',
    summary:
      'Circuito de conducción con cambios de dirección entre conos, ida y vuelta por parejas.',
    objective:
      'Conducir el balón con las dos piernas y cambiar de dirección sin perder el control.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Franja de conducción', widthM: 10, lengthM: 20 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 45 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'ida', title: 'Ida entre conos' },
      { id: 'vuelta', title: 'Vuelta con cambio de pie' },
    ],
  },
  {
    id: 'pases-por-parejas',
    category: 'prebenjamin',
    focus: 'Pase',
    title: 'Pases por parejas en el cuadrado',
    summary:
      'Parejas en los lados del cuadrado se pasan el balón y cambian de lado tras cada entrega.',
    objective:
      'Golpear el balón con el interior del pie y orientar el control hacia el compañero.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Cuadrado de pase', widthM: 10, lengthM: 10 },
    durationMinutes: 8,
    intensity: { level: 'low', percent: 40 },
    workStructure: 'Bloques de 2 minutos x 4 series',
    phases: [
      { id: 'pase-control', title: 'Pase y control' },
      { id: 'cambio-lado', title: 'Cambio de lado' },
    ],
  },
  {
    id: 'juego-3v3-conos-porteria',
    category: 'prebenjamin',
    focus: 'Juego reducido',
    title: 'Juego 3 contra 3 con conos portería',
    summary:
      'Partido 3 contra 3 en espacio reducido con dos conos portería por equipo.',
    objective:
      'Buscar la portería contraria con conducción y pase corto sin perder el balón.',
    players: { total: 6, goalkeepers: 0 },
    space: { label: 'Cuadrado de juego', widthM: 15, lengthM: 15 },
    durationMinutes: 10,
    intensity: { level: 'medium', percent: 55 },
    workStructure: 'Bloques de 4 minutos x 2 series',
    phases: [
      { id: 'conservacion', title: 'Conservación y búsqueda' },
      { id: 'gol-cono', title: 'Gol en el cono portería' },
    ],
  },
  {
    id: 'rondo-4v1-dos-toques',
    category: 'benjamin',
    focus: 'Rondo',
    title: 'Rondo 4 contra 1 a dos toques',
    summary:
      'Rondo 4 contra 1 con límite de dos toques donde el defensor entra al recuperar el balón.',
    objective:
      'Mantener el balón con control orientado y ocupar los apoyos del cuadrado.',
    players: { total: 5, goalkeepers: 0 },
    space: { label: 'Cuadrado de rondo', widthM: 12, lengthM: 12 },
    durationMinutes: 10,
    intensity: { level: 'low', percent: 50 },
    workStructure: 'Bloques de 3 minutos x 3 series',
    phases: [
      { id: 'rondo', title: 'Rondo con dos toques' },
      { id: 'cambio-defensor', title: 'Cambio de defensor' },
    ],
  },
  {
    id: 'pase-y-va-cambio-orientacion',
    category: 'benjamin',
    focus: 'Pase y va',
    title: 'Pase y va con cambio de orientación',
    summary:
      'Pase y va por parejas que cambian de cuadrado tras cada entrega para liberar el carril.',
    objective:
      'Pasar y desmarcarse al espacio libre con perfil abierto y buen timing de la entrega.',
    players: { total: 8, goalkeepers: 0 },
    space: { label: 'Doble cuadrado', widthM: 20, lengthM: 20 },
    durationMinutes: 12,
    intensity: { level: 'medium', percent: 60 },
    workStructure: 'Bloques de 4 minutos x 3 series',
    phases: [
      { id: 'pase-desmarque', title: 'Pase y desmarque' },
      { id: 'recepcion', title: 'Recepción en el cuadrado contrario' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
    ],
  },
  {
    id: 'salida-portero-3v2',
    category: 'benjamin',
    focus: 'Salida de balón',
    title: 'Salida del portero en 3 contra 2',
    summary:
      'Salida desde portero con tres jugadores ante la presión de dos rivales en medio campo.',
    objective:
      'Superar la primera presión con pase al hombre libre y ocupar los tres carriles.',
    players: { total: 6, goalkeepers: 1 },
    space: { label: 'Medio campo', widthM: 20, lengthM: 20 },
    durationMinutes: 12,
    intensity: { level: 'medium', percent: 65 },
    workStructure: 'Bloques de 3 minutos x 4 series',
    phases: [
      { id: 'salida', title: 'Portero con balón' },
      { id: 'hombre-libre', title: 'Pase al hombre libre' },
      { id: 'progresion', title: 'Progresión por el carril libre' },
    ],
  },
  {
    id: 'conservacion-4v2-carriles',
    category: 'alevin',
    focus: 'Conservación',
    title: 'Conservación 4 contra 2 por carriles',
    summary:
      'Conservación 4 contra 2 en un rectángulo de tres carriles con punto extra al cambiar de carril.',
    objective:
      'Conservar el balón cambiando de orientación para encontrar el carril libre.',
    players: { total: 6, goalkeepers: 0 },
    space: { label: 'Rectángulo de tres carriles', widthM: 20, lengthM: 30 },
    durationMinutes: 12,
    intensity: { level: 'medium', percent: 60 },
    workStructure: 'Bloques de 4 minutos x 3 series',
    phases: [
      { id: 'posesion-carril', title: 'Posesión en el carril' },
      { id: 'cambio-carril', title: 'Cambio de carril' },
    ],
  },
  {
    id: 'reaccion-tras-perdida-3v2',
    category: 'alevin',
    focus: 'Presión tras pérdida',
    title: 'Reacción tras pérdida en 3 contra 2',
    summary:
      'Tras la pérdida, tres jugadores presionan al portador y cierran la salida en cinco segundos.',
    objective:
      'Reaccionar juntos tras la pérdida y cerrar la salida del rival por el centro.',
    players: { total: 5, goalkeepers: 0 },
    space: { label: 'Medio campo', widthM: 20, lengthM: 20 },
    durationMinutes: 12,
    intensity: { level: 'high', percent: 75 },
    workStructure: 'Bloques de 3 minutos x 4 series',
    phases: [
      { id: 'perdida', title: 'Pérdida del balón' },
      { id: 'presion-portador', title: 'Presión al portador' },
      { id: 'recuperacion', title: 'Recuperación o repliegue' },
    ],
  },
  {
    id: 'ataque-3v2-banda',
    category: 'alevin',
    focus: 'Ataque 3v2',
    title: 'Ataque 3 contra 2 por banda',
    summary: 'Ataque 3 contra 2 por banda con llegada del segundo hombre al área.',
    objective: 'Finalizar el 3 contra 2 por banda con remate o pase atrás.',
    players: { total: 6, goalkeepers: 1 },
    space: { label: 'Medio campo', widthM: 20, lengthM: 25 },
    durationMinutes: 14,
    intensity: { level: 'medium', percent: 70 },
    workStructure: 'Bloques de 4 minutos x 3 series',
    phases: [
      { id: 'conduccion-banda', title: 'Conducción por banda' },
      { id: 'fijacion', title: 'Fijación del defensor' },
      { id: 'pase-atras', title: 'Pase atrás y remate' },
    ],
  },
  {
    id: 'juego-posicion-4v4-comodines',
    category: 'cadete',
    focus: 'Juego de posición',
    title: 'Juego de posición 4 contra 4 con comodines',
    summary:
      'Juego de posición 4 contra 4 con dos comodines que juegan con el equipo en posesión.',
    objective:
      'Sostener la posesión con apoyos interiores y cambio de orientación ante presión media.',
    players: { total: 10, goalkeepers: 0 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 16,
    intensity: { level: 'medium', percent: 75 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'posesion-comodines', title: 'Posesión con comodines' },
      { id: 'cambio-orientacion', title: 'Cambio de orientación' },
      { id: 'progresion-carril', title: 'Progresión al carril libre' },
    ],
  },
  {
    id: 'basculacion-bloque-1-2-1',
    category: 'cadete',
    focus: 'Bloque defensivo',
    title: 'Basculación del bloque 1-2-1',
    summary:
      'Bloque 1-2-1 que bascula con el balón y cierra el pasillo central ante el cambio de orientación.',
    objective:
      'Basculación del bloque 1-2-1 con coberturas y cierre del pasillo central.',
    players: { total: 10, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: 'medium', percent: 70 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'bloque-orientado', title: 'Bloque orientado al balón' },
      { id: 'basculacion', title: 'Basculación al lado contrario' },
      { id: 'cierre-central', title: 'Cierre del pasillo central' },
    ],
  },
  {
    id: 'salida-4v3-con-portero',
    category: 'juvenil',
    focus: 'Salida de presión',
    title: 'Salida de presión 4 más portero contra 3',
    summary:
      'Salida en 4 con portero ante la presión de tres rivales que defienden la primera línea.',
    objective:
      'Fijar la presión rival y liberar el carril opuesto con el pase del cierre.',
    players: { total: 9, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: 'high', percent: 80 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'salida-portero', title: 'Salida desde portero' },
      { id: 'fijacion-derecha', title: 'Fijación por el carril derecho' },
      { id: 'pase-opuesto', title: 'Pase al carril opuesto' },
    ],
  },
  {
    id: 'transicion-4v3-tras-robo',
    category: 'juvenil',
    focus: 'Transición',
    title: 'Transición 4 contra 3 tras robo',
    summary:
      'Tras el robo en medio campo, cuatro jugadores atacan en transición contra tres defensores.',
    objective:
      'Atacar el espacio antes de que el rival reorganice su línea defensiva.',
    players: { total: 7, goalkeepers: 0 },
    space: { label: 'Medio campo', widthM: 20, lengthM: 25 },
    durationMinutes: 16,
    intensity: { level: 'high', percent: 85 },
    workStructure: 'Bloques de 3 minutos x 4 series',
    phases: [
      { id: 'robo', title: 'Robo y primer pase' },
      { id: 'ataque-espacio', title: 'Ataque del espacio' },
    ],
  },
  {
    id: 'presion-alta-4v4',
    category: 'juvenil',
    focus: 'Presión alta',
    title: 'Presión alta 4 contra 4',
    summary:
      'Presión alta coordinada en 4 contra 4 con referencia al pasillo y salto del hombre del balón.',
    objective: 'Presionar alto en 4 contra 4 sin romper la línea defensiva.',
    players: { total: 10, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: 'high', percent: 85 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'orientacion-presion', title: 'Orientación de la presión' },
      { id: 'salto-pasillo', title: 'Salto al pasillo' },
      { id: 'robo-transicion', title: 'Robo y transición' },
    ],
  },
  {
    id: 'salida-3-2-cambio-ala',
    category: 'senior',
    focus: 'Salida de presión',
    title: 'Salida 3-2 con cambio de ala',
    summary:
      'Salida 3-2 que fija la presión por un carril y cambia de ala para progresar.',
    objective:
      'Superar la presión con la salida 3-2 y el cambio de ala al jugador libre.',
    players: { total: 10, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 20,
    intensity: { level: 'high', percent: 85 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'salida-3-2', title: 'Salida 3-2' },
      { id: 'fijacion-carril', title: 'Fijación del carril fuerte' },
      { id: 'cambio-ala', title: 'Cambio de ala' },
    ],
  },
  {
    id: 'defensa-3-1-presion-cierre',
    category: 'senior',
    focus: 'Defensa en zona',
    title: 'Defensa 3-1 en zona con presión al cierre',
    summary:
      'Defensa 3-1 en zona que presiona al cierre rival y cierra el carril central.',
    objective:
      'Defender en 3-1 en zona cerrando al cierre rival y el pasillo central.',
    players: { total: 10, goalkeepers: 2 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: 'medium', percent: 75 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'bloque-3-1', title: 'Bloque 3-1' },
      { id: 'presion-cierre', title: 'Presión al cierre' },
      { id: 'cierre-centro', title: 'Cierre del centro' },
    ],
  },
  {
    id: 'transicion-5v4-carril-central',
    category: 'senior',
    focus: 'Transición',
    title: 'Transición 5 contra 4 por el carril central',
    summary:
      'Transición de cinco jugadores por el carril central tras recuperar el balón en campo propio.',
    objective:
      'Finalizar la transición 5 contra 4 por el carril central antes del repliegue.',
    players: { total: 9, goalkeepers: 0 },
    space: { label: 'Pista completa', widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: 'high', percent: 90 },
    workStructure: 'Bloques de 4 minutos x 4 series',
    phases: [
      { id: 'recuperacion-salida', title: 'Recuperación y salida' },
      { id: 'finalizacion-centro', title: 'Finalización por el centro' },
    ],
  },
];

const PROGRAMMING_PLANS: ProgrammingPlan[] = [
  {
    id: 'prebenjamin-u8-base',
    categoryId: 'prebenjamin',
    duration: { min: 45, max: 60 },
    formativeStage: 'Etapa de iniciación motriz y familiarización con el balón',
    focus: 'Foco Metodológico Prebenjamín',
    playModel:
      'Juego guiado con conducción, pase y partidos reducidos, sin especialización por puestos.',
    keyConcepts: [
      'Conducción con ambas piernas',
      'Control con la planta del pie',
      'Pase con el interior del pie',
      'Ocupación de espacios libres',
    ],
    objectives: [
      'Conducir el balón con seguridad en espacios reducidos',
      'Pasar y recibir con el interior del pie a un compañero',
      'Resolver el 3 contra 3 buscando la portería contraria',
    ],
    structureTitles: [
      'Juego de activación con balón',
      'Circuito de conducción y juego reducido',
      'Estiramientos y juego tranquilo',
    ],
    macrocycles: [
      {
        focus: 'Conducción y control',
        microcycles: [
          { focus: 'Conducción en espacios reducidos', sessionCount: 3 },
          { focus: 'Pase y control orientado', sessionCount: 3 },
        ],
      },
      {
        focus: 'Juego reducido',
        microcycles: [
          { focus: 'Juego 3 contra 3', sessionCount: 3 },
          { focus: 'Progresión al 4 contra 4', sessionCount: 3 },
        ],
      },
    ],
  },
  {
    id: 'benjamin-u10-base',
    categoryId: 'benjamin',
    duration: { min: 50, max: 65 },
    formativeStage: 'Etapa de iniciación táctica con apoyos y desmarques',
    focus: 'Foco Metodológico Benjamín',
    playModel:
      'Posesión guiada en espacios reducidos con pase y va, apoyos constantes y salida desde portero.',
    keyConcepts: [
      'Control orientado antes del pase',
      'Desmarque de apoyo al lado del balón',
      'Pase y va al espacio libre',
      'Salida desde portero en tres carriles',
    ],
    objectives: [
      'Mantener el balón en superioridad con dos toques',
      'Pasar y desmarcarse para ocupar el espacio libre',
      'Iniciar la salida desde portero con el hombre libre',
    ],
    structureTitles: [
      'Rondo de activación',
      'Bloques de pase y va con salida',
      'Estiramientos y preguntas',
    ],
    macrocycles: [
      {
        focus: 'Rondo, pase y va',
        microcycles: [
          { focus: 'Rondo y control orientado', sessionCount: 3 },
          { focus: 'Pase y va con cambio de orientación', sessionCount: 3 },
        ],
      },
      {
        focus: 'Salida desde portero y juego',
        microcycles: [
          { focus: 'Salida del portero en 3 contra 2', sessionCount: 3 },
          { focus: 'Juego reducido con porteros', sessionCount: 3 },
        ],
      },
    ],
  },
  {
    id: 'alevin-u12-base',
    categoryId: 'alevin',
    duration: { min: 55, max: 70 },
    formativeStage: 'Etapa de desarrollo táctico colectivo con superioridades',
    focus: 'Foco Metodológico Alevín',
    playModel:
      'Conservación y presión organizada en medio campo con transición inmediata y ataque por banda.',
    keyConcepts: [
      'Cambio de orientación para liberar el carril',
      'Presión coordinada tras la pérdida',
      'Ataque por banda con llegada del segundo hombre',
      'Repliegue ordenado a la línea del balón',
    ],
    objectives: [
      'Conservar el balón en superioridad cambiando de carril',
      'Recuperar el balón en cinco segundos tras la pérdida',
      'Finalizar el 3 contra 2 por banda con remate o pase atrás',
    ],
    structureTitles: [
      'Rondo y movilidad',
      'Bloques de conservación, presión y ataque por banda',
      'Estiramientos y análisis',
    ],
    macrocycles: [
      {
        focus: 'Conservación y presión tras pérdida',
        microcycles: [
          { focus: 'Conservación por carriles', sessionCount: 4 },
          { focus: 'Reacción tras pérdida', sessionCount: 4 },
        ],
      },
      {
        focus: 'Ataque por banda y repliegue',
        microcycles: [
          { focus: 'Ataque 3 contra 2 por banda', sessionCount: 4 },
          { focus: 'Repliegue y equilibrio', sessionCount: 4 },
        ],
      },
    ],
  },
  {
    id: 'cadete-u16-base',
    categoryId: 'cadete',
    duration: { min: 65, max: 80 },
    formativeStage: 'Etapa de especialización táctica y consolidación del modelo',
    focus: 'Foco Metodológico Cadete',
    playModel:
      'Juego de posición 4-4 con comodines, basculación del bloque 1-2-1 y salida de presión 3-1.',
    keyConcepts: [
      'Superioridad en el juego de posición',
      'Basculación del bloque 1-2-1',
      'Cierre del pasillo central',
      'Fijación del cierre rival en la salida 3-1',
    ],
    objectives: [
      'Sostener la posesión en 4 contra 4 con comodines',
      'Bascular el bloque 1-2-1 con coberturas',
      'Superar la primera presión con la salida 3-1',
    ],
    structureTitles: ['Rondo y activación', 'Juego de posición y bloque defensivo', 'Estiramientos y preguntas'],
    macrocycles: [
      {
        focus: 'Juego de posición y salida 3-1',
        microcycles: [
          { focus: 'Juego de posición 4 contra 4', sessionCount: 4 },
          { focus: 'Salida 3-1 ante presión alta', sessionCount: 4 },
        ],
      },
      {
        focus: 'Bloque defensivo y repaso del modelo',
        microcycles: [
          { focus: 'Basculación del bloque 1-2-1', sessionCount: 4 },
          { focus: 'Repaso de salida y juego de posición', sessionCount: 4 },
        ],
      },
    ],
  },
  {
    id: 'juvenil-u19-base',
    categoryId: 'juvenil',
    duration: { min: 70, max: 85 },
    formativeStage: 'Etapa de rendimiento táctico y autonomía competitiva',
    focus: 'Foco Metodológico Juvenil',
    playModel:
      'Presión alta coordinada, salida de presión en cuatro y transición vertical de cuatro jugadores.',
    keyConcepts: [
      'Salida en cuatro con portero',
      'Presión alta con referencia al pasillo',
      'Transición vertical de cuatro jugadores',
      'Cambio de orientación para atacar el carril opuesto',
    ],
    objectives: [
      'Superar la primera línea con la salida en cuatro',
      'Presionar alto en 4 contra 4 sin romper la línea',
      'Atacar en transición antes de que el rival reorganice',
    ],
    structureTitles: ['Activación con rondo', 'Salida, presión alta y transición', 'Estiramientos y análisis táctico'],
    macrocycles: [
      {
        focus: 'Salida de presión y presión alta',
        microcycles: [
          { focus: 'Salida 4 más portero contra 3', sessionCount: 4 },
          { focus: 'Presión alta 4 contra 4', sessionCount: 4 },
        ],
      },
      {
        focus: 'Transición y competitividad',
        microcycles: [
          { focus: 'Transición 4 contra 3 tras robo', sessionCount: 4 },
          { focus: 'Repaso del modelo y partido condicionado', sessionCount: 4 },
        ],
      },
    ],
  },
  {
    id: 'senior-base',
    categoryId: 'senior',
    duration: { min: 75, max: 90 },
    formativeStage: 'Etapa de rendimiento y gestión del modelo de juego',
    focus: 'Foco Metodológico Senior',
    playModel:
      'Salida 3-2 con cambio de ala, defensa 3-1 en zona y transición de cinco jugadores por el centro.',
    keyConcepts: [
      'Cambio de ala en la salida 3-2',
      'Presión al cierre en la defensa 3-1',
      'Transición de cinco jugadores por el carril central',
      'Cierre del pasillo central en zona',
    ],
    objectives: [
      'Superar la presión con la salida 3-2 y el cambio de ala',
      'Defender en 3-1 en zona cerrando al cierre rival',
      'Finalizar la transición 5 contra 4 por el carril central',
    ],
    structureTitles: ['Activación con rondo y movilidad', 'Salida, defensa en zona y transición', 'Vuelta a la calma y análisis'],
    macrocycles: [
      {
        focus: 'Salida 3-2 y defensa en zona',
        microcycles: [
          { focus: 'Salida 3-2 con cambio de ala', sessionCount: 4 },
          { focus: 'Defensa 3-1 en zona', sessionCount: 4 },
        ],
      },
      {
        focus: 'Transición y ritmo competitivo',
        microcycles: [
          { focus: 'Transición 5 contra 4', sessionCount: 4 },
          { focus: 'Repaso del modelo y ritmo de partido', sessionCount: 4 },
        ],
      },
    ],
  },
];

const EXPECTED_EXERCISE_IDS_BY_CATEGORY: Partial<Record<CategoryId, string[]>> = {
  prebenjamin: [
    'conduccion-entre-conos',
    'pases-por-parejas',
    'juego-3v3-conos-porteria',
  ],
  benjamin: [
    'rondo-4v1-dos-toques',
    'pase-y-va-cambio-orientacion',
    'salida-portero-3v2',
  ],
  alevin: [
    'conservacion-4v2-carriles',
    'reaccion-tras-perdida-3v2',
    'ataque-3v2-banda',
  ],
  cadete: [
    'salida-3-1-presion-alta',
    'juego-posicion-4v4-comodines',
    'basculacion-bloque-1-2-1',
  ],
  juvenil: [
    'salida-4v3-con-portero',
    'transicion-4v3-tras-robo',
    'presion-alta-4v4',
  ],
  senior: [
    'salida-3-2-cambio-ala',
    'defensa-3-1-presion-cierre',
    'transicion-5v4-carril-central',
  ],
};

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
];

const INSPIRATION_ONLY_DOMAINS = [
  'adrimartinofutsal.es.tl',
  'futsalcoach.es',
  'keepmove.net',
  'ejerciciosdefutbolsala.com',
];

const PLACEHOLDER_PATTERN = /(?:^|\b)(?:tbd|pendiente|xxx)(?:\b|$)/i;

function readBundledPackage(): { contentVersion: string } {
  const packageUrl = new URL(
    '../../../../src/modules/content/infrastructure/content/content-package.json',
    import.meta.url,
  );

  return JSON.parse(readFileSync(packageUrl, 'utf8')) as { contentVersion: string };
}

function assertSpanishCopy(label: string, value: string): void {
  const normalized = value.trim();
  assert.ok(normalized.length > 0, `Expected ${label} to carry Spanish copy.`);
  assert.ok(
    normalized.toLowerCase() !== 'todo' && !PLACEHOLDER_PATTERN.test(normalized),
    `Expected ${label} not to be a placeholder.`,
  );
}

describe('Seed for the remaining categories', () => {
  describe('Given the bundled content package', () => {
    describe('When the exercise library is listed', () => {
      it('then every RFEF category has at least three published exercises', () => {
        for (const categoryId of CATEGORY_IDS) {
          const exercises = listExercises(repository, { categoryId });

          assert.ok(
            exercises.length >= 3,
            `Expected ${categoryId} to have at least three exercises.`,
          );
          assert.ok(
            exercises.every((exercise) => exercise.status === 'published'),
            `Expected every ${categoryId} exercise to be published.`,
          );
        }
      });

      it('then every RFEF category has a published programming record', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );

        assert.equal(programming.length, CATEGORY_IDS.length);
        for (const record of programming) {
          assert.equal(record.status, 'published');
        }
      });

      it('then the package holds 26 unique exercises in canonical order', () => {
        const exercises = listExercises(repository);
        const expectedIds = [
          ...LEGACY_EXERCISE_IDS,
          ...NEW_EXERCISE_PLANS.map((plan) => plan.id),
        ];

        assert.equal(exercises.length, 26);
        assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 26);
        assert.deepEqual(
          exercises.map((exercise) => exercise.id),
          expectedIds,
        );
      });

      it('then the 17 new exercises are appended in the planned order', () => {
        assert.deepEqual(
          repository
            .getExercises()
            .slice(9)
            .map((exercise) => exercise.id),
          NEW_EXERCISE_PLANS.map((plan) => plan.id),
        );
      });
    });

    describe('When exercises are filtered per remaining category', () => {
      for (const [categoryId, expectedIds] of Object.entries(
        EXPECTED_EXERCISE_IDS_BY_CATEGORY,
      )) {
        it(`then ${categoryId} returns exactly its planned ids`, () => {
          assert.deepEqual(
            listExercises(repository, { categoryId: categoryId as CategoryId }).map(
              (exercise) => exercise.id,
            ),
            expectedIds,
          );
        });
      }

      it('then Cadete keeps the legacy crossover exercise first', () => {
        const cadete = listExercises(repository, { categoryId: 'cadete' });

        assert.equal(cadete.length, 3);
        assert.equal(cadete[0].id, 'salida-3-1-presion-alta');
        assert.equal(repository.getExercises()[0].id, 'salida-3-1-presion-alta');
      });
    });

    describe('When every new exercise is inspected', () => {
      for (const plan of NEW_EXERCISE_PLANS) {
        it(`then ${plan.id} matches its metadata and Spanish copy`, () => {
          const exercise = repository.getExerciseById(plan.id);

          assert.ok(exercise, `Expected the seeded exercise ${plan.id}.`);
          if (!exercise) {
            return;
          }

          assert.equal(exercise.title, plan.title);
          assert.equal(exercise.summary, plan.summary);
          assert.equal(exercise.focus, plan.focus);
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
          ]) {
            assertSpanishCopy(`${plan.id}.copy`, field);
          }

          assert.deepEqual(
            exercise.boardData.phases.map((phase) => phase.id),
            plan.phases.map((phase) => phase.id),
          );
          assert.deepEqual(
            exercise.boardData.phases.map((phase) => phase.title),
            plan.phases.map((phase) => phase.title),
          );
          for (const phase of exercise.boardData.phases) {
            assertSpanishCopy(`${plan.id}.${phase.id}.explanation`, phase.explanation);
          }
        });
      }
    });

    describe('When every new Board Data is re-parsed', () => {
      for (const plan of NEW_EXERCISE_PLANS) {
        it(`then the board for ${plan.id} is valid Board Data`, () => {
          const exercise = repository.getExerciseById(plan.id);

          assert.ok(exercise, `Expected the seeded exercise ${plan.id}.`);
          if (!exercise) {
            return;
          }

          assert.equal(exercise.boardData.schemaVersion, BOARD_DATA_SCHEMA_VERSION);

          const board = parseBoardData(exercise.boardData);

          assert.equal(board.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
          assert.equal(board.pitch.format, 'full');
          assert.equal(board.phases.length, plan.phases.length);
          assert.ok(board.phases.length >= 2 && board.phases.length <= 3);
          assert.equal(board.tokens.length, plan.players.total);
          assert.equal(
            new Set(board.tokens.map((entry) => entry.id)).size,
            board.tokens.length,
          );
          assert.equal(
            board.tokens.filter((entry) => entry.kind === 'keeper').length,
            plan.players.goalkeepers,
          );

          board.phases.forEach((phase, phaseIndex) => {
            assert.equal(phase.order, phaseIndex + 1);
            assert.equal(phase.positions.length, board.tokens.length);

            const positionIds = phase.positions.map((entry) => entry.tokenId);
            assert.equal(new Set(positionIds).size, board.tokens.length);
            for (const entry of board.tokens) {
              assert.ok(
                positionIds.includes(entry.id),
                `Expected a position for token "${entry.id}" in ${plan.id} phase ${phase.order}.`,
              );
            }

            for (const position of phase.positions) {
              assert.ok(
                position.x >= 4 && position.x <= 96 && position.y >= 4 && position.y <= 96,
                `Expected coordinates inside 4-96 in ${plan.id} phase ${phase.order}.`,
              );
            }

            assert.ok(phase.ball, `Expected a ball in ${plan.id} phase ${phase.order}.`);
            if (phase.ball) {
              assert.ok(
                phase.ball.x >= 4 &&
                  phase.ball.x <= 96 &&
                  phase.ball.y >= 4 &&
                  phase.ball.y <= 96,
              );
            }

            for (const arrow of phase.arrows) {
              assert.ok(
                Math.hypot(
                  arrow.to.x - arrow.from.x,
                  arrow.to.y - arrow.from.y,
                ) > 0.1,
                `Expected distinct arrow endpoints in ${plan.id} phase ${phase.order}.`,
              );
              for (const point of [arrow.from, arrow.to]) {
                assert.ok(
                  point.x >= 4 && point.x <= 96 && point.y >= 4 && point.y <= 96,
                );
              }
            }
          });
        });
      }
    });

    describe('When the new programming records are read', () => {
      for (const plan of PROGRAMMING_PLANS) {
        it(`then ${plan.categoryId} returns ${plan.id} as planned`, () => {
          const programming = getProgramming(repository, plan.categoryId);

          assert.ok(programming, `Expected the seeded programming ${plan.id}.`);
          if (!programming) {
            return;
          }

          assert.equal(programming.id, plan.id);
          assert.equal(programming.categoryId, plan.categoryId);
          assert.equal(programming.status, 'published');
          assert.equal(programming.version, '1.0.0');
          assert.deepEqual(programming.sessionDurationMinutes, plan.duration);
          assert.equal(programming.formativeStage, plan.formativeStage);
          assert.equal(programming.focus, plan.focus);
          assert.equal(programming.playModel, plan.playModel);
          assert.deepEqual(programming.keyConcepts, plan.keyConcepts);
          assert.deepEqual(programming.objectives, plan.objectives);
          assert.equal(programming.keyConcepts.length, 4);
          assert.equal(programming.objectives.length, 3);

          assert.deepEqual(
            programming.sessionStructure.map((entry) => entry.part),
            ['warm-up', 'main', 'cool-down'],
          );
          assert.deepEqual(
            programming.sessionStructure.map((entry) => entry.title),
            plan.structureTitles,
          );
          for (const entry of programming.sessionStructure) {
            assertSpanishCopy(`programming.${plan.id}.${entry.part}.title`, entry.title);
            assertSpanishCopy(
              `programming.${plan.id}.${entry.part}.description`,
              entry.description,
            );
          }

          assert.deepEqual(programming.provenance, {
            kind: 'original',
            sourceName: 'Futsal Manager AI',
            licenseStatus: 'owned',
          });

          assert.equal(programming.macrocycles.length, 2);
          programming.macrocycles.forEach((macrocycle, macrocycleIndex) => {
            const planned = plan.macrocycles[macrocycleIndex];

            assert.equal(macrocycle.id, `macrociclo-${macrocycleIndex + 1}`);
            assert.equal(macrocycle.focus, planned.focus);
            assert.match(macrocycle.label, /^Macrociclo \d+ · /);
            assertSpanishCopy(`programming.${plan.id}.${macrocycle.id}.label`, macrocycle.label);
            assertSpanishCopy(`programming.${plan.id}.${macrocycle.id}.focus`, macrocycle.focus);
            assert.equal(macrocycle.microcycles.length, 2);

            macrocycle.microcycles.forEach((microcycle, microcycleIndex) => {
              const plannedMicrocycle = planned.microcycles[microcycleIndex];

              assert.equal(microcycle.id, `microciclo-${microcycleIndex + 1}`);
              assert.equal(microcycle.focus, plannedMicrocycle.focus);
              assert.equal(microcycle.sessionCount, plannedMicrocycle.sessionCount);
              assert.ok(microcycle.sessionCount >= 1);
              assertSpanishCopy(
                `programming.${plan.id}.${microcycle.id}.label`,
                microcycle.label,
              );
              assertSpanishCopy(
                `programming.${plan.id}.${microcycle.id}.focus`,
                microcycle.focus,
              );
            });
          });
        });
      }
    });

    describe('When the seed provenance is audited', () => {
      it('then all 33 records are published original owned Futsal Manager AI', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );
        const records = [
          ...repository.getExercises().map((exercise) => ({
            id: exercise.id,
            status: exercise.status,
            provenance: exercise.provenance,
          })),
          ...programming.map((record) => ({
            id: record.id,
            status: record.status,
            provenance: record.provenance,
          })),
        ];

        assert.equal(repository.getExercises().length, 26);
        assert.equal(programming.length, 7);
        assert.equal(records.length, 33);

        for (const record of records) {
          assert.equal(record.status, 'published');
          assert.equal(record.provenance.kind, 'original');
          assert.equal(record.provenance.licenseStatus, 'owned');
          assert.equal(record.provenance.sourceName, 'Futsal Manager AI');
          assert.equal(record.provenance.attribution, undefined);

          const sourceName = record.provenance.sourceName.toLowerCase();
          for (const domain of INSPIRATION_ONLY_DOMAINS) {
            assert.ok(!sourceName.includes(domain));
          }
        }
      });
    });

    describe('When the legacy records and versions are checked', () => {
      it('then the ten legacy records keep their order and version', () => {
        assert.deepEqual(
          repository
            .getExercises()
            .slice(0, 9)
            .map((exercise) => exercise.id),
          LEGACY_EXERCISE_IDS,
        );
        assert.equal(repository.getExercises()[0].id, 'salida-3-1-presion-alta');
        assert.equal(
          repository.getProgrammingByCategory('infantil')[0]?.id,
          'infantil-u14-base',
        );
        assert.equal(
          repository.getProgrammingByCategory('infantil')[0]?.version,
          '1.1.0',
        );
      });

      it('then the package and Board Data versions are unchanged', () => {
        assert.equal(CONTENT_PACKAGE_VERSION, '1.0.0');
        assert.equal(readBundledPackage().contentVersion, '1.0.0');
        assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');
        for (const exercise of repository.getExercises()) {
          assert.equal(exercise.boardData.schemaVersion, '1.0.0');
        }
      });
    });

    describe('When categories and copy are scanned for stage names', () => {
      it('then no Chupetín-style stage leaks into the package', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );
        const values = [
          ...repository.getExercises().flatMap((exercise) => [
            exercise.id,
            exercise.title,
            exercise.summary,
            exercise.focus,
          ]),
          ...programming.flatMap((record) => [
            record.id,
            record.formativeStage,
            record.focus,
            record.playModel,
            ...record.keyConcepts,
            ...record.objectives,
            ...record.macrocycles.flatMap((macrocycle) => [
              macrocycle.label,
              macrocycle.focus,
              ...macrocycle.microcycles.flatMap((microcycle) => [
                microcycle.label,
                microcycle.focus,
              ]),
            ]),
          ]),
        ];

        for (const value of values) {
          assert.ok(!/chupet[ií]n/i.test(value), `Unexpected stage name in "${value}".`);
        }
      });

      it('then every category mapping uses an RFEF bracket', () => {
        for (const exercise of repository.getExercises()) {
          for (const categoryId of exercise.categoryIds) {
            assert.ok(CATEGORY_IDS.includes(categoryId));
          }
        }
        for (const categoryId of CATEGORY_IDS) {
          for (const record of repository.getProgrammingByCategory(categoryId)) {
            assert.ok(CATEGORY_IDS.includes(record.categoryId));
          }
        }
      });
    });
  });
});
