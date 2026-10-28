export type ExerciseDetailHref = {
  pathname: '/ejercicios/[exerciseId]';
  params: { exerciseId: string };
};

export function buildExerciseDetailHref(exerciseId: string): ExerciseDetailHref {
  return { pathname: '/ejercicios/[exerciseId]', params: { exerciseId } };
}
