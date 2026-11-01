export const CATEGORY_IDS = [
  'prebenjamin',
  'benjamin',
  'alevin',
  'infantil',
  'cadete',
  'juvenil',
  'senior',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  name: string;
  ageLabel: string;
  ageRange: { min: number; max: number } | null;
  order: number;
};

const CATEGORY_SEED: readonly Category[] = [
  {
    id: 'prebenjamin',
    name: 'Prebenjamín',
    ageLabel: 'U8',
    ageRange: { min: 6, max: 7 },
    order: 1,
  },
  {
    id: 'benjamin',
    name: 'Benjamín',
    ageLabel: 'U10',
    ageRange: { min: 8, max: 9 },
    order: 2,
  },
  {
    id: 'alevin',
    name: 'Alevín',
    ageLabel: 'U12',
    ageRange: { min: 10, max: 11 },
    order: 3,
  },
  {
    id: 'infantil',
    name: 'Infantil',
    ageLabel: 'U14',
    ageRange: { min: 12, max: 13 },
    order: 4,
  },
  {
    id: 'cadete',
    name: 'Cadete',
    ageLabel: 'U16',
    ageRange: { min: 14, max: 15 },
    order: 5,
  },
  {
    id: 'juvenil',
    name: 'Juvenil',
    ageLabel: 'U19',
    ageRange: { min: 16, max: 18 },
    order: 6,
  },
  {
    id: 'senior',
    name: 'Senior',
    ageLabel: '+18',
    ageRange: null,
    order: 7,
  },
];

export const CATEGORIES: readonly Category[] = Object.freeze(
  CATEGORY_SEED.map((category) => Object.freeze(category)),
);

const CATEGORY_ID_SET: ReadonlySet<string> = new Set(CATEGORY_IDS);

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && CATEGORY_ID_SET.has(value);
}

export function getCategoryById(categoryId: CategoryId): Category | undefined {
  return CATEGORIES.find((category) => category.id === categoryId);
}
