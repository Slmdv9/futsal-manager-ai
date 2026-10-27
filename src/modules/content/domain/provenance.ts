export const CONTENT_PROVENANCE_KINDS = ['original', 'cmd-mora', 'reference'] as const;

export type ContentProvenanceKind = (typeof CONTENT_PROVENANCE_KINDS)[number];

export const CONTENT_LICENSE_STATUSES = [
  'owned',
  'permitted',
  'reference-only',
  'pending',
  'unlicensed',
] as const;

export type ContentLicenseStatus = (typeof CONTENT_LICENSE_STATUSES)[number];

export type ContentProvenance = {
  kind: ContentProvenanceKind;
  sourceName: string;
  licenseStatus: ContentLicenseStatus;
  attribution?: string;
};
