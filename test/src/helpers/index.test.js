/* globals describe it */
const assert = require('assert');
const mockedEnv = require('mocked-env');
const mockFs = require('mock-fs');
const fs = require('fs');

const {
  archHome,
  isWindows,
  linuxHome,
  possibleLocations,
  rootDirectory,
  themeFilePath,
} = require('../../../src/helpers');

describe('rootDirectory', () => {
  it('returns the alacritty-themes root directory', () => {
    let alacrittyThemeDirectory = '/home/rajasegar/alacritty-themes';
    let restore = mockedEnv({ PWD: alacrittyThemeDirectory });

    assert(rootDirectory(), alacrittyThemeDirectory);
    restore();
  });
});

describe('themeFilePath', () => {
  it('returns a theme file', () => {
    let alacrittyThemeDirectory = '/home/rajasegar/alacritty-themes';
    let restore = mockedEnv({ PWD: alacrittyThemeDirectory });
    mockFs({
      'TokyoNight_Storm.yml': '# TokyoNight Alacritty Colors',
    });

    assert.strictEqual(
      themeFilePath('TokyoNight_Storm'),
      `${alacrittyThemeDirectory}/themes/TokyoNight_Storm.yml`
    );
    restore();
  });

  it('does not return a theme file', () => {
    let alacrittyThemeDirectory = '/home/rajasegar/alacritty-themes';
    let restore = mockedEnv({ PWD: alacrittyThemeDirectory });
    mockFs({
      'TokyoNight_Storm.yml': '# TokyoNight Alacritty Colors',
    });

    assert.strictEqual(fs.existsSync(themeFilePath('Dracula')), false);
    restore();
  });
});

describe('isWindows', () => {
  it('returns true', () => {
    let restore = mockedEnv({ OS: 'Windows_NT' });

    assert.strictEqual(isWindows(), true);
    restore();
  });

  it('returns false', () => {
    let restore = mockedEnv({ OS: undefined });

    assert.strictEqual(isWindows(), false);
    restore();
  });
});

describe('linuxHome', () => {
  it('returns user linux root directory', () => {
    let home = '/home/rajasegar';
    let restore = mockedEnv({ HOME: home });

    assert.strictEqual(linuxHome(), home);
    restore();
  });
});

describe('archHome', () => {
  it('returns user arch root directory', () => {
    let home = '/users/rajasegar';
    let restore = mockedEnv({ XDG_CONFIG_HOME: home });

    assert.strictEqual(archHome(), home);
    restore();
  });
});

describe('possibleLocations', () => {
  it('returns an array', () => {
    let locations = typeof possibleLocations();

    assert(locations, 'array');
  });

  it('returns Linux possible locations', () => {
    let home = '/home/rajasegar';
    let restore = mockedEnv({ HOME: home });
    let locations = possibleLocations();

    assert(locations, [
      `${home}/.config/alacritty/alacritty.yml`,
      `${home}/.config/.alacritty.yml`,
    ]);
    restore();
  });

  it('includes Arch possible locations', () => {
    let restore = mockedEnv({
      HOME: '/home/rajasegar',
      XDG_CONFIG_HOME: '/usr/local',
    });
    let locations = possibleLocations();

    assert(locations, [
      '/home/rajasegar/.config/alacritty/alacritty.yml',
      '/home/rajasegar/.alacritty.yml',
      '/usr/local/alacritty/alacritty.yml',
      '/usr/local/alacritty.yml',
    ]);
    restore();
  });
});
