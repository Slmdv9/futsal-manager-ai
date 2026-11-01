import { useLocalSearchParams } from 'expo-router';
import { BoardScreen } from '@/modules/board';
import {
  buildBoardExerciseTarget,
  createBundledContentRepository,
  getExercise,
} from '@/modules/content';

const repository = createBundledContentRepository();

export default function PizarraRoute() {
  const params = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const exercise = exerciseId ? getExercise(repository, exerciseId) : null;

  return <BoardScreen exercise={exercise ? buildBoardExerciseTarget(exercise) : null} />;
}
