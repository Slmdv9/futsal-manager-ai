import type { CategoryId } from '../category';
import type { Exercise } from '../exercise';
import type { Programming } from '../programming';

export interface ContentRepository {
  getExercises(): readonly Exercise[];
  getExerciseById(exerciseId: string): Exercise | undefined;
  getProgrammingByCategory(categoryId: CategoryId): readonly Programming[];
}
