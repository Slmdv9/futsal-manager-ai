import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const boardRootPath = fileURLToPath(
  new URL('../../../../../src/modules/board/', import.meta.url),
);
const presentationRoot = fileURLToPath(
  new URL('../../../../../src/modules/board/presentation/', import.meta.url),
);

function readPresentationFile(relativePath: string): string {
  return readFileSync(join(presentationRoot, relativePath), 'utf8');
}

const tacticsBoardSource = readPresentationFile('components/tactics-board.tsx');

function findSvgImporters(): string[] {
  return readdirSync(boardRootPath, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .filter((entry) =>
      readFileSync(join(entry.parentPath, entry.name), 'utf8').includes('react-native-svg'),
    )
    .map((entry) => relative(boardRootPath, join(entry.parentPath, entry.name)))
    .sort();
}

describe('Tactics board component', () => {
  describe('Given the component props', () => {
    describe('When the component signature is inspected', () => {
      it('then it takes Board Data plus an optional phase index and builds the model', () => {
        assert.match(
          tacticsBoardSource,
          /export type TacticsBoardProps = \{\s*boardData: BoardData;\s*phaseIndex\?: number;\s*\};/,
        );
        assert.match(
          tacticsBoardSource,
          /export function TacticsBoard\(\{ boardData, phaseIndex = 0 \}: TacticsBoardProps\)/,
        );
        assert.match(
          tacticsBoardSource,
          /const model = buildBoardRenderModel\(boardData, phaseIndex\);/,
        );
        assert.match(
          tacticsBoardSource,
          /import type \{ BoardData \} from '@\/shared\/domain';/,
        );
      });
    });

    describe('When the board module imports are scanned', () => {
      it('then only tactics-board.tsx imports react-native-svg, with the primitives it draws', () => {
        assert.deepEqual(findSvgImporters(), ['presentation/components/tactics-board.tsx']);

        const importMatch = tacticsBoardSource.match(
          /import Svg, \{([^}]+)\} from 'react-native-svg';/,
        );

        assert.ok(importMatch, 'Expected a named react-native-svg import.');

        const primitives = importMatch[1]
          .split(',')
          .map((name) => name.trim().replace('Text as SvgText', 'Text'))
          .sort();

        assert.deepEqual(primitives, ['Circle', 'G', 'Line', 'Path', 'Rect', 'Text'].sort());
        assert.match(
          tacticsBoardSource,
          /import \{ colors, fontFamilies, type ColorToken \} from '@\/shared\/theme';/,
        );
      });
    });
  });

  describe('Given the board wrapper', () => {
    describe('When the SVG surface is inspected', () => {
      it('then it fills a 2:1 wrapper with a proportional viewBox and no fixed height', () => {
        assert.match(
          tacticsBoardSource,
          /<Svg\s+width="100%"\s+height="100%"\s+viewBox=\{model\.viewBox\}\s+preserveAspectRatio="xMidYMid meet"\s*>/,
        );
        assert.match(
          tacticsBoardSource,
          /wrapper: \{\s*width: '100%',\s*aspectRatio: 2,\s*\},/,
        );
        assert.doesNotMatch(tacticsBoardSource, /height=\{\d+\}/);
        assert.doesNotMatch(tacticsBoardSource, /height: \d/);
        assert.doesNotMatch(tacticsBoardSource, /useWindowDimensions|Dimensions/);
      });

      it('then exactly one node is an accessible image with the model label', () => {
        assert.equal(
          (tacticsBoardSource.match(/\baccessible\b/g) ?? []).length,
          1,
        );
        assert.match(tacticsBoardSource, /accessible\s+accessibilityRole="image"/);
        assert.match(
          tacticsBoardSource,
          /accessibilityLabel=\{model\.accessibilityLabel\}/,
        );
        assert.equal(
          (tacticsBoardSource.match(/accessibilityLabel=/g) ?? []).length,
          1,
        );
      });
    });
  });

  describe('Given the pitch markings', () => {
    describe('When they are inspected', () => {
      it('then the boundary, halfway line, centre marks, 6 m arcs, goals and corners are token-coloured', () => {
        assert.match(
          tacticsBoardSource,
          /<Rect\s+x=\{model\.field\.x\}\s+y=\{model\.field\.y\}\s+width=\{model\.field\.width\}\s+height=\{model\.field\.height\}/,
        );
        assert.match(tacticsBoardSource, /fill=\{colors\.surfaceContainerLow\}/);
        assert.match(tacticsBoardSource, /fill=\{colors\.surfaceContainerHigh\}/);
        assert.match(tacticsBoardSource, /fillOpacity=\{INACTIVE_HALF_OPACITY\}/);
        assert.match(
          tacticsBoardSource,
          /<Line\s+x1=\{halfwayX\}\s+y1=\{topY\}\s+x2=\{halfwayX\}\s+y2=\{bottomY\}/,
        );
        assert.match(tacticsBoardSource, /r=\{CENTRE_CIRCLE_RADIUS\}/);
        assert.match(tacticsBoardSource, /r=\{CENTRE_SPOT_RADIUS\} fill=\{colors\.outline\}/);
        assert.equal(
          (tacticsBoardSource.match(/A \$\{PENALTY_ARC_RADIUS\}/g) ?? []).length,
          2,
        );
        assert.equal((tacticsBoardSource.match(/sixMetreMarkY/g) ?? []).length, 5);
        assert.equal((tacticsBoardSource.match(/width=\{GOAL_DEPTH\}/g) ?? []).length, 2);
        assert.equal(
          (tacticsBoardSource.match(/A \$\{CORNER_ARC_RADIUS\}/g) ?? []).length,
          4,
        );
        assert.equal(tacticsBoardSource.includes('#'), false);
      });
    });
  });

  describe('Given the rendered tokens', () => {
    describe('When the token layers are inspected', () => {
      it('then body, ring, keeper ring and mono label use the team tokens and ring shapes', () => {
        assert.match(
          tacticsBoardSource,
          /const TEAM_TOKEN_STYLES: Record<BoardRenderToken\['team'\], TeamTokenStyle>/,
        );
        assert.match(
          tacticsBoardSource,
          /home: \{\s*bodyFill: 'text',\s*bodyStroke: null,\s*ringStroke: 'text',\s*labelColor: 'onPrimary',\s*dashedRing: false,/,
        );
        assert.match(
          tacticsBoardSource,
          /away: \{\s*bodyFill: 'secondary',\s*bodyStroke: null,\s*ringStroke: 'secondary',\s*labelColor: 'onSecondary',\s*dashedRing: true,/,
        );
        assert.match(
          tacticsBoardSource,
          /neutral: \{\s*bodyFill: 'surface',\s*bodyStroke: 'text',\s*ringStroke: 'text',\s*labelColor: 'text',\s*dashedRing: false,/,
        );
        assert.match(tacticsBoardSource, /const AWAY_RING_DASH = \[10, 6\];/);
        assert.match(
          tacticsBoardSource,
          /r=\{TOKEN_BODY_RADIUS\}\s+fill=\{colors\[teamStyle\.bodyFill\]\}/,
        );
        assert.match(
          tacticsBoardSource,
          /r=\{TOKEN_RING_RADIUS\}\s+fill="none"\s+stroke=\{ringColor\}\s+strokeWidth=\{RING_STROKE_WIDTH\}\s+strokeDasharray=\{teamStyle\.dashedRing \? AWAY_RING_DASH : undefined\}/,
        );
        assert.match(
          tacticsBoardSource,
          /token\.kind === 'keeper' \? \(\s*<Circle\s+cx=\{token\.point\.x\}\s+cy=\{token\.point\.y\}\s+r=\{TOKEN_BODY_RADIUS - 8\}\s+fill="none"\s+stroke=\{colors\[teamStyle\.labelColor\]\}\s+strokeWidth=\{TOKEN_KEEPER_RING_WIDTH\}/,
        );
        assert.doesNotMatch(tacticsBoardSource, /r=\{TOKEN_RING_RADIUS - 8\}/);
        assert.match(
          tacticsBoardSource,
          /fontFamily=\{fontFamilies\.jetBrainsMono\.semibold\}\s+fill=\{colors\[teamStyle\.labelColor\]\}\s+textAnchor="middle"/,
        );
      });
    });
  });

  describe('Given the cones, arrows, ball and labels', () => {
    describe('When each drawn layer is inspected', () => {
      it('then they render from model fields with kind-specific dashes and filled arrowheads', () => {
        assert.match(tacticsBoardSource, /model\.cones\.map\(\(cone\) => \(/);
        assert.match(tacticsBoardSource, /CONE_APEX_OFFSET/);
        assert.match(tacticsBoardSource, /fill=\{colors\.primary\}/);
        assert.match(tacticsBoardSource, /model\.arrows\.map\(\(arrow\) => \(/);
        assert.match(
          tacticsBoardSource,
          /const ARROW_DASHES: Record<BoardRenderArrow\['kind'\], number\[\] \| undefined> = \{\s*run: undefined,\s*pass: \[12, 8\],\s*press: \[2, 8\],\s*cover: \[22, 8\],\s*\};/,
        );
        assert.match(
          tacticsBoardSource,
          /strokeDasharray=\{ARROW_DASHES\[arrow\.kind\]\}/,
        );
        assert.match(tacticsBoardSource, /strokeLinecap=\{arrow\.kind === 'press' \? 'round' : 'butt'\}/);
        assert.match(tacticsBoardSource, /const ARROW_COLORS: Record<BoardRenderArrow\['team'\], ColorToken>/);
        assert.match(tacticsBoardSource, /home: 'primary',\s*away: 'secondary',\s*neutral: 'textVariant',/);
        assert.match(tacticsBoardSource, /<Path d=\{arrowHeadPath\(arrow\)\} fill=\{colors\[ARROW_COLORS\[arrow\.team\]\]\} \/>/);
        assert.match(
          tacticsBoardSource,
          /function arrowHeadPath\(arrow: BoardRenderArrow\): string \{\s*const \[tip, sideA, sideB\] = arrow\.head;/,
        );
        assert.match(tacticsBoardSource, /model\.ball \? \(/);
        assert.match(tacticsBoardSource, /cx=\{model\.ball\.badge\.x\}/);
        assert.match(tacticsBoardSource, /r=\{BALL_DOT_RADIUS\}/);
        assert.match(tacticsBoardSource, /model\.labels\.map\(\(label\) =>/);
        assert.match(tacticsBoardSource, /label\.lines\.map\(\(line, lineIndex\) => \(/);
        assert.match(tacticsBoardSource, /y=\{label\.y \+ lineIndex \* LABEL_LINE_HEIGHT\}/);
        assert.match(tacticsBoardSource, /textAnchor=\{label\.anchor\}/);
      });
    });

    describe('When the component is scanned for forbidden behaviour', () => {
      it('then it stays a passive renderer with no content, player derivation or interaction', () => {
        assert.doesNotMatch(tacticsBoardSource, /@\/modules\/content/);
        assert.doesNotMatch(tacticsBoardSource, /\bplayers\b|\bgoalkeepers\b/);
        assert.doesNotMatch(
          tacticsBoardSource,
          /onPress|Pressable|useState|useEffect|Animar|Animated|Reanimated|gesture|Touchable/,
        );
        assert.doesNotMatch(tacticsBoardSource, /setTimeout|setInterval/);
      });
    });
  });
});
