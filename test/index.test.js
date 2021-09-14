/* globals describe it afterEach */
'use strict';

const assert = require('assert');
const mockFs = require('mock-fs');
const fs = require('fs');
const YAML = require('yaml');

const { getAlacrittyConfig, createConfigFile, applyTheme } = require('../');

const {
  NoAlacrittyFileFoundError,
  alacrittyTemplatePath,
  linuxHome,
  themeFilePath,
} = require('../src/helpers');

const homeDir = linuxHome();

afterEach(mockFs.restore);

describe('Alacritty Themes', () => {
  it('should not have a config file by default', () => {
    mockFs();
    assert.throws(() => getAlacrittyConfig(), NoAlacrittyFileFoundError);
  });

  it('should have a config file after creating it', async () => {
    const templatePath = alacrittyTemplatePath();
    const mockDir = {
      'alacritty.yml': mockFs.load(templatePath),
    };
    mockDir[`${homeDir}/.config/`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const ymlPath = getAlacrittyConfig();
    assert.strictEqual(ymlPath, `${homeDir}/.config/alacritty/alacritty.yml`);
  });

  it('should set the correct theme colors', async () => {
    const templatePath = alacrittyTemplatePath();
    const draculaPath = themeFilePath('Dracula');
    const draculaTemplateContent = mockFs.bypass(() =>
      fs.readFileSync(draculaPath, 'utf8')
    );
    const draculaParsedContent = YAML.parse(draculaTemplateContent);

    const mockDir = {
      'alacritty.yml': mockFs.load(templatePath),
      themes: {
        'Dracula.yml': draculaTemplateContent,
      },
    };

    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const ymlPath = getAlacrittyConfig();
    await applyTheme('Dracula');
    const newAlacrittyFile = fs.readFileSync(ymlPath, 'utf8');
    const alacrittyParsedContent = YAML.parse(newAlacrittyFile);

    assert.deepStrictEqual(
      alacrittyParsedContent.colors,
      draculaParsedContent.colors
    );
  });
});
