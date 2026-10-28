import { getCategoryById } from '../../domain/category';
import type {
  Exercise,
  ExerciseConstraint,
  ExerciseIntensityLevel,
  ExercisePlayers,
  ExerciseReference,
  ExerciseSpace,
} from '../../domain/exercise';
import { formatCategoryLabel, formatSessionPartLabel } from './category-browse-model';

export type ExerciseDetailPhase = {
  order: number;
  title: string;
  explanation: string;
};

export type ExerciseDetailRow = {
  label: string;
  value: string;
};

export type ExerciseDetailModel = {
  title: string;
  summary: string;
  objective: string;
  categoryLabels: string[];
  sessionPartLabel: string;
  facts: ExerciseDetailRow[];
  constraints: ExerciseConstraint[];
  coachingCues: string[];
  phases: ExerciseDetailPhase[];
  phaseCountLabel: string;
  references: ExerciseReference[];
  attribution: string | null;
};

const INTENSITY_LABELS: Record<ExerciseIntensityLevel, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

function formatCategoryLabels(exercise: Exercise): string[] {
  return exercise.categoryIds.flatMap((categoryId) => {
    const category = getCategoryById(categoryId);

    return category ? [formatCategoryLabel(category)] : [];
  });
}

function formatCount(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function formatPlayersFact(players: ExercisePlayers): string {
  const total = formatCount(players.total, 'jugador', 'jugadores');

  if (players.goalkeepers > 0) {
    return `${total} \u00b7 ${formatCount(players.goalkeepers, 'portero', 'porteros')}`;
  }

  return total;
}

function formatSpaceFact(space: ExerciseSpace): string {
  return `${space.label} \u00b7 ${space.widthM} \u00d7 ${space.lengthM} m`;
}

function formatIntensityFact(
  level: ExerciseIntensityLevel,
  percent: number | undefined,
): string {
  const label = INTENSITY_LABELS[level];

  return typeof percent === 'number' ? `${label} \u00b7 ${percent}%` : label;
}

function formatPhaseCountLabel(count: number): string {
  return count === 1 ? '1 fase táctica' : `${count} fases tácticas`;
}

export function buildExerciseDetailModel(exercise: Exercise): ExerciseDetailModel {
  const categoryLabels = formatCategoryLabels(exercise);
  const phases = [...exercise.boardData.phases]
    .sort((left, right) => left.order - right.order)
    .map((phase) => ({
      order: phase.order,
      title: phase.title,
      explanation: phase.explanation,
    }));

  return {
    title: exercise.title,
    summary: exercise.summary,
    objective: exercise.objective,
    categoryLabels,
    sessionPartLabel: formatSessionPartLabel(exercise.sessionPart),
    facts: [
      {
        label: 'Categoría',
        value: categoryLabels.length > 0 ? categoryLabels.join(' \u00b7 ') : 'Sin categoría',
      },
      { label: 'Tramo', value: formatSessionPartLabel(exercise.sessionPart) },
      { label: 'Duración', value: `${exercise.durationMinutes} min` },
      { label: 'Jugadores', value: formatPlayersFact(exercise.players) },
      { label: 'Espacio', value: formatSpaceFact(exercise.space) },
      {
        label: 'Intensidad',
        value: formatIntensityFact(exercise.intensity.level, exercise.intensity.percent),
      },
      { label: 'Estructura', value: exercise.workStructure },
    ],
    constraints: exercise.constraints.map((constraint) => ({
      rule: constraint.rule,
      detail: constraint.detail,
    })),
    coachingCues: [...exercise.coachingCues],
    phases,
    phaseCountLabel: formatPhaseCountLabel(phases.length),
    references: [...(exercise.references ?? [])],
    attribution: exercise.provenance.attribution ?? null,
  };
}
