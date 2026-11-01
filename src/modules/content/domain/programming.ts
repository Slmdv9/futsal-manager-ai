import type { CategoryId } from './category';
import { isPublishableProvenance, type ContentProvenance } from './provenance';
import type { SessionPart } from './session-part';

export type { SessionPart } from './session-part';

export const PROGRAMMING_STATUSES = ['draft', 'published'] as const;

export type ProgrammingStatus = (typeof PROGRAMMING_STATUSES)[number];

export type SessionStructureEntry = {
  part: SessionPart;
  title: string;
  description: string;
};

export type Microcycle = {
  id: string;
  label: string;
  focus: string;
  sessionCount: number;
};

export type Macrocycle = {
  id: string;
  label: string;
  focus: string;
  microcycles: Microcycle[];
};

export type Programming = {
  id: string;
  categoryId: CategoryId;
  version: string;
  formativeStage: string;
  focus: string;
  playModel: string;
  sessionDurationMinutes: { min: number; max: number };
  keyConcepts: string[];
  objectives: string[];
  sessionStructure: SessionStructureEntry[];
  macrocycles: Macrocycle[];
  status: ProgrammingStatus;
  provenance: ContentProvenance;
};

export const PROGRAMMING_LIMITS = {
  minSessionMinutes: 20,
  maxSessionMinutes: 180,
  maxKeyConcepts: 8,
  maxObjectives: 8,
  maxSessionStructureEntries: 5,
  maxMacrocycles: 6,
  maxMicrocycles: 8,
} as const;

export function isPublishedProgramming(programming: Programming): boolean {
  return programming.status === 'published';
}

export function isPublishableProgramming(programming: Programming): boolean {
  return (
    isPublishedProgramming(programming) && isPublishableProvenance(programming.provenance)
  );
}
