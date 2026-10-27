import type { ZodError } from 'zod';
import {
  BOARD_DATA_LIMITS,
  BOARD_DATA_SCHEMA_VERSION,
  boardDataSchema,
  type BoardArrow,
  type BoardCone,
  type BoardData,
  type BoardLabel,
  type BoardPhase,
  type BoardPoint,
  type BoardToken,
} from './schema';

export {
  BOARD_DATA_LIMITS,
  BOARD_DATA_SCHEMA_VERSION,
  type BoardArrow,
  type BoardCone,
  type BoardData,
  type BoardLabel,
  type BoardPhase,
  type BoardPoint,
  type BoardToken,
};

export const BOARD_DATA_ROOT_ISSUE_PATH = '(root)';

export type BoardDataValidationIssue = {
  path: string;
  message: string;
};

export type BoardDataParseResult =
  | { success: true; data: BoardData }
  | { success: false; issues: BoardDataValidationIssue[] };

export class BoardDataValidationError extends Error {
  readonly issues: BoardDataValidationIssue[];

  constructor(issues: BoardDataValidationIssue[]) {
    const details = issues
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join('; ');
    super(`Invalid Board Data — ${details}`);
    this.name = 'BoardDataValidationError';
    this.issues = issues;
  }
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return BOARD_DATA_ROOT_ISSUE_PATH;
  }

  return path.map((segment) => String(segment)).join('.');
}

function toValidationIssues(error: ZodError): BoardDataValidationIssue[] {
  return error.issues.map((issue) => ({
    path: formatIssuePath(issue.path),
    message: issue.message,
  }));
}

export function safeParseBoardData(input: unknown): BoardDataParseResult {
  const result = boardDataSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, issues: toValidationIssues(result.error) };
}

export function parseBoardData(input: unknown): BoardData {
  const result = safeParseBoardData(input);

  if (!result.success) {
    throw new BoardDataValidationError(result.issues);
  }

  return result.data;
}
