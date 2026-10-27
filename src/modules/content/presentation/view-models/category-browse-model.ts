import { getProgramming } from '../../application/get-programming';
import { listExercises } from '../../application/list-exercises';
import type { Category } from '../../domain/category';
import type { Exercise, ExerciseIntensityLevel } from '../../domain/exercise';
import type { ContentRepository } from '../../domain/ports/content-repository';
import type { Programming } from '../../domain/programming';

export type CategoryBrowseModel = {
  category: Category;
  programming: Programming | null;
  exercises: Exercise[];
};

const INTENSITY_LABELS: Record<ExerciseIntensityLevel, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export function buildCategoryBrowseModel(
  repository: ContentRepository,
  category: Category,
): CategoryBrowseModel {
  return {
    category,
    programming: getProgramming(repository, category.id),
    exercises: listExercises(repository, { categoryId: category.id }),
  };
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
