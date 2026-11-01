import bundledContentPackage from './content/content-package.json';
import { parseContentPackage } from '../domain/content-package';
import type { CategoryId } from '../domain/category';
import type { ContentRepository } from '../domain/ports/content-repository';
import type { Programming } from '../domain/programming';

let bundledRepository: ContentRepository | null = null;

function buildRepository(rawContentPackage: unknown): ContentRepository {
  const contentPackage = parseContentPackage(rawContentPackage);
  const exercisesById = new Map(contentPackage.exercises.map((exercise) => [exercise.id, exercise]));
  const programmingByCategory = new Map<CategoryId, Programming[]>();

  contentPackage.programming.forEach((programming) => {
    const records = programmingByCategory.get(programming.categoryId) ?? [];
    records.push(programming);
    programmingByCategory.set(programming.categoryId, records);
  });

  return {
    getExercises: () => contentPackage.exercises,
    getExerciseById: (exerciseId) => exercisesById.get(exerciseId),
    getProgrammingByCategory: (categoryId) => programmingByCategory.get(categoryId) ?? [],
  };
}

export function createBundledContentRepository(): ContentRepository {
  if (bundledRepository === null) {
    bundledRepository = buildRepository(bundledContentPackage);
  }

  return bundledRepository;
}
