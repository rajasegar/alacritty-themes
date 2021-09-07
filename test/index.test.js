/* globals describe it */
'use strict';

const assert = require('assert');
const mockFs = require('mock-fs');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

const { getAlacrittyConfig, createConfigFile, applyTheme } = require('../');

const {
  NoAlacrittyFileFoundError,
  alacrittyTemplatePath,
  linuxHome,
} = require('../src/helpers');

const homeDir = linuxHome();

describe('Alacritty Themes', () => {
  it('should not have a config file by default', () => {
    mockFs();
    assert.throws(() => getAlacrittyConfig(), NoAlacrittyFileFoundError);
    mockFs.restore();
  });

  it('should have a config file after creating it', async () => {
    console.log(process.cwd());
    const templatePath = alacrittyTemplatePath();
    const configTemplate = fs.readFileSync(templatePath, 'utf8');
    const mockDir = {
      'alacritty.yml': configTemplate,
    };
    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const ymlPath = getAlacrittyConfig();
    assert.strictEqual(ymlPath, `${homeDir}/.config/alacritty/alacritty.yml`);
    mockFs.restore();
  });

  it('should set the correct theme colors', async () => {
    const templatePath = alacrittyTemplatePath();
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
    !process.env.CI && mockFs(mockDir);
    await createConfigFile();
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
    assert.strictEqual(primaryBg, themePrimaryBg);
    !process.env.CI && mockFs.restore();
  });
});
