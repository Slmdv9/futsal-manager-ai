import { CATEGORIES, type Category } from '../domain/category';

export function listCategories(): readonly Category[] {
  return CATEGORIES;
}
