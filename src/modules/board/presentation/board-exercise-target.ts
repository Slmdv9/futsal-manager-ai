import type { BoardData } from '@/shared/domain';

export type BoardExerciseTarget = {
  id: string;
  title: string;
  summary: string;
  boardData: BoardData;
};
