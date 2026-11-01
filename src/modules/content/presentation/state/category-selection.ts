import { isCategoryId, type CategoryId } from '../../domain/category';

export type CategorySelection = {
  categoryId: CategoryId | null;
};

export const INITIAL_CATEGORY_SELECTION: CategorySelection = Object.freeze({
  categoryId: null,
});

export function selectCategory(
  state: CategorySelection,
  categoryId: unknown,
): CategorySelection {
  if (!isCategoryId(categoryId)) {
    return state;
  }

  return { categoryId };
}
