import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { BOARD_DATA_SCHEMA_VERSION, parseBoardData } from '@/shared/domain';
import { getExercise } from '@/modules/content/application/get-exercise';
import { listExercises } from '@/modules/content/application/list-exercises';
import { listLibraryExercises } from '@/modules/content/application/list-library-exercises';
import { listWeeklyHighlights } from '@/modules/content/application/list-weekly-highlights';
import { CATEGORY_IDS, type CategoryId } from '@/modules/content/domain/category';
import { CONTENT_PACKAGE_VERSION } from '@/modules/content/domain/content-package';
import { EXERCISE_LIMITS } from '@/modules/content/domain/exercise';
import type { SessionPart } from '@/modules/content/domain/session-part';
import { createBundledContentRepository } from '@/modules/content/infrastructure/bundled-content-repository';

const repository = createBundledContentRepository();
const bundledExercises = repository.getExercises();
const libraryExercises = listLibraryExercises(repository);
const weeklyExercises = listWeeklyHighlights(repository);

function readBundledPackage(): { contentVersion: string } {
  const packageUrl = new URL(
    '../../../../src/modules/content/infrastructure/content/content-package.json',
    import.meta.url,
  );

  return JSON.parse(readFileSync(packageUrl, 'utf8')) as { contentVersion: string };
}

const LEGACY_LIBRARY_FINGERPRINT =
  'd5a3855ab74c85f3b37fb24496d9a88962d22e26551b0effa8f7055723870522';

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

const EXPECTED_REFERENCE_LABELS = [
  'Adri Martín Futsal',
  'KeepMove — Recursos de entrenamiento',
  'Manual de entrenamiento de fútbol sala de la UEFA',
  'Ejercicios de Fútbol Sala',
];

const LIBRARY_EXERCISE_IDS = [
  "salida-3-1-presion-alta",
  "circulacion-cierre-ala",
  "presion-tras-perdida",
  "rondo-4v1-orientacion",
  "pase-y-va-carril-central",
  "juego-posicion-3-1-pivote",
  "ataque-4-0-rotaciones",
  "basculacion-rombo-defensivo",
  "transicion-3v2-tras-robo",
  "conduccion-entre-conos",
  "pases-por-parejas",
  "juego-3v3-conos-porteria",
  "rondo-4v1-dos-toques",
  "pase-y-va-cambio-orientacion",
  "salida-portero-3v2",
  "conservacion-4v2-carriles",
  "reaccion-tras-perdida-3v2",
  "ataque-3v2-banda",
  "juego-posicion-4v4-comodines",
  "basculacion-bloque-1-2-1",
  "salida-4v3-con-portero",
  "transicion-4v3-tras-robo",
  "presion-alta-4v4",
  "salida-3-2-cambio-ala",
  "defensa-3-1-presion-cierre",
  "transicion-5v4-carril-central",
  "juego-4v4-dos-porterias",
  "conduccion-y-pase-en-cuadrado",
  "rondo-libre-3v1",
  "vuelta-a-la-calma-con-balon",
  "juego-posicion-3v3-apoyos",
  "salida-3v1-desde-portero",
  "rondo-4v0-control-orientado",
  "circulacion-suave-y-movilidad",
  "rondo-5v1-activacion",
  "pase-y-control-en-movimiento",
  "conservacion-suave-4v0",
  "rondo-final-4v1",
  "rondo-4v2-activacion",
  "movilidad-y-pases-largos",
  "conservacion-5v2-baja-intensidad",
  "estiramientos-guiados-con-balon",
  "rondo-4v2-con-salida",
  "activacion-con-duelos-1v1",
  "conservacion-6v3-baja-intensidad",
  "rondo-final-y-movilidad",
  "rondo-5v2-activacion",
  "activacion-con-movilidad-y-pases",
  "conservacion-6v2-baja-intensidad",
  "vuelta-a-la-calma-y-analisis",
];

const WEEKLY_EXERCISE_IDS = [
  "activacion-pases-y-nombres",
  "juego-cuatro-esquinas",
  "rondo-tranquilo-en-circulo",
  "pase-y-movimiento-en-triangulo",
  "juego-4v4-con-portero-apoyo",
  "circulacion-tranquila-en-parejas",
  "activacion-3v1-con-pared",
  "salida-de-presion-3v2-con-pivote",
  "conservacion-suave-en-dos-zonas",
  "activacion-con-pases-entre-lineas",
  "ataque-3-1-con-cambio-de-orientacion",
  "rondo-de-cierre-con-movilidad",
  "activacion-con-triangulos-y-desmarques",
  "presion-tras-saque-de-banda",
  "circulacion-suave-con-cambios-de-lado",
  "activacion-con-salida-de-presion-4v2",
  "ataque-4-0-con-rotacion-de-alas",
  "conservacion-lenta-con-apoyos",
  "activacion-con-rondo-y-cambio-de-ritmo",
  "salida-4-0-ante-defensa-en-rombo",
  "vuelta-a-la-calma-con-respiracion-guiada",
];
type WeeklyPlan = {
  id: string;
  category: CategoryId;
  part: SessionPart;
  title: string;
  summary: string;
  focus: string;
  objective: string;
  players: { total: number; goalkeepers: number };
  space: { label: string; widthM: number; lengthM: number };
  durationMinutes: number;
  intensity: { level: string; percent: number };
  workStructure: string;
  constraints: { rule: string; detail: string }[];
  coachingCues: string[];
  reference: { label: string; url: string };
  phases: { id: string; title: string }[];
  cones: number;
  tokens: number;
  keepers: number;
};

