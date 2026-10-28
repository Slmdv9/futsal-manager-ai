import { listCategories } from '../../application/list-categories';
import { listExercises } from '../../application/list-exercises';
import { listWeeklyHighlights } from '../../application/list-weekly-highlights';
import type { Category } from '../../domain/category';
import type { Exercise } from '../../domain/exercise';
import type { ContentRepository } from '../../domain/ports/content-repository';
import type { Programming } from '../../domain/programming';
import { SESSION_PARTS, type SessionPart } from '../../domain/session-part';
import {
  buildCategoryBrowseModel,
  formatExerciseCount,
  formatSessionDuration,
  formatSessionPartLabel,
} from './category-browse-model';

export const WEEKLY_EXERCISES_PER_PART = 1;
export const METHODOLOGY_KEY_CONCEPTS_LIMIT = 3;

export type WeeklyExercise = {
  part: SessionPart;
  label: string;
  exercise: Exercise;
};

export type MethodologyOverview = {
  stage: string;
  focus: string;
  playModel: string;
  sessionDurationLabel: string;
  keyConcepts: string[];
};

export type ExploreStats = {
  exerciseCount: number;
  categoryCount: number;
  openLabel: string;
};

export type ExploreGeneralModel = {
  stats: ExploreStats;
  weeklyExercises: WeeklyExercise[];
  methodology: MethodologyOverview | null;
};

export function buildExploreStats(repository: ContentRepository): ExploreStats {
  return {
    exerciseCount: listExercises(repository).length,
    categoryCount: listCategories().length,
    openLabel: '100%',
  };
}

export function buildWeeklyExercises(
  exercises: readonly Exercise[],
): WeeklyExercise[] {
  return SESSION_PARTS.flatMap((part) => {
    const partExercises = exercises.filter((exercise) => exercise.sessionPart === part);

    return partExercises.slice(0, WEEKLY_EXERCISES_PER_PART).map((exercise) => ({
      part,
      label: formatSessionPartLabel(part),
      exercise,
    }));
  });
}

export function buildMethodologyOverview(
  programming: Programming | null,
): MethodologyOverview | null {
  if (!programming) {
    return null;
  }

  return {
    stage: programming.formativeStage,
    focus: programming.focus,
    playModel: programming.playModel,
    sessionDurationLabel: formatSessionDuration(programming),
    keyConcepts: programming.keyConcepts.slice(0, METHODOLOGY_KEY_CONCEPTS_LIMIT),
  };
}

export function buildExploreGeneralModel(
  repository: ContentRepository,
  category: Category | null,
): ExploreGeneralModel {
  const stats = buildExploreStats(repository);

  if (!category) {
    return {
      stats,
      weeklyExercises: [],
      methodology: null,
    };
  }

  const browseModel = buildCategoryBrowseModel(repository, category);

  return {
    stats,
    weeklyExercises: buildWeeklyExercises(listWeeklyHighlights(repository, category.id)),
    methodology: buildMethodologyOverview(browseModel.programming),
  };
}

export function formatWeeklySelection(count: number): string {
  return formatExerciseCount(count);
}
