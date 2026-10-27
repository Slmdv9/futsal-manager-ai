import type { CategoryId } from '../domain/category';
import type { ContentRepository } from '../domain/ports/content-repository';
import { isPublishedExercise, type Exercise } from '../domain/exercise';

export type ListExercisesQuery = {
  categoryId?: CategoryId;
};

export function listExercises(
  repository: ContentRepository,
  query: ListExercisesQuery = {},
): Exercise[] {
  const seenExerciseIds = new Set<string>();
  const exercises: Exercise[] = [];

  repository.getExercises().forEach((exercise) => {
    if (!isPublishedExercise(exercise) || seenExerciseIds.has(exercise.id)) {
      return;
    }

    seenExerciseIds.add(exercise.id);

    if (query.categoryId && !exercise.categoryIds.includes(query.categoryId)) {
      return;
    }

    exercises.push(exercise);
  });

  return exercises;
}
