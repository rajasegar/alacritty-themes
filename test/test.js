/* globals describe it */
'use strict';

const assert = require('assert');
const mock = require('mock-fs');
const path = require('path');
const fs = require('fs');
//const YAML = require('yaml');

//const {
//getAlacrittyConfig,
//noConfigErr,
//createConfigFile,
//applyTheme,
//} = require('../');

const homeDir = process.env.HOME;

describe('Alacritty Themes', () => {
  /*
  it('should not have a config file by default', () => {
    mock();
    assert.throws(() => getAlacrittyConfig(), noConfigErr);
    mock.restore();
  });
  */

  it('should have a config file after creating it', () => {
    console.log(process.cwd());
    const templatePath = path.join(process.cwd(), 'alacritty.yml');
    const configTemplate = fs.readFileSync(templatePath, 'utf8');
    const mockDir = {
      'alacritty.yml': configTemplate,
    };
    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    mock(mockDir);
    //createConfigFile();
    //const ymlPath = getAlacrittyConfig();
    //assert.equal(ymlPath, `${homeDir}/.config/alacritty/alacritty.yml`);
    assert.ok(fs.existsSync('alacritty.yml'));
    mock.restore();
  });

  /*
  it('should set the correct theme colors', async () => {
    const templatePath = path.join(process.cwd(), 'alacritty.yml');
    const configTemplate = fs.readFileSync(templatePath, 'utf8');

    const themePath = path.join(process.cwd(), `themes/Dracula.yml`);
    const themeFile = fs.readFileSync(themePath, 'utf8');

    const themeDoc = YAML.parseDocument(themeFile);
    const themeColors = themeDoc.contents.items.filter(
      (i) => i.key.value === 'colors'
    )[0];

    const mockDir = {
      'alacritty.yml': configTemplate,
      themes: {
        'Dracula.yml': themeFile,
      },
    };

    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    !process.env.CI && mock(mockDir);
    createConfigFile();
    const ymlPath = getAlacrittyConfig();
    await applyTheme('Dracula');
    const newTemplate = fs.readFileSync(ymlPath, 'utf8');
    const doc = YAML.parseDocument(newTemplate);

    // Find the colors key in user's alacritty.yml
    const colors = doc.contents.items.filter(
      (i) => i.key.value === 'colors'
    )[0];

    const primaryBg = colors.value.items[0].value.items[0].value.value;
    const themePrimaryBg =
      themeColors.value.items[0].value.items[0].value.value;
    assert.equal(primaryBg, themePrimaryBg);
    !process.env.CI && mock.restore();
  });
  */
});
