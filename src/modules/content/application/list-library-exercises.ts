import type { CategoryId } from '../domain/category';
import type { ContentRepository } from '../domain/ports/content-repository';
import type { Exercise } from '../domain/exercise';
import { listExercises } from './list-exercises';

export function listLibraryExercises(
  repository: ContentRepository,
  categoryId?: CategoryId,
): Exercise[] {
  return listExercises(repository, { categoryId }).filter(
    (exercise) => exercise.collection === 'library',
  );
}
