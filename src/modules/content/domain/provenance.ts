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

export const PUBLISHABLE_LICENSE_STATUSES = ['owned', 'permitted'] as const;

export type PublishableLicenseStatus = (typeof PUBLISHABLE_LICENSE_STATUSES)[number];

export const LICENSE_STATUSES_BY_PROVENANCE_KIND: Record<
  ContentProvenanceKind,
  readonly ContentLicenseStatus[]
> = {
  original: CONTENT_LICENSE_STATUSES,
  'cmd-mora': ['permitted'],
  reference: ['reference-only', 'pending'],
};

export type ContentProvenance = {
  kind: ContentProvenanceKind;
  sourceName: string;
  licenseStatus: ContentLicenseStatus;
  attribution?: string;
};

export function isLicenseStatusAllowedForKind(
  kind: ContentProvenanceKind,
  licenseStatus: ContentLicenseStatus,
): boolean {
  return LICENSE_STATUSES_BY_PROVENANCE_KIND[kind].includes(licenseStatus);
}

export function isPublishableProvenance(provenance: ContentProvenance): boolean {
  return (PUBLISHABLE_LICENSE_STATUSES as readonly ContentLicenseStatus[]).includes(
    provenance.licenseStatus,
  );
}

export function requiresAttribution(provenance: ContentProvenance): boolean {
  return provenance.licenseStatus === 'permitted' || provenance.kind === 'cmd-mora';
}
