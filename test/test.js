/* globals describe it */
'use strict';

const assert = require('assert');
const { getAlacrittyConfig } = require('../');

describe('Alacritty Themes', () => {
  it('should not have a config file by default', () => {
    const ymlPath = getAlacrittyConfig();
    assert.equal(ymlPath, '');
  });
});