const WEEKLY_EXERCISE_PLANS: WeeklyPlan[] = [
  {
    id: "activacion-pases-y-nombres",
    category: "prebenjamin",
    part: "warm-up",
    title: "Activación con pases y nombres",
    summary: "Círculo de pases en el que cada jugador nombra al compañero antes de entregar el balón.",
    focus: "Activación",
    objective: "Activar el cuerpo con pases sencillos y reconocer al compañero antes de recibir.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Círculo de activación", widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 40 },
    workStructure: "Bloques de 2 minutos x 3 series",
    constraints: [
      { rule: "Nombrar antes de pasar", detail: "Cada jugador dice en voz alta el nombre del compañero antes de entregar el balón." },
      { rule: "Balón raso", detail: "Todos los pases se juegan por el suelo y con el pie de apoyo orientado al receptor." },
    ],
    coachingCues: [
      "Nombrar al compañero antes del pase.",
      "Recibir con el cuerpo abierto hacia el centro del círculo.",
      "Acompañar el pase con el pie de golpeo.",
    ],
    reference: { label: "Adri Martín Futsal", url: "https://adrimartinofutsal.es.tl/" },
    phases: [
      { id: "pases-en-circulo", title: "Pases en círculo" },
      { id: "cambio-de-sentido", title: "Cambio de sentido" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "juego-cuatro-esquinas",
    category: "prebenjamin",
    part: "main",
    title: "Juego de las cuatro esquinas",
    summary: "Juego de pases y relevos en el que las cuatro esquinas del cuadrado son refugios para recibir.",
    focus: "Juego reducido",
    objective: "Ocupar la esquina libre y recibir antes de que el perseguidor llegue.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Cuadrado con esquinas", widthM: 20, lengthM: 20 },
    durationMinutes: 10,
    intensity: { level: "medium", percent: 55 },
    workStructure: "Bloques de 3 minutos x 3 series",
    constraints: [
      { rule: "Una esquina por jugador", detail: "No puede haber dos jugadores esperando en la misma esquina." },
      { rule: "Pase antes de tres segundos", detail: "El portador debe entregar el balón antes de contar tres segundos." },
    ],
    coachingCues: [
      "Mirar la esquina libre antes de recibir.",
      "Cambiar de esquina con el primer toque.",
      "Avisar en voz alta del defensor que persigue.",
    ],
    reference: { label: "KeepMove — Recursos de entrenamiento", url: "https://www.keepmove.net/recursosdeentrenamiento/" },
    phases: [
      { id: "ocupar-esquina", title: "Ocupar la esquina" },
      { id: "relevo-esquina", title: "Relevo de esquina" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "rondo-tranquilo-en-circulo",
    category: "prebenjamin",
    part: "cool-down",
    title: "Rondo tranquilo en círculo",
    summary: "Rondo sin presión para cerrar la sesión con el balón en el suelo y pases cortos.",
    focus: "Vuelta a la calma",
    objective: "Cerrar la sesión con pases cómodos y sensaciones positivas.",
    players: { total: 6, goalkeepers: 0 },
    space: { label: "Círculo de cierre", widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 30 },
    workStructure: "Rondos de 60 segundos x 4 series",
    constraints: [
      { rule: "Toque libre", detail: "Cada jugador puede pasar al primer o al segundo toque, sin límite." },
      { rule: "Defensor pasivo", detail: "El defensor solo cierra líneas de pase y no entra al contacto." },
    ],
    coachingCues: [
      "Pasar siempre al compañero libre.",
      "Controlar la respiración entre series.",
      "Terminar con el balón en el suelo.",
    ],
    reference: { label: "Adri Martín Futsal", url: "https://adrimartinofutsal.es.tl/" },
    phases: [
      { id: "rondo-tranquilo", title: "Rondo tranquilo" },
      { id: "cierre-respiracion", title: "Cierre y respiración" },
    ],
    cones: 4,
    tokens: 6,
    keepers: 0,
  },
  {
    id: "pase-y-movimiento-en-triangulo",
    category: "benjamin",
    part: "warm-up",
    title: "Pase y movimiento en triángulo",
    summary: "Triángulos de pase en los que el jugador entrega y ocupa el vértice que queda libre.",
    focus: "Pase",
    objective: "Activar el pase y el apoyo constante en el vértice libre del triángulo.",
    players: { total: 9, goalkeepers: 0 },
    space: { label: "Triángulo de pases", widthM: 18, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: "low", percent: 45 },
    workStructure: "Bloques de 2 minutos x 4 series",
    constraints: [
      { rule: "Un toque por vértice", detail: "En cada vértice se juega al primer toque salvo el primero de la serie." },
      { rule: "Ocupar siempre el vértice libre", detail: "Tras pasar, el jugador se mueve al vértice que no tiene compañero." },
    ],
    coachingCues: [
      "Orientar el cuerpo antes de recibir.",
      "Pasar con la pierna más lejana al defensor imaginario.",
      "Ocupar el vértice libre sin cruzar por delante del balón.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "pase-vertice", title: "Pase al vértice" },
      { id: "ocupar-vertice", title: "Ocupar el vértice libre" },
    ],
    cones: 6,
    tokens: 9,
    keepers: 0,
  },
  {
    id: "juego-4v4-con-portero-apoyo",
    category: "benjamin",
    part: "main",
    title: "Juego 4 contra 4 con portero-apoyo",
    summary: "Partido reducido en el que el portero juega como quinto jugador en la salida.",
    focus: "Juego con portero",
    objective: "Usar al portero como apoyo para superar la primera presión y progresar.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Campo reducido", widthM: 24, lengthM: 18 },
    durationMinutes: 12,
    intensity: { level: "medium", percent: 65 },
    workStructure: "Bloques de 4 minutos x 3 series",
    constraints: [
      { rule: "Portero con dos toques", detail: "El portero participa en la circulación con un máximo de dos toques." },
      { rule: "Gol tras salida del portero", detail: "Solo cuenta el gol si la jugada empieza en el portero." },
    ],
    coachingCues: [
      "Ofrecer línea de pase al portero.",
      "Abrir el campo tras la salida.",
      "Fijar antes de progresar.",
    ],
    reference: { label: "Adri Martín Futsal", url: "https://adrimartinofutsal.es.tl/" },
    phases: [
      { id: "salida-con-portero", title: "Salida con portero" },
      { id: "progresion-campo", title: "Progresión al campo rival" },
    ],
    cones: 2,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "circulacion-tranquila-en-parejas",
    category: "benjamin",
    part: "cool-down",
    title: "Circulación tranquila en parejas",
    summary: "Parejas que circulan el balón a ritmo bajo mientras caminan por la franja de cierre.",
    focus: "Vuelta a la calma",
    objective: "Recuperar la calma con pases suaves y movimiento continuo y lento.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Franja de cierre", widthM: 15, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 30 },
    workStructure: "Bloques de 2 minutos x 3 series",
    constraints: [
      { rule: "Dos toques máximo", detail: "Cada jugador controla y devuelve en un máximo de dos toques." },
      { rule: "Ritmo de caminar", detail: "Las parejas se desplazan caminando y nunca aceleran el paso." },
    ],
    coachingCues: [
      "Caminar mientras se circula el balón.",
      "Respirar de forma pausada entre pases.",
      "Terminar la serie con estiramiento de gemelo.",
    ],
    reference: { label: "KeepMove — Recursos de entrenamiento", url: "https://www.keepmove.net/recursosdeentrenamiento/" },
    phases: [
      { id: "circulacion-parejas", title: "Circulación en parejas" },
      { id: "movilidad-caminando", title: "Movilidad caminando" },
    ],
    cones: 0,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "activacion-3v1-con-pared",
    category: "alevin",
    part: "warm-up",
    title: "Activación 3 contra 1 con pared",
    summary: "Rondo de activación en el que el pase de pared libera al portador del defensor.",
    focus: "Activación",
    objective: "Activar la pared y el desmarque de apoyo ante un defensor.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Cuadrado de activación", widthM: 14, lengthM: 14 },
    durationMinutes: 8,
    intensity: { level: "low", percent: 50 },
    workStructure: "Rondos de 90 segundos x 4 series",
    constraints: [
      { rule: "Pared obligatoria", detail: "Antes de cambiar de orientación debe haber al menos una pared." },
      { rule: "Defensor activo", detail: "El defensor presiona al portador sin entrar al contacto." },
    ],
    coachingCues: [
      "Fijar al defensor antes de la pared.",
      "Ofrecer el apoyo en el ángulo libre.",
      "Cambiar de orientación tras la pared.",
    ],
    reference: { label: "Ejercicios de Fútbol Sala", url: "https://www.ejerciciosdefutbolsala.com/" },
    phases: [
      { id: "pared-inicial", title: "Pared inicial" },
      { id: "desmarque-apoyo", title: "Desmarque de apoyo" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "salida-de-presion-3v2-con-pivote",
    category: "alevin",
    part: "main",
    title: "Salida de presión 3 contra 2 con pívot",
    summary: "Salida con tres jugadores y un pívot fijo que ofrece la salida por el carril central.",
    focus: "Salida de presión",
    objective: "Superar la presión de dos rivales usando al pívot como referencia central.",
    players: { total: 9, goalkeepers: 0 },
    space: { label: "Medio campo", widthM: 24, lengthM: 20 },
    durationMinutes: 14,
    intensity: { level: "medium", percent: 70 },
    workStructure: "Bloques de 3 minutos x 4 series",
    constraints: [
      { rule: "Pívot fijo", detail: "El pívot no puede salir del carril central durante la salida." },
      { rule: "Dos toques", detail: "Los jugadores de salida juegan en un máximo de dos toques." },
    ],
    coachingCues: [
      "Fijar a un presionador antes de pasar al pívot.",
      "Pivotar lejos del defensor.",
      "Atacar el carril que deja libre el pívot.",
    ],
    reference: { label: "Ejercicios de Fútbol Sala", url: "https://www.ejerciciosdefutbolsala.com/" },
    phases: [
      { id: "salida-pivote", title: "Salida con pívot" },
      { id: "fijacion-central", title: "Fijación central" },
      { id: "progresion-banda", title: "Progresión por banda" },
    ],
    cones: 4,
    tokens: 9,
    keepers: 0,
  },
  {
    id: "conservacion-suave-en-dos-zonas",
    category: "alevin",
    part: "cool-down",
    title: "Conservación suave en dos zonas",
    summary: "Conservación sin oposición repartida en dos zonas para cerrar con pases seguros.",
    focus: "Vuelta a la calma",
    objective: "Bajar el ritmo conservando el balón y cambiando de zona sin prisa.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Rectángulo de cierre", widthM: 18, lengthM: 12 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 35 },
    workStructure: "Bloques de 2 minutos x 3 series",
    constraints: [
      { rule: "Cambio de zona cada tres pases", detail: "El equipo cambia de zona después de tres pases consecutivos." },
      { rule: "Sin presión", detail: "Ningún jugador puede robar el balón durante la conservación." },
    ],
    coachingCues: [
      "Circular el balón con el cuerpo orientado.",
      "Cambiar de zona cuando el pase está claro.",
      "Reducir la velocidad en cada serie.",
    ],
    reference: { label: "KeepMove — Recursos de entrenamiento", url: "https://www.keepmove.net/recursosdeentrenamiento/" },
    phases: [
      { id: "conservacion-zona-alta", title: "Conservación en zona alta" },
      { id: "cambio-zona", title: "Cambio de zona" },
    ],
    cones: 2,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "activacion-con-pases-entre-lineas",
    category: "infantil",
    part: "warm-up",
    title: "Activación con pases entre líneas",
    summary: "Activación en doble cuadrado en la que el pase entre líneas abre la siguiente zona.",
    focus: "Activación",
    objective: "Activar el pase entre líneas y el apoyo por detrás del receptor.",
    players: { total: 10, goalkeepers: 0 },
    space: { label: "Doble cuadrado", widthM: 22, lengthM: 18 },
    durationMinutes: 10,
    intensity: { level: "low", percent: 50 },
    workStructure: "Bloques de 3 minutos x 3 series",
    constraints: [
      { rule: "Pase entre líneas obligatorio", detail: "Para cambiar de zona el balón debe pasar entre los dos conos centrales." },
      { rule: "Apoyo por detrás", detail: "El receptor siempre tiene un compañero de apoyo detrás del balón." },
    ],
    coachingCues: [
      "Mirar la línea antes de recibir.",
      "Pasar con el interior cuando el carril está libre.",
      "Acompañar el pase con un desmarque de apoyo.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "pase-interior", title: "Pase interior" },
      { id: "apoyo-detras", title: "Apoyo detrás del receptor" },
      { id: "cambio-zona", title: "Cambio de zona" },
    ],
    cones: 8,
    tokens: 10,
    keepers: 0,
  },
  {
    id: "ataque-3-1-con-cambio-de-orientacion",
    category: "infantil",
    part: "main",
    title: "Ataque 3-1 con cambio de orientación",
    summary: "Ataque en 3-1 que fija el cierre rival y libera el ala contraria con el pívot como enlace.",
    focus: "Ataque",
    objective: "Fijar la defensa en un lado y liberar el ala contraria con el pívot como enlace.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Pista completa", widthM: 20, lengthM: 40 },
    durationMinutes: 16,
    intensity: { level: "high", percent: 80 },
    workStructure: "Bloques de 4 minutos x 4 series",
    constraints: [
      { rule: "Pívot como enlace", detail: "El cambio de orientación debe pasar por el pívot." },
      { rule: "Dos toques en banda", detail: "Los alas juegan en un máximo de dos toques tras recibir." },
    ],
    coachingCues: [
      "Fijar al cierre antes del cambio.",
      "Pivotar con el cuerpo perfilado.",
      "Atacar el segundo palo del ala débil.",
    ],
    reference: { label: "Ejercicios de Fútbol Sala", url: "https://www.ejerciciosdefutbolsala.com/" },
    phases: [
      { id: "fijacion-cierre", title: "Fijación del cierre" },
      { id: "enlace-pivote", title: "Enlace del pívot" },
      { id: "cambio-ala", title: "Cambio de ala" },
    ],
    cones: 2,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "rondo-de-cierre-con-movilidad",
    category: "infantil",
    part: "cool-down",
    title: "Rondo de cierre con movilidad",
    summary: "Rondo final de baja intensidad combinado con movilidad de tobillo y cadera.",
    focus: "Vuelta a la calma",
    objective: "Cerrar la sesión con el balón en el pie y recuperar movilidad articular.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Cuadrado de cierre", widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 30 },
    workStructure: "Rondos de 60 segundos x 4 series",
    constraints: [
      { rule: "Toque libre", detail: "El rondo se juega sin límite de toques para mantener el ritmo bajo." },
      { rule: "Movilidad entre series", detail: "Entre serie y serie se realiza movilidad de tobillo y cadera." },
    ],
    coachingCues: [
      "Recibir con el pie de apoyo relajado.",
      "Mover el tobillo entre series.",
      "Terminar con respiración profunda.",
    ],
    reference: { label: "Adri Martín Futsal", url: "https://adrimartinofutsal.es.tl/" },
    phases: [
      { id: "rondo-final", title: "Rondo final" },
      { id: "movilidad-articular", title: "Movilidad articular" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "activacion-con-triangulos-y-desmarques",
    category: "cadete",
    part: "warm-up",
    title: "Activación con triángulos y desmarques",
    summary: "Activación por franjas con triángulos que se abren al desmarque del tercer hombre.",
    focus: "Activación",
    objective: "Activar el desmarque del tercer hombre dentro de un triángulo de pase.",
    players: { total: 9, goalkeepers: 0 },
    space: { label: "Franja de activación", widthM: 24, lengthM: 16 },
    durationMinutes: 10,
    intensity: { level: "low", percent: 50 },
    workStructure: "Bloques de 2 minutos x 4 series",
    constraints: [
      { rule: "Tercer hombre obligatorio", detail: "Cada serie debe incluir al menos un pase al tercer hombre." },
      { rule: "Franja limitada", detail: "El triángulo no puede salir de la franja de activación." },
    ],
    coachingCues: [
      "Fijar al primer defensor antes de abrir el triángulo.",
      "Desmarcarse fuera de la línea de pase.",
      "Recibir perfilado hacia la siguiente franja.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "triangulo-pase", title: "Triángulo de pase" },
      { id: "desmarque-tercer-hombre", title: "Desmarque del tercer hombre" },
    ],
    cones: 6,
    tokens: 9,
    keepers: 0,
  },
  {
    id: "presion-tras-saque-de-banda",
    category: "cadete",
    part: "main",
    title: "Presión tras saque de banda",
    summary: "Acción a balón parado defensiva que presiona el saque de banda y cierra la continuación.",
    focus: "ABP defensiva",
    objective: "Presionar el saque de banda y cerrar la primera línea de pase del rival.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Pista completa", widthM: 20, lengthM: 40 },
    durationMinutes: 16,
    intensity: { level: "high", percent: 85 },
    workStructure: "Series de 2 minutos x 5 repeticiones",
    constraints: [
      { rule: "Saque obligatorio por banda", detail: "El rival reinicia siempre con saque de banda en la misma banda." },
      { rule: "Cierre de la primera línea", detail: "El defensor más cercano debe impedir el pase interior antes de dos segundos." },
    ],
    coachingCues: [
      "Salir a presionar en el momento del saque.",
      "Cerrar el pase interior con el cuerpo.",
      "Orientar al rival hacia la banda.",
    ],
    reference: { label: "Ejercicios de Fútbol Sala", url: "https://www.ejerciciosdefutbolsala.com/" },
    phases: [
      { id: "saque-banda", title: "Saque de banda rival" },
      { id: "presion-primera-linea", title: "Presión de la primera línea" },
      { id: "cierre-continuacion", title: "Cierre de la continuación" },
    ],
    cones: 2,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "circulacion-suave-con-cambios-de-lado",
    category: "cadete",
    part: "cool-down",
    title: "Circulación suave con cambios de lado",
    summary: "Circulación sin oposición a ritmo bajo con cambios de lado largos y control orientado.",
    focus: "Vuelta a la calma",
    objective: "Recuperar la calma con circulación amplia y cambios de orientación suaves.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Rectángulo de cierre", widthM: 20, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: "low", percent: 35 },
    workStructure: "Bloques de 3 minutos x 2 series",
    constraints: [
      { rule: "Cambio de lado obligatorio", detail: "Cada serie incluye al menos dos cambios de lado largos." },
      { rule: "Ritmo bajo", detail: "Los jugadores circulan caminando y sin presión." },
    ],
    coachingCues: [
      "Orientar el primer toque hacia el lado contrario.",
      "Abrir el campo antes del cambio.",
      "Terminar la serie con estiramiento de aductor.",
    ],
    reference: { label: "KeepMove — Recursos de entrenamiento", url: "https://www.keepmove.net/recursosdeentrenamiento/" },
    phases: [
      { id: "circulacion-amplia", title: "Circulación amplia" },
      { id: "cambio-lado", title: "Cambio de lado" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "activacion-con-salida-de-presion-4v2",
    category: "juvenil",
    part: "warm-up",
    title: "Activación con salida de presión 4 contra 2",
    summary: "Activación con salida desde portero y cuatro jugadores ante dos presionadores.",
    focus: "Activación",
    objective: "Activar la salida con superioridad y el pase al hombre libre.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Medio campo", widthM: 24, lengthM: 20 },
    durationMinutes: 10,
    intensity: { level: "low", percent: 50 },
    workStructure: "Bloques de 2 minutos x 4 series",
    constraints: [
      { rule: "Superioridad obligatoria", detail: "La salida se juega siempre con cuatro jugadores más el portero." },
      { rule: "Dos toques", detail: "Cada jugador de salida juega en un máximo de dos toques." },
    ],
    coachingCues: [
      "Ofrecer líneas de pase al portero.",
      "Fijar a un presionador antes de pasar.",
      "Jugar al hombre libre del lado contrario.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "salida-superioridad", title: "Salida en superioridad" },
      { id: "pase-hombre-libre", title: "Pase al hombre libre" },
    ],
    cones: 4,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "ataque-4-0-con-rotacion-de-alas",
    category: "juvenil",
    part: "main",
    title: "Ataque 4-0 con rotación de alas",
    summary: "Ataque 4-0 con rotación continua de alas y pívot para desordenar el rombo rival.",
    focus: "Ataque",
    objective: "Desordenar la defensa en rombo con rotaciones de ala y cambio de orientación.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Pista completa", widthM: 20, lengthM: 40 },
    durationMinutes: 18,
    intensity: { level: "high", percent: 85 },
    workStructure: "Bloques de 4 minutos x 4 series",
    constraints: [
      { rule: "Rotación completa", detail: "Cada ataque incluye una rotación completa de ala antes de finalizar." },
      { rule: "Pívot fijo", detail: "El pívot mantiene el carril central durante la rotación." },
    ],
    coachingCues: [
      "Rotar sin perder la orientación del balón.",
      "Fijar al cierre antes de cambiar de ala.",
      "Finalizar al segundo palo.",
    ],
    reference: { label: "Ejercicios de Fútbol Sala", url: "https://www.ejerciciosdefutbolsala.com/" },
    phases: [
      { id: "rotacion-ala", title: "Rotación de ala" },
      { id: "fijacion-pivote", title: "Fijación del pívot" },
      { id: "ataque-ala-debil", title: "Ataque al ala débil" },
    ],
    cones: 2,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "conservacion-lenta-con-apoyos",
    category: "juvenil",
    part: "cool-down",
    title: "Conservación lenta con apoyos",
    summary: "Conservación tranquila con dos apoyos exteriores para cerrar la sesión sin riesgo.",
    focus: "Vuelta a la calma",
    objective: "Bajar la intensidad conservando el balón y usando los apoyos exteriores.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Rectángulo de cierre", widthM: 20, lengthM: 15 },
    durationMinutes: 8,
    intensity: { level: "low", percent: 35 },
    workStructure: "Bloques de 3 minutos x 2 series",
    constraints: [
      { rule: "Apoyo exterior obligatorio", detail: "Cada serie debe pasar al menos dos veces por un apoyo exterior." },
      { rule: "Sin presión", detail: "La conservación se juega sin oposición." },
    ],
    coachingCues: [
      "Circular el balón a ritmo lento.",
      "Usar el apoyo exterior cuando el centro se cierra.",
      "Respirar de forma pausada entre series.",
    ],
    reference: { label: "Adri Martín Futsal", url: "https://adrimartinofutsal.es.tl/" },
    phases: [
      { id: "conservacion-apoyos", title: "Conservación con apoyos" },
      { id: "cambio-lado-suave", title: "Cambio de lado suave" },
    ],
    cones: 4,
    tokens: 8,
    keepers: 0,
  },
  {
    id: "activacion-con-rondo-y-cambio-de-ritmo",
    category: "senior",
    part: "warm-up",
    title: "Activación con rondo y cambio de ritmo",
    summary: "Rondo de activación con cambio de ritmo y salida explosiva al espacio libre.",
    focus: "Activación",
    objective: "Activar la circulación y el cambio de ritmo antes de la parte principal.",
    players: { total: 9, goalkeepers: 0 },
    space: { label: "Cuadrado de rondo", widthM: 16, lengthM: 16 },
    durationMinutes: 10,
    intensity: { level: "low", percent: 50 },
    workStructure: "Rondos de 90 segundos x 5 series",
    constraints: [
      { rule: "Salida obligatoria", detail: "Cada serie termina con una salida al espacio libre." },
      { rule: "Dos toques", detail: "El rondo se juega en un máximo de dos toques." },
    ],
    coachingCues: [
      "Recibir perfilado antes de la salida.",
      "Acelerar solo en el último apoyo.",
      "Comunicar la salida al espacio.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "rondo-ritmo", title: "Rondo con ritmo" },
      { id: "cambio-ritmo", title: "Cambio de ritmo" },
      { id: "salida-espacio", title: "Salida al espacio" },
    ],
    cones: 4,
    tokens: 9,
    keepers: 0,
  },
  {
    id: "salida-4-0-ante-defensa-en-rombo",
    category: "senior",
    part: "main",
    title: "Salida 4-0 ante defensa en rombo",
    summary: "Salida 4-0 que ataca el rombo rival con fijación del pívot y cambio de ala.",
    focus: "Salida de presión",
    objective: "Atacar el rombo defensivo con la fijación del pívot y el cambio al ala débil.",
    players: { total: 10, goalkeepers: 2 },
    space: { label: "Pista completa", widthM: 20, lengthM: 40 },
    durationMinutes: 20,
    intensity: { level: "high", percent: 90 },
    workStructure: "Bloques de 4 minutos x 5 series",
    constraints: [
      { rule: "Pívot fijo", detail: "El pívot mantiene el carril central hasta el cambio de orientación." },
      { rule: "Cambio de ala obligatorio", detail: "La salida termina con un pase al ala débil." },
    ],
    coachingCues: [
      "Fijar al cierre antes de liberar el ala.",
      "Pivotar lejos del defensor.",
      "Atacar el espacio que deja el rombo.",
    ],
    reference: { label: "Manual de entrenamiento de fútbol sala de la UEFA", url: "https://editorial.uefa.com/resources/025d-0f842ced7bbc-db8606c7d9fa-1000/manual_de_entrenamiento_de_futbol_sala_de_la_uefa.pdf" },
    phases: [
      { id: "salida-4-0", title: "Salida 4-0" },
      { id: "fijacion-pivote", title: "Fijación del pívot" },
      { id: "cambio-ala-debil", title: "Cambio al ala débil" },
    ],
    cones: 2,
    tokens: 10,
    keepers: 2,
  },
  {
    id: "vuelta-a-la-calma-con-respiracion-guiada",
    category: "senior",
    part: "cool-down",
    title: "Vuelta a la calma con respiración guiada",
    summary: "Estiramientos y respiración guiada para cerrar la sesión y bajar las pulsaciones.",
    focus: "Vuelta a la calma",
    objective: "Recuperar la calma con estiramientos suaves y respiración controlada.",
    players: { total: 8, goalkeepers: 0 },
    space: { label: "Círculo de cierre", widthM: 10, lengthM: 10 },
    durationMinutes: 6,
    intensity: { level: "low", percent: 25 },
    workStructure: "Bloques de 2 minutos x 3 series",
    constraints: [
      { rule: "Respiración guiada", detail: "Cada estiramiento se mantiene durante cuatro respiraciones lentas." },
      { rule: "Sin balón en la segunda fase", detail: "La respiración final se realiza sin balón y en silencio." },
    ],
    coachingCues: [
      "Mantener el estiramiento sin rebotes.",
      "Inspirar por la nariz y espirar por la boca.",
      "Terminar la sesión en círculo.",
    ],
    reference: { label: "KeepMove — Recursos de entrenamiento", url: "https://www.keepmove.net/recursosdeentrenamiento/" },
    phases: [
      { id: "estiramiento-guiado", title: "Estiramiento guiado" },
      { id: "respiracion-final", title: "Respiración final" },
    ],
    cones: 0,
    tokens: 8,
    keepers: 0,
  },
];

