import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTENT_LICENSE_STATUSES,
  CONTENT_PROVENANCE_KINDS,
  LICENSE_STATUSES_BY_PROVENANCE_KIND,
  PUBLISHABLE_LICENSE_STATUSES,
  isLicenseStatusAllowedForKind,
  isPublishableProvenance,
  requiresAttribution,
  type ContentLicenseStatus,
  type ContentProvenance,
  type ContentProvenanceKind,
} from '@/modules/content/domain/provenance';

function makeProvenance(
  kind: ContentProvenanceKind,
  licenseStatus: ContentLicenseStatus,
  attribution?: string,
): ContentProvenance {
  return {
    kind,
    sourceName: 'Futsal Manager AI',
    licenseStatus,
    ...(attribution === undefined ? {} : { attribution }),
  };
}

describe('Content provenance policy', () => {
  describe('Given the publishable license statuses', () => {
    describe('When the contract constant is read', () => {
      it('then only owned and permitted can be published', () => {
        assert.deepEqual([...PUBLISHABLE_LICENSE_STATUSES], ['owned', 'permitted']);
      });
    });
  });

  describe('Given every license status', () => {
    describe('When publishability is checked', () => {
      it('then only owned and permitted are publishable', () => {
        const expected: Record<ContentLicenseStatus, boolean> = {
          owned: true,
          permitted: true,
          'reference-only': false,
          pending: false,
          unlicensed: false,
        };

        for (const licenseStatus of CONTENT_LICENSE_STATUSES) {
          assert.equal(
            isPublishableProvenance(makeProvenance('original', licenseStatus)),
            expected[licenseStatus],
            `Expected licenseStatus "${licenseStatus}" publishable to be ${expected[licenseStatus]}.`,
          );
        }
      });
    });
  });

  describe('Given provenance that depends on permission', () => {
    describe('When attribution is required', () => {
      it('then permitted and cmd-mora records require attribution', () => {
        const cases: { provenance: ContentProvenance; expected: boolean }[] = [
          { provenance: makeProvenance('original', 'owned'), expected: false },
          { provenance: makeProvenance('original', 'permitted'), expected: true },
          { provenance: makeProvenance('cmd-mora', 'permitted'), expected: true },
          { provenance: makeProvenance('reference', 'reference-only'), expected: false },
          { provenance: makeProvenance('reference', 'pending'), expected: false },
          { provenance: makeProvenance('original', 'unlicensed'), expected: false },
        ];

        for (const { provenance, expected } of cases) {
          assert.equal(
            requiresAttribution(provenance),
            expected,
            `Expected requiresAttribution(${provenance.kind}/${provenance.licenseStatus}) to be ${expected}.`,
          );
        }
      });
    });
  });

  describe('Given a provenance kind', () => {
    describe('When license status compatibility is checked', () => {
      it('then original accepts every status', () => {
        for (const licenseStatus of CONTENT_LICENSE_STATUSES) {
          assert.equal(isLicenseStatusAllowedForKind('original', licenseStatus), true);
        }
      });

      it('then cmd-mora only accepts permitted', () => {
        for (const licenseStatus of CONTENT_LICENSE_STATUSES) {
          assert.equal(
            isLicenseStatusAllowedForKind('cmd-mora', licenseStatus),
            licenseStatus === 'permitted',
            `Expected cmd-mora with "${licenseStatus}" to be ${licenseStatus === 'permitted'}.`,
          );
        }
      });

      it('then reference only accepts reference-only or pending', () => {
        for (const licenseStatus of CONTENT_LICENSE_STATUSES) {
          const expected = licenseStatus === 'reference-only' || licenseStatus === 'pending';

          assert.equal(
            isLicenseStatusAllowedForKind('reference', licenseStatus),
            expected,
            `Expected reference with "${licenseStatus}" to be ${expected}.`,
          );
        }
      });
    });
  });

  describe('Given the license status table', () => {
    describe('When it is compared with the policy helpers', () => {
      it('then every kind exposes a table entry that the helper agrees with', () => {
        for (const kind of CONTENT_PROVENANCE_KINDS) {
          const allowed = LICENSE_STATUSES_BY_PROVENANCE_KIND[kind];

          assert.ok(allowed.length >= 1, `Expected an allowed status for kind "${kind}".`);

          for (const licenseStatus of CONTENT_LICENSE_STATUSES) {
            assert.equal(
              isLicenseStatusAllowedForKind(kind, licenseStatus),
              allowed.includes(licenseStatus),
            );
          }
        }
      });

      it('then no kind allows a status outside the license status contract', () => {
        for (const kind of CONTENT_PROVENANCE_KINDS) {
          for (const licenseStatus of LICENSE_STATUSES_BY_PROVENANCE_KIND[kind]) {
            assert.ok(CONTENT_LICENSE_STATUSES.includes(licenseStatus));
          }
        }
      });
    });
  });
});
