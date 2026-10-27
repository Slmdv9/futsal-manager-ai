import { getProgramming } from '../../application/get-programming';
import { listExercises } from '../../application/list-exercises';
import type { Category } from '../../domain/category';
import type { Exercise, ExerciseIntensityLevel } from '../../domain/exercise';
import type { ContentRepository } from '../../domain/ports/content-repository';
import type { Programming } from '../../domain/programming';
import { SESSION_PARTS, type SessionPart } from '../../domain/session-part';

export type SessionPartGroup = {
  part: SessionPart;
  label: string;
  exercises: Exercise[];
};

export type CategoryBrowseModel = {
  category: Category;
  programming: Programming | null;
  exercises: Exercise[];
  sessionParts: SessionPartGroup[];
};

const INTENSITY_LABELS: Record<ExerciseIntensityLevel, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const SESSION_PART_LABELS: Record<SessionPart, string> = {
  'warm-up': 'Calentamiento',
  main: 'Parte general',
  'cool-down': 'Vuelta a la calma',
};

export function buildCategoryBrowseModel(
  repository: ContentRepository,
  category: Category,
): CategoryBrowseModel {
  const exercises = listExercises(repository, { categoryId: category.id });

  return {
    category,
    programming: getProgramming(repository, category.id),
    exercises,
    sessionParts: groupExercisesBySessionPart(exercises),
  };
}

export function groupExercisesBySessionPart(
  exercises: readonly Exercise[],
): SessionPartGroup[] {
  return SESSION_PARTS.map((part) => ({
    part,
    label: formatSessionPartLabel(part),
    exercises: exercises.filter((exercise) => exercise.sessionPart === part),
  }));
}

export function formatSessionPartLabel(part: SessionPart): string {
  return SESSION_PART_LABELS[part];
}

export function formatCategoryLabel(category: Category): string {
  return `${category.name} (${category.ageLabel})`;
}

export function formatExerciseMeta(exercise: Exercise): string {
  return [
    `${exercise.durationMinutes} min`,
    `${exercise.players.total} jugadores`,
    `Intensidad ${INTENSITY_LABELS[exercise.intensity.level].toLowerCase()}`,
  ].join(' · ');
}

export function formatSessionDuration(programming: Programming): string {
  const { min, max } = programming.sessionDurationMinutes;

  if (min === max) {
    return `Sesiones de ${min} min`;
  }

  return `Sesiones de ${min}\u2013${max} min`;
}

export function formatExerciseCount(count: number): string {
  return count === 1 ? '1 ejercicio' : `${count} ejercicios`;
}
