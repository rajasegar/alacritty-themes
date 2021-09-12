const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

const NoAlacrittyFileFoundError = new Error(
  'No Alacritty configuration file found. Expected one of the following files to exist:\n' +
    possibleLocations().join('\n')
);

function rootDir() {
  return process.env.PWD;
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

function windowsAlacrittyPath() {
  return path.join(windowsHome(), 'alacritty/');
}

function linuxAlacrittyPath() {
  return path.join(linuxHome(), '.config/alacritty/');
}

function userAlacrittyPathExist() {
  return fs.existsSync(userAlacrittyPath());
}

function userAlacrittyPath() {
  return isWindows() ? windowsAlacrittyPath() : linuxAlacrittyPath();
}

function useUserAlacrittyPath() {
  if (userAlacrittyPathExist()) {
    return userAlacrittyPath();
  } else {
    return createUserAlacrittyPath();
  }
}

function createUserAlacrittyPath() {
  return fs.mkdirSync(userAlacrittyPath());
}

function alacrittyTemplatePath() {
  return path.join(rootDir(), 'alacritty.yml');
}

function alacrittyTemplateContent() {
  return fs.readFileSync(alacrittyTemplatePath(), 'utf8');
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
  alacrittyTemplateContent,
  alacrittyTemplatePath,
  archHome,
  isWindows,
  linuxHome,
  possibleLocations,
  rootDir,
  useUserAlacrittyPath,
  windowsHome,
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
};
