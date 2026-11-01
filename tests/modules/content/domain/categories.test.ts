import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CATEGORIES,
  CATEGORY_IDS,
  getCategoryById,
  isCategoryId,
  type CategoryId,
} from '@/modules/content/domain/category';

const RFEF_CATEGORY_NAMES = [
  'Prebenjamín',
  'Benjamín',
  'Alevín',
  'Infantil',
  'Cadete',
  'Juvenil',
  'Senior',
];

describe('Content category reference data', () => {
  describe('Given the official RFEF age brackets', () => {
    describe('When the categories are listed', () => {
      it('then exactly seven categories exist in RFEF order', () => {
        assert.deepEqual([...CATEGORY_IDS], [
          'prebenjamin',
          'benjamin',
          'alevin',
          'infantil',
          'cadete',
          'juvenil',
          'senior',
        ]);
        assert.equal(CATEGORIES.length, 7);
        assert.deepEqual(
          CATEGORIES.map((category) => category.id),
          [...CATEGORY_IDS],
        );
        assert.deepEqual(
          CATEGORIES.map((category) => category.order),
          [1, 2, 3, 4, 5, 6, 7],
        );
      });

      it('then every category has a Spanish name and a U-age label', () => {
        assert.deepEqual(
          CATEGORIES.map((category) => category.name),
          RFEF_CATEGORY_NAMES,
        );
        assert.deepEqual(
          CATEGORIES.map((category) => category.ageLabel),
          ['U8', 'U10', 'U12', 'U14', 'U16', 'U19', '+18'],
        );
      });

      it('then age ranges are ordered and only Senior is open-ended', () => {
        const boundedCategories = CATEGORIES.filter(
          (category) => category.ageRange !== null,
        );

        assert.equal(boundedCategories.length, 6);
        assert.deepEqual(
          boundedCategories.map((category) => category.ageRange),
          [
            { min: 6, max: 7 },
            { min: 8, max: 9 },
            { min: 10, max: 11 },
            { min: 12, max: 13 },
            { min: 14, max: 15 },
            { min: 16, max: 18 },
          ],
        );
        assert.equal(getCategoryById('senior')?.ageRange, null);
      });

      it('then no skill tier or Chupetín-style stage appears', () => {
        const allLabels = CATEGORIES.flatMap((category) => [
          category.id,
          category.name,
          category.ageLabel,
        ]);

        for (const label of allLabels) {
          assert.doesNotMatch(label, /chupet|iniciaci|avanzad|elite|élite|skill/i);
        }
      });
    });
  });

  describe('Given a category id', () => {
    describe('When it is checked or looked up', () => {
      it('then known RFEF ids are accepted and unknown ids are rejected', () => {
        assert.equal(isCategoryId('infantil'), true);
        assert.equal(isCategoryId('senior'), true);
        assert.equal(isCategoryId('chupetin'), false);
        assert.equal(isCategoryId('u14'), false);
        assert.equal(isCategoryId(undefined), false);
      });

      it('then lookup returns the matching category or undefined', () => {
        const infantil = getCategoryById('infantil');

        assert.equal(infantil?.name, 'Infantil');
        assert.equal(infantil?.ageLabel, 'U14');
        const unknownCategoryId = 'micro' as CategoryId;

        assert.equal(getCategoryById('cadete')?.order, 5);
        assert.equal(getCategoryById(unknownCategoryId), undefined);
      });
    });
  });
});
