import { z } from 'zod';
import { BOARD_DATA_ROOT_ISSUE_PATH, safeParseBoardData } from '@/shared/domain';
import { CATEGORY_IDS } from './category';
import type { CategoryId } from './category';
import { EXERCISE_LIMITS, EXERCISE_STATUSES, type Exercise } from './exercise';
import {
  PROGRAMMING_LIMITS,
  PROGRAMMING_STATUSES,
  type Programming,
} from './programming';
import { SESSION_PARTS } from './session-part';
import {
  CONTENT_LICENSE_STATUSES,
  CONTENT_PROVENANCE_KINDS,
  LICENSE_STATUSES_BY_PROVENANCE_KIND,
  PUBLISHABLE_LICENSE_STATUSES,
  isLicenseStatusAllowedForKind,
  isPublishableProvenance,
  requiresAttribution,
  type ContentLicenseStatus,
  type ContentProvenance,
  type ContentProvenanceKind,
} from './provenance';

export const CONTENT_PACKAGE_VERSION = '1.1.0' as const;

export const CONTENT_PACKAGE_ROOT_ISSUE_PATH = '(root)';

export type ContentPackage = {
  contentVersion: typeof CONTENT_PACKAGE_VERSION;
  exercises: Exercise[];
  programming: Programming[];
};

export type ContentValidationIssue = {
  path: string;
  message: string;
};

export type ContentPackageParseResult =
  | { success: true; data: ContentPackage }
  | { success: false; issues: ContentValidationIssue[] };

export class ContentValidationError extends Error {
  readonly issues: ContentValidationIssue[];

