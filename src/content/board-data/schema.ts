import { z } from 'zod';

export const BOARD_DATA_SCHEMA_VERSION = '1.0.0' as const;

export const BOARD_DATA_LIMITS = {
  maxTokens: 24,
  maxPhases: 12,
  maxCones: 30,
  maxArrowsPerPhase: 30,
  maxLabelsPerPhase: 12,
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_LABEL_PATTERN = /^\S{1,3}$/;

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(SLUG_PATTERN, 'Use a lowercase slug such as "home-cierre".');

const pointSchema = z.strictObject({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const tokenDefinitionSchema = z.strictObject({
  id: slugSchema,
  kind: z.enum(['player', 'keeper'], {
    error: 'Token kind must be "player" or "keeper".',
  }),
  team: z.enum(['home', 'away', 'neutral']),
  label: z
    .string()
    .trim()
    .regex(TOKEN_LABEL_PATTERN, 'Token labels are 1-3 characters without spaces.'),
});

const coneSchema = z.strictObject({
  id: slugSchema,
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const tokenPositionSchema = z.strictObject({
  tokenId: slugSchema,
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const arrowSchema = z
  .strictObject({
    id: slugSchema,
    kind: z.enum(['run', 'pass', 'press', 'cover']),
    team: z.enum(['home', 'away', 'neutral']),
    from: pointSchema,
    to: pointSchema,
    curve: z.number().min(-100).max(100).default(0),
  })
  .refine(
    (arrow) => Math.hypot(arrow.to.x - arrow.from.x, arrow.to.y - arrow.from.y) > 0.1,
    { message: 'Arrow start and end must differ.', path: ['to'] },
  );

const boardLabelSchema = z.strictObject({
  id: slugSchema,
  text: z.string().trim().min(1).max(80),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  align: z.enum(['left', 'center', 'right']).default('center'),
});

const phaseSchema = z.strictObject({
  id: slugSchema,
  order: z.number().int().min(1).max(BOARD_DATA_LIMITS.maxPhases),
  title: z.string().trim().min(1).max(60),
  explanation: z.string().trim().min(1).max(500),
  positions: z.array(tokenPositionSchema).min(1).max(BOARD_DATA_LIMITS.maxTokens),
  ball: pointSchema.nullable(),
  arrows: z.array(arrowSchema).max(BOARD_DATA_LIMITS.maxArrowsPerPhase).default([]),
  labels: z.array(boardLabelSchema).max(BOARD_DATA_LIMITS.maxLabelsPerPhase).default([]),
});

const boardDataShape = z.strictObject({
  schemaVersion: z.literal(BOARD_DATA_SCHEMA_VERSION, {
    error: `Board Data schemaVersion must be "${BOARD_DATA_SCHEMA_VERSION}".`,
  }),
  pitch: z.strictObject({
    format: z.enum(['full', 'half']),
  }),
  tokens: z.array(tokenDefinitionSchema).min(1).max(BOARD_DATA_LIMITS.maxTokens),
  cones: z.array(coneSchema).max(BOARD_DATA_LIMITS.maxCones).default([]),
  phases: z.array(phaseSchema).min(1).max(BOARD_DATA_LIMITS.maxPhases),
});

function addIssue(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
): void {
  ctx.addIssue({ code: 'custom', path, message });
}

function findDuplicateIds<T extends { id: string }>(items: T[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      duplicates.push(index);
    }
    seen.add(item.id);
  });

  return duplicates;
}

export const boardDataSchema = boardDataShape.superRefine((data, ctx) => {
  const tokenIds = new Set(data.tokens.map((token) => token.id));

  data.tokens.forEach((token, index) => {
    if (data.tokens.findIndex((candidate) => candidate.id === token.id) !== index) {
      addIssue(ctx, ['tokens', index, 'id'], `Duplicate token id "${token.id}".`);
    }
  });

  findDuplicateIds(data.cones).forEach((index) => {
    addIssue(ctx, ['cones', index, 'id'], `Duplicate cone id "${data.cones[index].id}".`);
  });

  const phaseIds = new Set<string>();

  data.phases.forEach((phase, phaseIndex) => {
    if (phase.order !== phaseIndex + 1) {
      addIssue(
        ctx,
        ['phases', phaseIndex, 'order'],
        `Phase order must be ${phaseIndex + 1} at array index ${phaseIndex}.`,
      );
    }

    if (phaseIds.has(phase.id)) {
      addIssue(ctx, ['phases', phaseIndex, 'id'], `Duplicate phase id "${phase.id}".`);
    }
    phaseIds.add(phase.id);

    const positionedTokenIds = new Set<string>();

    phase.positions.forEach((position, positionIndex) => {
      if (!tokenIds.has(position.tokenId)) {
        addIssue(
          ctx,
          ['phases', phaseIndex, 'positions', positionIndex, 'tokenId'],
          `Unknown token id "${position.tokenId}".`,
        );
      }

      if (positionedTokenIds.has(position.tokenId)) {
        addIssue(
          ctx,
          ['phases', phaseIndex, 'positions', positionIndex, 'tokenId'],
          `Duplicate position for token "${position.tokenId}".`,
        );
      }
      positionedTokenIds.add(position.tokenId);
    });

    tokenIds.forEach((tokenId) => {
      if (!positionedTokenIds.has(tokenId)) {
        addIssue(
          ctx,
          ['phases', phaseIndex, 'positions'],
          `Missing position for token "${tokenId}" in phase ${phaseIndex + 1}.`,
        );
      }
    });

    findDuplicateIds(phase.arrows).forEach((index) => {
      addIssue(
        ctx,
        ['phases', phaseIndex, 'arrows', index, 'id'],
        `Duplicate arrow id "${phase.arrows[index].id}".`,
      );
    });

    findDuplicateIds(phase.labels).forEach((index) => {
      addIssue(
        ctx,
        ['phases', phaseIndex, 'labels', index, 'id'],
        `Duplicate label id "${phase.labels[index].id}".`,
      );
    });
  });
});

export type BoardData = z.infer<typeof boardDataSchema>;
export type BoardPhase = z.infer<typeof phaseSchema>;
export type BoardToken = z.infer<typeof tokenDefinitionSchema>;
export type BoardCone = z.infer<typeof coneSchema>;
export type BoardArrow = z.infer<typeof arrowSchema>;
export type BoardLabel = z.infer<typeof boardLabelSchema>;
export type BoardPoint = z.infer<typeof pointSchema>;
