/* globals describe it */
const assert = require('assert');

const possibleLocations = require('../../../src/helpers/possibleLocations');

describe('possibleLocations', () => {
  it('returns an array', () => {
    let locations = typeof possibleLocations();

    assert(locations, 'array');
  });
});
