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
  alacrittyTemplateContent,
  useUserAlacrittyPath,
} = require('../src/helpers');

describe('Alacritty Themes', () => {
  it('should not have a config file by default', () => {
    mockFs();
    assert.throws(() => getAlacrittyConfig(), NoAlacrittyFileFoundError);
    mockFs.restore();
  });

  it('creates an Alacritty config file', async () => {
    const userAlacrittyPath = useUserAlacrittyPath();
    const templateContent = alacrittyTemplateContent();
    const mockDir = {
      'alacritty.yml': templateContent,
    };
    mockDir[userAlacrittyPath] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const ymlPath = getAlacrittyConfig();
    assert.strictEqual(ymlPath, `${userAlacrittyPath}alacritty.yml`);
    mockFs.restore();
  });

  it('should set the correct theme colors', async () => {
    const userAlacrittyPath = useUserAlacrittyPath();
    const templateContent = alacrittyTemplateContent();

    const themePath = path.join(process.cwd(), `themes/Dracula.yml`);
    const themeFile = fs.readFileSync(themePath, 'utf8');

    const themeDoc = YAML.parseDocument(themeFile);
    const themeColors = themeDoc.contents.items.filter(
      (i) => i.key.value === 'colors'
    )[0];

    const mockDir = {
      'alacritty.yml': templateContent,
      themes: {
        'Dracula.yml': themeFile,
      },
    };

    mockDir[userAlacrittyPath] = { alacritty: {} };
    !process.env.CI && mockFs(mockDir);
    await createConfigFile();
    const ymlPath = getAlacrittyConfig();
    assert.strictEqual(ymlPath, `${userAlacrittyPath}alacritty.yml`);
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