  constructor(issues: ContentValidationIssue[]) {
    const details = issues
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join('; ');
    super(`Invalid content package — ${details}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(SLUG_PATTERN, 'Use a lowercase slug such as "salida-3-1".');

const textSchema = (max: number) => z.string().trim().min(1).max(max);

const MISSING_PROVENANCE_MESSAGE =
  'Provenance is required on every Exercise and Programming record.';

function formatLicenseStatusList(statuses: readonly ContentLicenseStatus[]): string {
  return statuses.map((status) => `"${status}"`).join(' or ');
}

function formatAttributionReason(provenance: ContentProvenance): string {
  return provenance.licenseStatus === 'permitted'
    ? 'licenseStatus "permitted"'
    : `kind "${provenance.kind}"`;
}

function formatKindStatusMessage(
  kind: ContentProvenanceKind,
  licenseStatus: ContentLicenseStatus,
): string {
  return `License status "${licenseStatus}" is not allowed for kind "${kind}"; use ${formatLicenseStatusList(
    LICENSE_STATUSES_BY_PROVENANCE_KIND[kind],
  )}.`;
}

function addProvenanceIssues(
  ctx: z.RefinementCtx,
  recordPath: (string | number)[],
  status: string,
  provenance: ContentProvenance,
): void {
  const licenseStatusPath = [...recordPath, 'provenance', 'licenseStatus'];
  const isPublished = status === 'published';

  if (isPublished && !isPublishableProvenance(provenance)) {
    ctx.addIssue({
      code: 'custom',
      path: licenseStatusPath,
      message: `Published content requires licenseStatus ${formatLicenseStatusList(
        PUBLISHABLE_LICENSE_STATUSES,
      )}; "${provenance.licenseStatus}" cannot be published.`,
    });
  }

  if (isPublished && requiresAttribution(provenance) && !provenance.attribution) {
    ctx.addIssue({
      code: 'custom',
      path: [...recordPath, 'provenance', 'attribution'],
      message: `Published content with ${formatAttributionReason(
        provenance,
      )} requires an attribution naming the credited source.`,
    });
  }

  if (!isLicenseStatusAllowedForKind(provenance.kind, provenance.licenseStatus)) {
    ctx.addIssue({
      code: 'custom',
      path: licenseStatusPath,
      message: formatKindStatusMessage(provenance.kind, provenance.licenseStatus),
    });
  }
}

const categoryIdSchema = z.enum(CATEGORY_IDS, {
  error: 'Unknown category id; use one of the seven RFEF age brackets.',
});

const provenanceSchema = z.strictObject(
  {
    kind: z.enum(CONTENT_PROVENANCE_KINDS),
    sourceName: textSchema(120),
    licenseStatus: z.enum(CONTENT_LICENSE_STATUSES),
    attribution: textSchema(200).optional(),
  },
  { error: MISSING_PROVENANCE_MESSAGE },
);

const playersSchema = z.strictObject({
  total: z.number().int().min(2).max(30),
  goalkeepers: z.number().int().min(0).max(4),
});

const spaceSchema = z.strictObject({
  label: textSchema(60),
  widthM: z.number().int().min(4).max(60),
  lengthM: z.number().int().min(4).max(60),
});

const intensitySchema = z.strictObject({
  level: z.enum(['low', 'medium', 'high']),
  percent: z.number().int().min(0).max(100).optional(),
});

const constraintSchema = z.strictObject({
  rule: textSchema(60),
  detail: textSchema(240),
});

const exerciseSchema = z.strictObject({
  id: slugSchema,
  title: textSchema(90),
  summary: textSchema(240),
  focus: textSchema(60),
  sessionPart: z.enum(SESSION_PARTS, {
    error: 'Exercise sessionPart must be "warm-up", "main", or "cool-down".',
  }),
  categoryIds: z.array(categoryIdSchema).min(1).max(EXERCISE_LIMITS.maxCategoryIds),
  objective: textSchema(300),
  players: playersSchema,
  space: spaceSchema,
  durationMinutes: z
    .number()
    .int()
    .min(EXERCISE_LIMITS.minDurationMinutes)
    .max(EXERCISE_LIMITS.maxDurationMinutes),
  intensity: intensitySchema,
  workStructure: textSchema(120),
  constraints: z.array(constraintSchema).max(EXERCISE_LIMITS.maxConstraints),
  coachingCues: z
    .array(textSchema(200))
    .min(1)
    .max(EXERCISE_LIMITS.maxCoachingCues),
  boardData: z.unknown(),
  status: z.enum(EXERCISE_STATUSES),
  provenance: provenanceSchema,
});

const sessionStructureSchema = z.strictObject({
  part: z.enum(SESSION_PARTS),
  title: textSchema(90),
  description: textSchema(300),
});

const microcycleSchema = z.strictObject({
  id: slugSchema,
  label: textSchema(90),
  focus: textSchema(200),
  sessionCount: z.number().int().min(1).max(20),
});

const macrocycleSchema = z.strictObject({
  id: slugSchema,
  label: textSchema(90),
  focus: textSchema(200),
  microcycles: z.array(microcycleSchema).min(1).max(PROGRAMMING_LIMITS.maxMicrocycles),
});

const sessionDurationSchema = z
  .strictObject({
    min: z
      .number()
      .int()
      .min(PROGRAMMING_LIMITS.minSessionMinutes)
      .max(PROGRAMMING_LIMITS.maxSessionMinutes),
    max: z
      .number()
      .int()
      .min(PROGRAMMING_LIMITS.minSessionMinutes)
      .max(PROGRAMMING_LIMITS.maxSessionMinutes),
  })
  .refine((duration) => duration.max >= duration.min, {
    message: 'sessionDurationMinutes.max must be greater than or equal to min.',
    path: ['max'],
  });

const programmingSchema = z.strictObject({
  id: slugSchema,
  categoryId: categoryIdSchema,
  version: z
    .string()
    .trim()
    .regex(SEMVER_PATTERN, 'Use a version such as "1.0.0".'),
  formativeStage: textSchema(90),
  focus: textSchema(160),
  playModel: textSchema(240),
  sessionDurationMinutes: sessionDurationSchema,
  keyConcepts: z
    .array(textSchema(160))
    .min(1)
    .max(PROGRAMMING_LIMITS.maxKeyConcepts),
  objectives: z.array(textSchema(200)).min(1).max(PROGRAMMING_LIMITS.maxObjectives),
  sessionStructure: z
    .array(sessionStructureSchema)
    .min(1)
    .max(PROGRAMMING_LIMITS.maxSessionStructureEntries),
  macrocycles: z.array(macrocycleSchema).min(1).max(PROGRAMMING_LIMITS.maxMacrocycles),
  status: z.enum(PROGRAMMING_STATUSES),
  provenance: provenanceSchema,
});

const contentPackageSchema = z
  .strictObject({
    contentVersion: z.literal(CONTENT_PACKAGE_VERSION, {
      error: `Content package contentVersion must be "${CONTENT_PACKAGE_VERSION}".`,
    }),
    exercises: z.array(exerciseSchema).min(1),
    programming: z.array(programmingSchema),
  })
  .superRefine((contentPackage, ctx) => {
    const exerciseIds = new Set<string>();

    contentPackage.exercises.forEach((exercise, exerciseIndex) => {
      if (exerciseIds.has(exercise.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['exercises', exerciseIndex, 'id'],
          message: `Duplicate exercise id "${exercise.id}".`,
        });
      }
      exerciseIds.add(exercise.id);

      const categoryIds = new Set<CategoryId>();
      exercise.categoryIds.forEach((categoryId, categoryIndex) => {
        if (categoryIds.has(categoryId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['exercises', exerciseIndex, 'categoryIds', categoryIndex],
            message: `Duplicate category id "${categoryId}".`,
          });
        }
        categoryIds.add(categoryId);
      });

      if (exercise.players.total < exercise.players.goalkeepers) {
        ctx.addIssue({
          code: 'custom',
          path: ['exercises', exerciseIndex, 'players', 'total'],
          message: 'players.total must be greater than or equal to players.goalkeepers.',
        });
      }

      addProvenanceIssues(
        ctx,
        ['exercises', exerciseIndex],
        exercise.status,
        exercise.provenance,
      );
    });

    const programmingIds = new Set<string>();
    const publishedProgrammingByCategory = new Map<CategoryId, number>();

    contentPackage.programming.forEach((programming, programmingIndex) => {
      if (programmingIds.has(programming.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['programming', programmingIndex, 'id'],
          message: `Duplicate programming id "${programming.id}".`,
        });
      }
      programmingIds.add(programming.id);

      addProvenanceIssues(
        ctx,
        ['programming', programmingIndex],
        programming.status,
        programming.provenance,
      );

      if (programming.status !== 'published') {
        return;
      }

      if (publishedProgrammingByCategory.has(programming.categoryId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['programming', programmingIndex, 'categoryId'],
          message: `Multiple published programming records for category "${programming.categoryId}".`,
        });
        return;
      }

      publishedProgrammingByCategory.set(programming.categoryId, programmingIndex);
    });
  });

function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return CONTENT_PACKAGE_ROOT_ISSUE_PATH;
  }

  return path.map((segment) => String(segment)).join('.');
}

function toValidationIssues(error: z.ZodError): ContentValidationIssue[] {
  return error.issues.map((issue) => ({
    path: formatIssuePath(issue.path),
    message: issue.message,
  }));
}

function prefixBoardDataPath(exerciseIndex: number, boardDataPath: string): string {
  const prefix = `exercises.${exerciseIndex}.boardData`;

  return boardDataPath === BOARD_DATA_ROOT_ISSUE_PATH
    ? prefix
    : `${prefix}.${boardDataPath}`;
}

export function safeParseContentPackage(input: unknown): ContentPackageParseResult {
  const result = contentPackageSchema.safeParse(input);

  if (!result.success) {
    return { success: false, issues: toValidationIssues(result.error) };
  }

  const issues: ContentValidationIssue[] = [];
  const exercises: Exercise[] = [];

  result.data.exercises.forEach((exercise, exerciseIndex) => {
    const boardResult = safeParseBoardData(exercise.boardData);

    if (!boardResult.success) {
      boardResult.issues.forEach((issue) => {
        issues.push({
          path: prefixBoardDataPath(exerciseIndex, issue.path),
          message: issue.message,
        });
      });
      return;
    }

    exercises.push({ ...exercise, boardData: boardResult.data });
  });

  if (issues.length > 0) {
    return { success: false, issues };
  }

  const programming: Programming[] = result.data.programming.map((record) => ({ ...record }));

  return {
    success: true,
    data: {
      contentVersion: result.data.contentVersion,
      exercises,
      programming,
    },
  };
}

export function parseContentPackage(input: unknown): ContentPackage {
  const result = safeParseContentPackage(input);

  if (!result.success) {
    throw new ContentValidationError(result.issues);
  }

  return result.data;
}
