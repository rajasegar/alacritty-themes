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

  it('creates an alacritty.toml config file', async () => {
    const templatePath = alacrittyTemplatePath();
    const mockDir = {
      'alacritty.toml': mockFs.load(templatePath),
    };
    mockDir[`${homeDir}/.config/`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const tomlPath = getAlacrittyConfig();
    assert.strictEqual(tomlPath, `${homeDir}/.config/alacritty/alacritty.toml`);
  });

  it.skip('sets the correct theme colors', async () => {
    const templatePath = alacrittyTemplatePath();
    const draculaPath = themeFilePath('Dracula', themesFolder());
    const draculaTemplateContent = mockFs.bypass(() =>
      fs.readFileSync(draculaPath, 'utf8')
    );
    const draculaParsedContent = YAML.parse(draculaTemplateContent);

    const mockDir = {
      'alacritty.toml': mockFs.load(templatePath),
      themes: {
        'Dracula.toml': draculaTemplateContent,
      },
    };

    mockDir[`${homeDir}/.config`] = { alacritty: {} };
    mockFs(mockDir);
    await createConfigFile();
    const tomlPath = getAlacrittyConfig();
    await applyTheme('Dracula', themesFolder());
    const newAlacrittyFile = fs.readFileSync(tomlPath, 'utf8');
    const alacrittyParsedContent = YAML.parse(newAlacrittyFile);

    assert.deepStrictEqual(
      alacrittyParsedContent.colors,
      draculaParsedContent.colors
    );
  });

  it.skip('keeps comments', async () => {
    const alacrittyPath = alacrittyTemplatePath();
    const alacrittyContent = mockFs.bypass(() =>
      fs.readFileSync(alacrittyPath, 'utf8')
    );
    const draculaPath = themeFilePath('Dracula', themesFolder());
    const draculaContent = mockFs.bypass(() =>
      fs.readFileSync(draculaPath, 'utf8')
    );

    const mockDir = {
      'alacritty.toml': alacrittyContent,
      themes: {
        'Dracula.toml': draculaContent,
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
