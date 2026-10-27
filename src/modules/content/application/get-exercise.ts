import type { ContentRepository } from '../domain/ports/content-repository';
import { isPublishableExercise, type Exercise } from '../domain/exercise';

export function getExercise(
  repository: ContentRepository,
  exerciseId: string,
): Exercise | null {
  const exercise = repository.getExerciseById(exerciseId);

  if (!exercise || !isPublishableExercise(exercise)) {
    return null;
  }

  return exercise;
}
