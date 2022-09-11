const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const settings = require('../../settings');

const NoAlacrittyFileFoundError = new Error(
  'No Alacritty configuration file found.\nExpected one of the following files to exist:\n' +
    possibleLocations().join('\n') +
    '\nOr you can create a new one using `alacritty-themes --create`'
);

function createBackup() {
  if (!alacrittyFileExists()) {
    return;
  }

  const alacrittyFile = alacrittyConfigPath();
  const backupFile = `${alacrittyFile}.${Date.now()}.bak`;

  fsPromises
    .copyFile(alacrittyFile, backupFile)
    .then(() => {
      console.log(`Automatic backup file was created: ${backupFile}`);
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function rootDirectory() {
  return settings.PROJECT_DIR;
}

function existingTheme(themeName, themesFolder) {
  const file = themeFilePath(themeName, themesFolder);

  return fs.existsSync(file);
}

function themeFilePath(themeName, themesFolder) {
  return path.join(themesFolder, `${themeName}.yml`);
}

function themesFolder() {
  return path.join(rootDirectory(), 'themes');
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

function pathToAlacrittyFile() {
  return isWindows()
    ? pathToAlacrittyFileOnWindows()
    : pathToAlacrittyFileOnLinux();
}

function pathToAlacrittyFileOnWindows() {
  return path.join(windowsHome(), 'alacritty/');
}

function pathToAlacrittyFileOnLinux() {
  return path.join(linuxHome(), '.config/alacritty/');
}

function alacrittyTemplatePath() {
  return path.join(rootDirectory(), 'alacritty.yml');
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

  if (linuxHome()) {
    locations.push(
      path.join(linuxHome(), '.config/alacritty/alacritty.yml'),
      path.join(linuxHome(), '.alacritty.yml')
    );
  }

  if (isWindows()) {
    locations.push(path.join(windowsHome(), 'alacritty/alacritty.yml'));
  }

  // locations where the alacritty config can be located according to
  // https://github.com/alacritty/alacritty#configuration
  if (archHome()) {
    locations.push(
      path.join(archHome(), 'alacritty/alacritty.yml'),
      path.join(archHome(), 'alacritty.yml')
    );
  }

  return locations;
}

function helpMessage() {
  return `
    Usage: \n\talacritty-themes [options] [theme-name] | [themes-directory]\n

    Description: \n\tThemes candy for alacritty A cross-platform GPU-accelerated terminal emulator\n

    Options: \n\t--help, -h\tshows this help message and exit
    \t--create, -C\tcreates a new config file
    \t--current, -c\tshows applied theme name
    \t--list, -l\tlists all available themes
    \t--directory, -d\tspecify themes directory
  `;
}

module.exports = {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplatePath,
  archHome,
  createBackup,
  helpMessage,
  isWindows,
  linuxHome,
  pathToAlacrittyFile,
  possibleLocations,
  rootDirectory,
  existingTheme,
  themeFilePath,
  themesFolder,
  windowsHome,
};
