import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCategoryById, type Category, type CategoryId } from '../../domain/category';
import {
  INITIAL_CATEGORY_SELECTION,
  selectCategory,
  type CategorySelection,
} from './category-selection';

type CategorySelectionContextValue = {
  categoryId: CategoryId | null;
  selectedCategory: Category | null;
  selectCategory: (categoryId: CategoryId) => void;
};

const CategorySelectionContext = createContext<CategorySelectionContextValue | null>(
  null,
);

type CategorySelectionProviderProps = {
  children: ReactNode;
};

export function CategorySelectionProvider({ children }: CategorySelectionProviderProps) {
  const [selection, setSelection] = useState<CategorySelection>(INITIAL_CATEGORY_SELECTION);

  const selectCategoryCallback = useCallback((categoryId: CategoryId) => {
    setSelection((currentSelection) => selectCategory(currentSelection, categoryId));
  }, []);

  const value = useMemo<CategorySelectionContextValue>(
    () => ({
      categoryId: selection.categoryId,
      selectedCategory: selection.categoryId
        ? (getCategoryById(selection.categoryId) ?? null)
        : null,
      selectCategory: selectCategoryCallback,
    }),
    [selection.categoryId, selectCategoryCallback],
  );

  return (
    <CategorySelectionContext.Provider value={value}>
      {children}
    </CategorySelectionContext.Provider>
  );
}

export function useCategorySelection(): CategorySelectionContextValue {
  const context = useContext(CategorySelectionContext);

  if (!context) {
    throw new Error(
      'useCategorySelection must be used inside CategorySelectionProvider.',
    );
  }

  return context;
}
