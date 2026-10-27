export const SESSION_PARTS = ['warm-up', 'main', 'cool-down'] as const;

export type SessionPart = (typeof SESSION_PARTS)[number];