const WEEKLY_PLAN_BY_ID = new Map(
  WEEKLY_EXERCISE_PLANS.map((plan) => [plan.id, plan] as const),
);

function expectedPlansFor(categoryId: CategoryId): WeeklyPlan[] {
  return WEEKLY_EXERCISE_PLANS.filter((plan) => plan.category === categoryId);
}

describe('Weekly highlight seed', () => {
  describe('Given the bundled content package', () => {
    describe('When the collections are read', () => {
      it('then it holds 71 exercises, 7 Programming records, and 78 audited records', () => {
        const programming = CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId),
        );

        assert.equal(bundledExercises.length, 71);
        assert.equal(libraryExercises.length, 50);
        assert.equal(weeklyExercises.length, 21);
        assert.equal(listExercises(repository).length, 71);
        assert.equal(programming.length, 7);
        assert.equal(bundledExercises.length + programming.length, 78);
      });

      it('then the fifty library exercises keep their seeded package order', () => {
        assert.deepEqual(
          libraryExercises.map((exercise) => exercise.id),
          LIBRARY_EXERCISE_IDS,
        );
        assert.equal(libraryExercises.length, 50);
        assert.ok(libraryExercises.every((exercise) => exercise.collection === 'library'));
      });

      it('then the twenty-one weekly highlights keep the planned package order', () => {
        assert.deepEqual(
          weeklyExercises.map((exercise) => exercise.id),
          WEEKLY_EXERCISE_IDS,
        );
        assert.equal(weeklyExercises.length, 21);
        assert.ok(weeklyExercises.every((exercise) => exercise.collection === 'weekly'));
      });

      it('then no exercise id or title repeats across the package', () => {
        assert.equal(new Set(bundledExercises.map((exercise) => exercise.id)).size, 71);
        assert.equal(new Set(bundledExercises.map((exercise) => exercise.title)).size, 71);
        assert.equal(
          libraryExercises.some((libraryExercise) =>
            weeklyExercises.some((weeklyExercise) => weeklyExercise.id === libraryExercise.id),
          ),
          false,
        );
        assert.equal(
          libraryExercises.some((libraryExercise) =>
            weeklyExercises.some(
              (weeklyExercise) => weeklyExercise.title === libraryExercise.title,
            ),
          ),
          false,
        );
      });
    });

    describe('When each category is inspected', () => {
      for (const categoryId of CATEGORY_IDS) {
        it(`then ${categoryId} exposes its three weekly highlights, one per session part`, () => {
          const categoryWeekly = listWeeklyHighlights(repository, categoryId);
          const categoryLibrary = listLibraryExercises(repository, categoryId);

          assert.deepEqual(
            categoryWeekly.map((exercise) => exercise.id),
            expectedPlansFor(categoryId).map((plan) => plan.id),
          );
          assert.equal(categoryWeekly.length, 3);
          assert.deepEqual(
            categoryWeekly.map((exercise) => exercise.sessionPart),
            ['warm-up', 'main', 'cool-down'],
          );
          assert.ok(
            categoryWeekly.every(
              (exercise) =>
                exercise.collection === 'weekly' &&
                exercise.status === 'published' &&
                exercise.categoryIds.length === 1 &&
                exercise.categoryIds[0] === categoryId,
            ),
          );
          assert.equal(
            categoryWeekly.some((weeklyExercise) =>
              categoryLibrary.some((libraryExercise) => libraryExercise.id === weeklyExercise.id),
            ),
            false,
          );
        });
      }

      it('then every category owns one weekly highlight per part and none overlaps the library', () => {
        const weeklyIds = new Set<string>();
        const libraryIds = new Set(libraryExercises.map((exercise) => exercise.id));

        for (const categoryId of CATEGORY_IDS) {
          const categoryWeekly = listWeeklyHighlights(repository, categoryId);
          const parts = categoryWeekly.map((exercise) => exercise.sessionPart);

          assert.deepEqual(parts, ['warm-up', 'main', 'cool-down']);
          for (const exercise of categoryWeekly) {
            assert.equal(weeklyIds.has(exercise.id), false);
            assert.equal(libraryIds.has(exercise.id), false);
            weeklyIds.add(exercise.id);
          }
        }

        assert.equal(weeklyIds.size, 21);
      });
    });
  });

  describe('Given the 21 weekly exercise records', () => {
    for (const plan of WEEKLY_EXERCISE_PLANS) {
      it(`then ${plan.id} matches its metadata, Spanish copy, and citation`, () => {
        const exercise = getExercise(repository, plan.id);

        assert.ok(exercise);
        assert.equal(exercise.id, plan.id);
        assert.equal(exercise.collection, 'weekly');
        assert.equal(exercise.sessionPart, plan.part);
        assert.deepEqual(exercise.categoryIds, [plan.category]);
        assert.equal(exercise.title, plan.title);
        assert.equal(exercise.summary, plan.summary);
        assert.equal(exercise.focus, plan.focus);
        assert.equal(exercise.objective, plan.objective);
        assert.deepEqual(exercise.players, plan.players);
        assert.deepEqual(exercise.space, plan.space);
        assert.equal(exercise.durationMinutes, plan.durationMinutes);
        assert.deepEqual(exercise.intensity, plan.intensity);
        assert.equal(exercise.workStructure, plan.workStructure);
        assert.deepEqual(exercise.constraints, plan.constraints);
        assert.equal(exercise.constraints.length, 2);
        assert.deepEqual(exercise.coachingCues, plan.coachingCues);
        assert.equal(exercise.coachingCues.length, 3);
        assert.deepEqual(exercise.references, [plan.reference]);
        assert.equal(exercise.status, 'published');
        assert.deepEqual(exercise.provenance, {
          kind: 'original',
          sourceName: 'Futsal Manager AI',
          licenseStatus: 'owned',
        });
        assert.equal(exercise.provenance.attribution, undefined);
      });
    }
  });

  describe('Given the weekly exercise boards', () => {
    it('then all 21 boards re-parse as Board Data 1.0.0', () => {
      assert.equal(weeklyExercises.length, 21);
      assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');

      for (const exercise of weeklyExercises) {
        assert.equal(exercise.boardData.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
        assert.equal(exercise.boardData.pitch.format, 'full');
        assert.ok(parseBoardData(exercise.boardData).phases.length >= 2);
      }
    });

    for (const plan of WEEKLY_EXERCISE_PLANS) {
      it(`then ${plan.id} draws a coherent board`, () => {
        const exercise = getExercise(repository, plan.id);

        assert.ok(exercise);

        const board = parseBoardData(exercise.boardData);
        const tokenIds = board.tokens.map((token) => token.id);

        assert.equal(board.schemaVersion, BOARD_DATA_SCHEMA_VERSION);
        assert.equal(board.pitch.format, 'full');
        assert.equal(board.phases.length, plan.phases.length);
        assert.deepEqual(
          board.phases.map((phase) => phase.order),
          board.phases.map((_, index) => index + 1),
        );
        assert.deepEqual(
          board.phases.map((phase) => ({ id: phase.id, title: phase.title })),
          plan.phases,
        );
        assert.equal(board.tokens.length, plan.tokens);
        assert.equal(board.tokens.length, plan.players.total);
        assert.equal(
          board.tokens.filter((token) => token.kind === 'keeper').length,
          plan.keepers,
        );
        assert.equal(
          board.tokens.filter((token) => token.kind === 'keeper').length,
          plan.players.goalkeepers,
        );
        assert.equal(new Set(tokenIds).size, tokenIds.length);
        assert.equal(board.cones.length, plan.cones);

        for (const token of board.tokens) {
          assert.ok(token.label.trim().length >= 1 && token.label.trim().length <= 3);
        }

        for (const phase of board.phases) {
          assert.deepEqual(
            [...phase.positions.map((position) => position.tokenId)].sort(),
            [...tokenIds].sort(),
          );
          assert.equal(new Set(phase.positions.map((position) => position.tokenId)).size, tokenIds.length);
          assert.ok(phase.ball);

          for (const point of [...phase.positions, phase.ball]) {
            assert.ok(point.x >= 4 && point.x <= 96);
            assert.ok(point.y >= 4 && point.y <= 96);
          }

          const arrowIds = phase.arrows.map((arrow) => arrow.id);

          assert.equal(new Set(arrowIds).size, arrowIds.length);
          for (const arrow of phase.arrows) {
            assert.notDeepEqual(arrow.from, arrow.to);
          }
        }
      });
    }
  });

  describe('Given the reference citations', () => {
    it('then only weekly exercises carry exactly one citation and stay within the limit', () => {
      assert.equal(EXERCISE_LIMITS.maxReferences, 3);

      for (const exercise of weeklyExercises) {
        assert.equal(exercise.references?.length, 1);
      }

      for (const exercise of libraryExercises) {
        assert.equal(exercise.references, undefined);
      }
    });

    it('then every citation uses one of the four public inspiration labels', () => {
      const labelToUrl = new Map(
        WEEKLY_EXERCISE_PLANS.map((plan) => [plan.reference.label, plan.reference.url]),
      );
      const seenLabels = new Set<string>();

      for (const exercise of weeklyExercises) {
        const reference = exercise.references?.[0];

        assert.ok(reference);
        assert.ok(EXPECTED_REFERENCE_LABELS.includes(reference.label));
        assert.equal(labelToUrl.get(reference.label), reference.url);
        seenLabels.add(reference.label);
      }

      assert.deepEqual(
        [...seenLabels].sort(),
        [...EXPECTED_REFERENCE_LABELS].sort(),
      );
    });

    it('then every citation is an absolute http(s) URL that never leaks into the copy or provenance', () => {
      for (const exercise of weeklyExercises) {
        const reference = exercise.references?.[0];

        assert.ok(reference);
        assert.match(reference.url, /^https?:\/\/\S+$/);

        const copy = [
          exercise.title,
          exercise.summary,
          exercise.focus,
          exercise.objective,
          exercise.workStructure,
          ...exercise.constraints.map((constraint) => constraint.rule),
          ...exercise.constraints.map((constraint) => constraint.detail),
          ...exercise.coachingCues,
          exercise.provenance.sourceName,
        ].join(' ');

        assert.equal(copy.includes(reference.url), false);
        assert.equal(copy.includes(new URL(reference.url).hostname), false);
      }
    });
  });

  describe('Given the version pins', () => {
    it('then the package is 1.2.0, Board Data is 1.0.0, and the Infantil plan keeps 1.1.0', () => {
      assert.equal(CONTENT_PACKAGE_VERSION, '1.2.0');
      assert.equal(readBundledPackage().contentVersion, '1.2.0');
      assert.equal(BOARD_DATA_SCHEMA_VERSION, '1.0.0');
      assert.equal(repository.getProgrammingByCategory('infantil')[0]?.version, '1.1.0');

      for (const categoryId of CATEGORY_IDS) {
        const programmed = repository.getProgrammingByCategory(categoryId);

        assert.equal(programmed.length, 1);
        assert.equal(programmed[0]?.status, 'published');
      }
    });

    it('then the fifty legacy exercises changed only by gaining the library collection', () => {
      const legacyExercises = bundledExercises.slice(0, 50);

      assert.deepEqual(
        legacyExercises.map((exercise) => exercise.id),
        LIBRARY_EXERCISE_IDS,
      );
      assert.ok(legacyExercises.every((exercise) => exercise.collection === 'library'));
      assert.ok(
        legacyExercises.every((exercise) => !('references' in exercise)),
      );
      assert.equal(
        createHash('sha256')
          .update(
            stableStringify(
              legacyExercises.map((exercise) =>
                Object.fromEntries(
                  Object.entries(exercise).filter(([key]) => key !== 'collection'),
                ),
              ),
            ),
          )
          .digest('hex'),
        LEGACY_LIBRARY_FINGERPRINT,
      );
      assert.equal(
        repository.getProgrammingByCategory('infantil')[0]?.id,
        'infantil-u14-base',
      );
      assert.deepEqual(
        CATEGORY_IDS.flatMap((categoryId) =>
          repository.getProgrammingByCategory(categoryId).map((record) => record.id),
        ).sort(),
        [
          'alevin-u12-base',
          'benjamin-u10-base',
          'cadete-u16-base',
          'infantil-u14-base',
          'juvenil-u19-base',
          'prebenjamin-u8-base',
          'senior-base',
        ],
      );
    });
  });
});
