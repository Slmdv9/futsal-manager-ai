import type { BoardData } from '@/shared/domain';
import type { CategoryId } from './category';
import type { ExerciseCollection } from './exercise-collection';
import { isPublishableProvenance, type ContentProvenance } from './provenance';
import type { SessionPart } from './session-part';

export const EXERCISE_STATUSES = ['draft', 'published', 'archived'] as const;

export type ExerciseStatus = (typeof EXERCISE_STATUSES)[number];

export const EXERCISE_INTENSITY_LEVELS = ['low', 'medium', 'high'] as const;

export type ExerciseIntensityLevel = (typeof EXERCISE_INTENSITY_LEVELS)[number];

export type ExercisePlayers = {
  total: number;
  goalkeepers: number;
};

export type ExerciseSpace = {
  label: string;
  widthM: number;
  lengthM: number;
};

export type ExerciseIntensity = {
  level: ExerciseIntensityLevel;
  percent?: number;
};

export type ExerciseConstraint = {
  rule: string;
  detail: string;
};

export type ExerciseReference = {
  label: string;
  url: string;
};

export type Exercise = {
  id: string;
  title: string;
  summary: string;
  focus: string;
  sessionPart: SessionPart;
  collection: ExerciseCollection;
  categoryIds: CategoryId[];
  objective: string;
  players: ExercisePlayers;
  space: ExerciseSpace;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  workStructure: string;
  constraints: ExerciseConstraint[];
  coachingCues: string[];
  boardData: BoardData;
  status: ExerciseStatus;
  provenance: ContentProvenance;
  references?: ExerciseReference[];
};

export const EXERCISE_LIMITS = {
  minDurationMinutes: 5,
  maxDurationMinutes: 120,
  maxCategoryIds: 3,
  maxConstraints: 6,
  maxCoachingCues: 8,
  maxReferences: 3,
} as const;

export function isPublishedExercise(exercise: Exercise): boolean {
  return exercise.status === 'published';
}

export function isPublishableExercise(exercise: Exercise): boolean {
  return isPublishedExercise(exercise) && isPublishableProvenance(exercise.provenance);
}
