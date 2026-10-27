import type { ContentRepository } from '../domain/ports/content-repository';
import { isPublishedExercise, type Exercise } from '../domain/exercise';

export function getExercise(
  repository: ContentRepository,
  exerciseId: string,
): Exercise | null {
  const exercise = repository.getExerciseById(exerciseId);

  if (!exercise || !isPublishedExercise(exercise)) {
    return null;
  }

  return exercise;
}
