import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { BoardData } from '@/shared/domain';
import { colors, fontFamilies, type ColorToken } from '@/shared/theme';
import {
  ARROW_STROKE_WIDTH,
  BALL_DOT_RADIUS,
  BALL_RADIUS,
  CONE_APEX_OFFSET,
  CONE_BASE_HALF_WIDTH,
  CONE_BASE_OFFSET,
  INACTIVE_HALF_OPACITY,
  LABEL_FONT_SIZE,
  LABEL_LINE_HEIGHT,
  TOKEN_BODY_RADIUS,
  TOKEN_KEEPER_RING_WIDTH,
  TOKEN_LABEL_BASELINE_OFFSET,
  TOKEN_LABEL_FONT_SIZE,
  TOKEN_RING_RADIUS,
  buildBoardRenderModel,
  type BoardRenderArrow,
  type BoardRenderToken,
} from '../view-models/board-render-model';

export type TacticsBoardProps = {
  boardData: BoardData;
  phaseIndex?: number;
};

const FIELD_CORNER_RADIUS = 12;
const MARKING_STROKE_WIDTH = 2;
const CENTRE_CIRCLE_RADIUS = 80;
const CENTRE_SPOT_RADIUS = 4;
const PENALTY_ARC_RADIUS = 120;
const CORNER_ARC_RADIUS = 22;
const SIX_METRE_MARK_LENGTH = 16;
const GOAL_WIDTH = 100;
const GOAL_DEPTH = 16;
const RING_STROKE_WIDTH = 2;
const TOKEN_BODY_STROKE_WIDTH = 2;
const BALL_STROKE_WIDTH = 3;
const AWAY_RING_DASH = [10, 6];

type TeamTokenStyle = {
  bodyFill: ColorToken;
  bodyStroke: ColorToken | null;
  ringStroke: ColorToken;
  labelColor: ColorToken;
  dashedRing: boolean;
};

const TEAM_TOKEN_STYLES: Record<BoardRenderToken['team'], TeamTokenStyle> = {
  home: {
    bodyFill: 'text',
    bodyStroke: null,
    ringStroke: 'text',
    labelColor: 'onPrimary',
    dashedRing: false,
  },
  away: {
    bodyFill: 'secondary',
    bodyStroke: null,
    ringStroke: 'secondary',
    labelColor: 'onSecondary',
    dashedRing: true,
  },
  neutral: {
    bodyFill: 'surface',
    bodyStroke: 'text',
    ringStroke: 'text',
    labelColor: 'text',
    dashedRing: false,
  },
};

const ARROW_COLORS: Record<BoardRenderArrow['team'], ColorToken> = {
  home: 'primary',
  away: 'secondary',
  neutral: 'textVariant',
};

const ARROW_DASHES: Record<BoardRenderArrow['kind'], number[] | undefined> = {
  run: undefined,
  pass: [12, 8],
  press: [2, 8],
  cover: [22, 8],
};

function arrowHeadPath(arrow: BoardRenderArrow): string {
  const [tip, sideA, sideB] = arrow.head;

  return `M ${tip.x} ${tip.y} L ${sideA.x} ${sideA.y} L ${sideB.x} ${sideB.y} Z`;
}

