import type { BoardData } from '@/shared/domain';
import type { Exercise } from '../../domain/exercise';

export type BoardHref = { pathname: '/pizarra'; params: { exerciseId: string } };

export type BoardExerciseTargetData = {
  id: string;
  title: string;
  summary: string;
  boardData: BoardData;
};

export function buildBoardHref(exerciseId: string): BoardHref {
  return { pathname: '/pizarra', params: { exerciseId } };
}

export function buildBoardExerciseTarget(exercise: Exercise): BoardExerciseTargetData {
  return {
    id: exercise.id,
    title: exercise.title,
    summary: exercise.summary,
    boardData: exercise.boardData,
  };
}
