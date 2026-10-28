import { useLocalSearchParams } from 'expo-router';
import {
  ExerciseDetailScreen,
  createBundledContentRepository,
  getExercise,
} from '@/modules/content';

const repository = createBundledContentRepository();

export default function ExerciseDetailRoute() {
  const params = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const exercise = exerciseId ? getExercise(repository, exerciseId) : null;

  return <ExerciseDetailScreen exercise={exercise} />;
}