export function TacticsBoard({ boardData, phaseIndex = 0 }: TacticsBoardProps) {
  const model = buildBoardRenderModel(boardData, phaseIndex);
  const halfwayX = model.field.x + model.field.width / 2;
  const centreY = model.field.y + model.field.height / 2;
  const topY = model.field.y;
  const bottomY = model.field.y + model.field.height;
  const rightX = model.field.x + model.field.width;
  const goalTop = centreY - GOAL_WIDTH / 2;
  const sixMetreMarkY = SIX_METRE_MARK_LENGTH / 2;
  const penaltyArcTop = centreY - PENALTY_ARC_RADIUS;
  const penaltyArcBottom = centreY + PENALTY_ARC_RADIUS;
  const cornerArcX = model.field.x + CORNER_ARC_RADIUS;
  const cornerArcRightX = rightX - CORNER_ARC_RADIUS;
  const cornerArcY = topY + CORNER_ARC_RADIUS;
  const cornerArcBottomY = bottomY - CORNER_ARC_RADIUS;

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="image"
      accessibilityLabel={model.accessibilityLabel}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={model.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <Rect
          x={model.field.x}
          y={model.field.y}
          width={model.field.width}
          height={model.field.height}
          rx={FIELD_CORNER_RADIUS}
          fill={colors.surfaceContainerLow}
          stroke={colors.outline}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        {model.inactiveHalf ? (
          <Rect
            x={model.inactiveHalf.x}
            y={model.inactiveHalf.y}
            width={model.inactiveHalf.width}
            height={model.inactiveHalf.height}
            fill={colors.surfaceContainerHigh}
            fillOpacity={INACTIVE_HALF_OPACITY}
          />
        ) : null}
        <Line
          x1={halfwayX}
          y1={topY}
          x2={halfwayX}
          y2={bottomY}
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Circle
          cx={halfwayX}
          cy={centreY}
          r={CENTRE_CIRCLE_RADIUS}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Circle cx={halfwayX} cy={centreY} r={CENTRE_SPOT_RADIUS} fill={colors.outline} />
        <Path
          d={`M ${model.field.x} ${penaltyArcTop} A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 1 ${model.field.x} ${penaltyArcBottom}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Path
          d={`M ${rightX} ${penaltyArcTop} A ${PENALTY_ARC_RADIUS} ${PENALTY_ARC_RADIUS} 0 0 0 ${rightX} ${penaltyArcBottom}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Line
          x1={model.field.x + PENALTY_ARC_RADIUS}
          y1={centreY - sixMetreMarkY}
          x2={model.field.x + PENALTY_ARC_RADIUS}
          y2={centreY + sixMetreMarkY}
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Line
          x1={rightX - PENALTY_ARC_RADIUS}
          y1={centreY - sixMetreMarkY}
          x2={rightX - PENALTY_ARC_RADIUS}
          y2={centreY + sixMetreMarkY}
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Rect
          x={model.field.x - GOAL_DEPTH}
          y={goalTop}
          width={GOAL_DEPTH}
          height={GOAL_WIDTH}
          fill="none"
          stroke={colors.outline}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Rect
          x={rightX}
          y={goalTop}
          width={GOAL_DEPTH}
          height={GOAL_WIDTH}
          fill="none"
          stroke={colors.outline}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Path
          d={`M ${cornerArcX} ${topY} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${model.field.x} ${cornerArcY}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Path
          d={`M ${cornerArcRightX} ${topY} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 ${rightX} ${cornerArcY}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Path
          d={`M ${model.field.x} ${cornerArcBottomY} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${cornerArcX} ${bottomY}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        <Path
          d={`M ${rightX} ${cornerArcBottomY} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 0 ${cornerArcRightX} ${bottomY}`}
          fill="none"
          stroke={colors.outlineVariant}
          strokeWidth={MARKING_STROKE_WIDTH}
        />
        {model.cones.map((cone) => (
          <Path
            key={cone.id}
            d={`M ${cone.point.x} ${cone.point.y - CONE_APEX_OFFSET} L ${
              cone.point.x - CONE_BASE_HALF_WIDTH
            } ${cone.point.y + CONE_BASE_OFFSET} L ${
              cone.point.x + CONE_BASE_HALF_WIDTH
            } ${cone.point.y + CONE_BASE_OFFSET} Z`}
            fill={colors.primary}
          />
        ))}
        {model.arrows.map((arrow) => (
          <G key={arrow.id}>
            <Path
              d={arrow.path}
              fill="none"
              stroke={colors[ARROW_COLORS[arrow.team]]}
              strokeWidth={ARROW_STROKE_WIDTH}
              strokeDasharray={ARROW_DASHES[arrow.kind]}
              strokeLinecap={arrow.kind === 'press' ? 'round' : 'butt'}
            />
            <Path d={arrowHeadPath(arrow)} fill={colors[ARROW_COLORS[arrow.team]]} />
          </G>
        ))}
        {model.tokens.map((token) => {
          const teamStyle = TEAM_TOKEN_STYLES[token.team];
          const ringColor = colors[teamStyle.ringStroke];

          return (
            <G key={token.id}>
              <Circle
                cx={token.point.x}
                cy={token.point.y}
                r={TOKEN_BODY_RADIUS}
                fill={colors[teamStyle.bodyFill]}
                stroke={teamStyle.bodyStroke ? colors[teamStyle.bodyStroke] : undefined}
                strokeWidth={teamStyle.bodyStroke ? TOKEN_BODY_STROKE_WIDTH : undefined}
              />
              <Circle
                cx={token.point.x}
                cy={token.point.y}
                r={TOKEN_RING_RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={RING_STROKE_WIDTH}
                strokeDasharray={teamStyle.dashedRing ? AWAY_RING_DASH : undefined}
              />
              {token.kind === 'keeper' ? (
                <Circle
                  cx={token.point.x}
                  cy={token.point.y}
                  r={TOKEN_BODY_RADIUS - 8}
                  fill="none"
                  stroke={colors[teamStyle.labelColor]}
                  strokeWidth={TOKEN_KEEPER_RING_WIDTH}
                />
              ) : null}
              <SvgText
                x={token.point.x}
                y={token.point.y + TOKEN_LABEL_BASELINE_OFFSET}
                fontSize={TOKEN_LABEL_FONT_SIZE}
                fontFamily={fontFamilies.jetBrainsMono.semibold}
                fill={colors[teamStyle.labelColor]}
                textAnchor="middle"
              >
                {token.label}
              </SvgText>
            </G>
          );
        })}
        {model.ball ? (
          <G>
            <Circle
              cx={model.ball.badge.x}
              cy={model.ball.badge.y}
              r={BALL_RADIUS}
              fill={colors.surface}
              stroke={colors.text}
              strokeWidth={BALL_STROKE_WIDTH}
            />
            <Circle
              cx={model.ball.badge.x}
              cy={model.ball.badge.y}
              r={BALL_DOT_RADIUS}
              fill={colors.text}
            />
          </G>
        ) : null}
        {model.labels.map((label) =>
          label.lines.map((line, lineIndex) => (
            <SvgText
              key={`${label.id}-${lineIndex}`}
              x={label.x}
              y={label.y + lineIndex * LABEL_LINE_HEIGHT}
              fontSize={LABEL_FONT_SIZE}
              fontFamily={fontFamilies.jetBrainsMono.semibold}
              fill={colors.text}
              textAnchor={label.anchor}
            >
              {line}
            </SvgText>
          )),
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 2,
  },
});
