/* globals describe it afterEach */
const assert = require('assert');
const fs = require('fs');
const mockFs = require('mock-fs');
const sinon = require('sinon');

const helper = require('../../../src/helpers');
const settings = require('../../../settings');

afterEach(() => {
  sinon.restore();
});

describe('rootDirectory', () => {
  it('returns the alacritty-themes root directory', () => {
    let alacrittyThemeDirectory = '/home/rajasegar/projects/alacritty-themes';
    sinon.stub(helper, 'rootDirectory').returns(alacrittyThemeDirectory);

    assert.strictEqual(helper.rootDirectory(), alacrittyThemeDirectory);
  });
});

describe('themeFilePath', 'themesFolder', () => {
  it('returns a theme file', () => {
    let path = `${settings.PROJECT_DIR}/themes/TokyoNight_Storm.yml`;
    let themePath = {};
    themePath[path] = '# TokyoNight Alacritty Colors';
    mockFs(themePath);

    assert.strictEqual(
      path,
      helper.themeFilePath('TokyoNight_Storm', helper.themesFolder())
    );
  });

  it('does not return a theme file', () => {
    let path = `${settings.PROJECT_DIR}/themes/TokyoNight_Storm.yml`;
    let themePath = {};
    themePath[path] = '# TokyoNight Alacritty Colors';

    mockFs({
      'TokyoNight_Storm.yml': '# TokyoNight Alacritty Colors',
    });

    assert.strictEqual(
      fs.existsSync(helper.themeFilePath('Dracula', helper.themesFolder())),
      false
    );
  });
});

describe('isWindows', () => {
  it('returns true', () => {
    sinon.stub(helper, 'isWindows').returns(true);

    assert.strictEqual(helper.isWindows(), true);
  });

  it('returns false', () => {
    sinon.stub(helper, 'isWindows').returns(false);

    assert.strictEqual(helper.isWindows(), false);
  });
});

describe('linuxHome', () => {
  it('returns user linux root directory', () => {
    let home = '/home/rajasegar';
    sinon.stub(helper, 'linuxHome').returns(home);

    assert.strictEqual(helper.linuxHome(), home);
  });
});

describe('archHome', () => {
  it('returns user arch root directory', () => {
    let home = '/users/rajasegar';
    sinon.stub(helper, 'archHome').returns(home);

    assert.strictEqual(helper.archHome(), home);
  });
});

describe('pathToAlacrittyFile', () => {
  it('returns the path to alacritty file on linux', () => {
    let home = '/home/rajasegar';
    sinon.stub(helper, 'isWindows').returns(false);
    sinon
      .stub(helper, 'pathToAlacrittyFile')
      .returns(`${home}/.config/alacritty/`);

    assert.strictEqual(
      helper.pathToAlacrittyFile(),
      `${home}/.config/alacritty/`
    );
  });
});

describe('possibleLocations', () => {
  it('returns an array', () => {
    let locations = typeof helper.possibleLocations();

    assert(locations, 'array');
  });

  it('returns Linux possible locations', () => {
    let home = '/home/rajasegar';
    sinon.stub(helper, 'linuxHome').returns(home);

    let locations = helper.possibleLocations();

    assert(locations, [
      `${home}/.config/alacritty/alacritty.yml`,
      `${home}/.config/.alacritty.yml`,
    ]);
  });

  it('includes Arch possible locations', () => {
    let home = '/home/rajasegar';
    let local = '/usr/local';
    sinon.stub(helper, 'linuxHome').returns(home);
    sinon.stub(helper, 'archHome').returns(local);

    let locations = helper.possibleLocations();

    assert(locations, [
      `${home}/.config/alacritty/alacritty.yml`,
      `${home}/.alacritty.yml`,
      `${local}/alacritty/alacritty.yml`,
      `${local}/alacritty.yml`,
    ]);
  });
});
