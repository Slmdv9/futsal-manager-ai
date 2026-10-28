export const EXERCISE_COLLECTIONS = ['library', 'weekly'] as const;

export type ExerciseCollection = (typeof EXERCISE_COLLECTIONS)[number];
