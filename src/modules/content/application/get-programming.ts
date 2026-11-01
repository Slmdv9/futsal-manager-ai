import type { CategoryId } from '../domain/category';
import type { ContentRepository } from '../domain/ports/content-repository';
import { isPublishableProgramming, type Programming } from '../domain/programming';

export function getProgramming(
  repository: ContentRepository,
  categoryId: CategoryId,
): Programming | null {
  return (
    repository
      .getProgrammingByCategory(categoryId)
      .find((programming) => isPublishableProgramming(programming)) ?? null
  );
}
