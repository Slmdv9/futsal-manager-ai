import { fontFamilies } from './fonts';

export const typography = {
  displayLg: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  displayLgMobile: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
  },
  headlineLg: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.48,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies.spaceGrotesk.bold,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.39,
  },
  headlineMd: {
    fontFamily: fontFamilies.spaceGrotesk.semibold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineSm: {
    fontFamily: fontFamilies.spaceGrotesk.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  bodyLg: {
    fontFamily: fontFamilies.hankenGrotesk.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  bodyLgMedium: {
    fontFamily: fontFamilies.hankenGrotesk.medium,
    fontSize: 16,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: fontFamilies.hankenGrotesk.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  bodyMdMedium: {
    fontFamily: fontFamilies.hankenGrotesk.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamilies.hankenGrotesk.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  labelLg: {
    fontFamily: fontFamilies.jetBrainsMono.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.26,
  },
  labelMd: {
    fontFamily: fontFamilies.jetBrainsMono.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.44,
  },
  labelSm: {
    fontFamily: fontFamilies.jetBrainsMono.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
