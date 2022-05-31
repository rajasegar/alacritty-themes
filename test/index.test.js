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
  themesFolder,
} = require('../src/helpers');

const homeDir = linuxHome();

afterEach(mockFs.restore);

describe('Alacritty Themes', () => {
  it('returns NoAlacrittyFileFoundError error', () => {
    mockFs();
    assert.throws(() => getAlacrittyConfig(), NoAlacrittyFileFoundError);
  });

  it('creates an alacritty.yml config file', async () => {
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

  it('sets the correct theme colors', async () => {
    const templatePath = alacrittyTemplatePath();
    const draculaPath = themeFilePath('Dracula', themesFolder());
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
    await applyTheme('Dracula', themesFolder());
    const newAlacrittyFile = fs.readFileSync(ymlPath, 'utf8');
    const alacrittyParsedContent = YAML.parse(newAlacrittyFile);

    assert.deepStrictEqual(
      alacrittyParsedContent.colors,
      draculaParsedContent.colors
    );
  });

  it('keeps comments', async () => {
    const alacrittyPath = alacrittyTemplatePath();
    const alacrittyContent = mockFs.bypass(() =>
      fs.readFileSync(alacrittyPath, 'utf8')
    );
    const draculaPath = themeFilePath('Dracula', themesFolder());
    const draculaContent = mockFs.bypass(() =>
      fs.readFileSync(draculaPath, 'utf8')
    );

    const mockDir = {
      'alacritty.yml': alacrittyContent,
      themes: {
        'Dracula.yml': draculaContent,
      },
    };
    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const userAlacrittyPath = getAlacrittyConfig();
    await applyTheme('Dracula', themesFolder());
    const userAlacrittyFile = fs.readFileSync(userAlacrittyPath, 'utf8');
    const alacritty = YAML.parseDocument(userAlacrittyFile);

    assert.strictEqual(
      alacritty.commentBefore,
      ' Configuration for Alacritty, the GPU enhanced terminal emulator.'
    );
  });
});
