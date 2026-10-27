import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INITIAL_CATEGORY_SELECTION,
  selectCategory,
} from '@/modules/content/presentation/state/category-selection';

describe('Category selection state', () => {
  describe('Given no category has been selected', () => {
    describe('When the initial selection is read', () => {
      it('then no category is selected', () => {
        assert.equal(INITIAL_CATEGORY_SELECTION.categoryId, null);
      });
    });
  });

  describe('Given an RFEF category id', () => {
    describe('When the category is selected', () => {
      it('then the valid id is stored in a new state object', () => {
        const nextSelection = selectCategory(INITIAL_CATEGORY_SELECTION, 'infantil');

        assert.equal(nextSelection.categoryId, 'infantil');
        assert.notEqual(nextSelection, INITIAL_CATEGORY_SELECTION);
      });
    });
  });

  describe('Given one category is already selected', () => {
    describe('When another RFEF category is selected', () => {
      it('then the selection is replaced instead of stacked', () => {
        const infantilSelection = selectCategory(INITIAL_CATEGORY_SELECTION, 'infantil');
        const seniorSelection = selectCategory(infantilSelection, 'senior');

        assert.equal(seniorSelection.categoryId, 'senior');
        assert.notEqual(seniorSelection, infantilSelection);
      });
    });
  });

  describe('Given one category is already selected', () => {
    describe('When an unknown value such as "chupetin" is selected', () => {
      it('then the unknown id is ignored and the previous selection is kept', () => {
        const infantilSelection = selectCategory(INITIAL_CATEGORY_SELECTION, 'infantil');
        const nextSelection = selectCategory(infantilSelection, 'chupetin');

        assert.equal(nextSelection.categoryId, 'infantil');
        assert.equal(nextSelection, infantilSelection);
      });
    });
  });

  describe('Given the initial selection', () => {
    describe('When an unknown value is selected', () => {
      it('then the same reference is returned without throwing', () => {
        const nextSelection = selectCategory(INITIAL_CATEGORY_SELECTION, 'chupetin');

        assert.equal(nextSelection, INITIAL_CATEGORY_SELECTION);
      });
    });
  });
});
