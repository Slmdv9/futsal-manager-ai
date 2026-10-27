export { ExploreScreen } from './presentation/screens/explore-screen';

export {
  CATEGORIES,
  CATEGORY_IDS,
  getCategoryById,
  isCategoryId,
  type Category,
  type CategoryId,
} from './domain/category';
export {
  CONTENT_PACKAGE_ROOT_ISSUE_PATH,
  CONTENT_PACKAGE_VERSION,
  ContentValidationError,
  parseContentPackage,
  safeParseContentPackage,
  type ContentPackage,
  type ContentPackageParseResult,
  type ContentValidationIssue,
} from './domain/content-package';
export {
  EXERCISE_INTENSITY_LEVELS,
  EXERCISE_LIMITS,
  EXERCISE_STATUSES,
  isPublishedExercise,
  type Exercise,
  type ExerciseConstraint,
  type ExerciseIntensity,
  type ExerciseIntensityLevel,
  type ExercisePlayers,
  type ExerciseSpace,
  type ExerciseStatus,
} from './domain/exercise';
export {
  PROGRAMMING_LIMITS,
  PROGRAMMING_STATUSES,
  isPublishedProgramming,
  type Macrocycle,
  type Microcycle,
  type Programming,
  type ProgrammingStatus,
  type SessionPart,
  type SessionStructureEntry,
} from './domain/programming';
export {
  CONTENT_LICENSE_STATUSES,
  CONTENT_PROVENANCE_KINDS,
  type ContentLicenseStatus,
  type ContentProvenance,
  type ContentProvenanceKind,
} from './domain/provenance';
export type { ContentRepository } from './domain/ports/content-repository';

export { listCategories } from './application/list-categories';
export { listExercises, type ListExercisesQuery } from './application/list-exercises';
export { getExercise } from './application/get-exercise';
export { getProgramming } from './application/get-programming';

export { createBundledContentRepository } from './infrastructure/bundled-content-repository';
