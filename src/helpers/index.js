const fs = require('fs');
const path = require('path');

const NoAlacrittyFileFoundError = new Error(
  'No Alacritty configuration file found. Expected one of the following files to exist:\n' +
    possibleLocations().join('\n')
);

function rootDir() {
  return process.env.PWD;
}

function themeFilePath(themeName) {
  return path.join(rootDir(), `themes/${themeName}.yml`);
}

function isWindows() {
  return process.env.OS === 'Windows_NT';
}

function windowsHome() {
  return process.env.APPDATA;
}

function linuxHome() {
  return process.env.HOME;
}

function archHome() {
  return process.env.XDG_CONFIG_HOME;
}

function alacrittyTemplatePath() {
  return path.join(rootDir(), 'alacritty.yml');
}

function alacrittyFileExists() {
  return possibleLocations().some(function (location) {
    return fs.existsSync(location);
  });
}

function alacrittyConfigPath() {
  return possibleLocations().find(function (location) {
    if (!fs.existsSync(location)) return;

    return location;
  });
}

function possibleLocations() {
  let locations = [];

  locations.push(
    path.resolve(linuxHome(), '.config/alacritty/alacritty.yml'),
    path.resolve(linuxHome(), '.alacritty.yml')
  );

  if (isWindows()) {
    locations.push(path.resolve(windowsHome(), 'alacritty/alacritty.yml'));
  }

  // locations where the alacritty config can be located according to
  // https://github.com/alacritty/alacritty#configuration
  if (archHome()) {
    locations.push(
      path.resolve(archHome(), 'alacritty/alacritty.yml'),
      path.resolve(archHome(), 'alacritty.yml')
    );
  }

  return locations;
}

module.exports = {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplatePath,
  archHome,
  isWindows,
  linuxHome,
  possibleLocations,
  rootDir,
  themeFilePath,
  windowsHome,
};
