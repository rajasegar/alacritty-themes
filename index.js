const TOML = require('@iarna/toml');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplatePath,
  pathToAlacrittyFile,
  themeFilePath
} = require('./src/helpers');
const { exit } = require('process');

// pick the correct config file or handle errors, if it doesn't exist
function getAlacrittyConfig() {
  if (!alacrittyFileExists()) {
    throw NoAlacrittyFileFoundError;
  }

  return alacrittyConfigPath();
}

function createConfigFile() {
  const templatePath = alacrittyTemplatePath();
  const configTemplate = fs.readFileSync(templatePath, 'utf8');
  const directories = pathToAlacrittyFile();
  const configFile = `${directories}alacritty.toml`;

  // If .config/alacritty folder doesn't exists, create one
  if (!fs.existsSync(directories)) {
    fs.mkdirSync(directories);
  }

  return fsPromises
    .writeFile(configFile, configTemplate, 'utf8')
    .then(() => {
      console.log(
        `The alacritty.toml config file was created here ${configFile}`
      );
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function getCurrentTheme(themesFolder) {
  if (!alacrittyConfigPath()) {
    console.log(
      'No Alacritty configuration file found\nRun: `alacritty-themes -C` to create one'
    );
    exit(1);
  }
  const alacrittyConfig = fs.readFileSync(alacrittyConfigPath(), 'utf8');
  const parsedAlacrittyConfig = TOML.parse(alacrittyConfig);

  const imports = parsedAlacrittyConfig.import || [];

  // We'll consider the first theme import as the current theme
  for (let i = 0; i < imports.length; i++) {
    const relative = path.relative(themesFolder, imports[i]);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      return path.parse(imports[i]).name;
    }
  }

  return 'default';
}

function updateThemeWithFile(themePath, themesPath, tomlPath, preview = false) {
  const alacrittyConfig = fs.readFileSync(tomlPath, 'utf8');
  const parsedAlacrittyConfig = TOML.parse(alacrittyConfig);

  const imports = parsedAlacrittyConfig.import || [];
  let currentThemeIndex = undefined;

  for (let i = 0; i < imports.length; i++) {
    const relative = path.relative(themesPath, imports[i]);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      currentThemeIndex = i;
      break;
    }
  }

  if (currentThemeIndex === undefined) {
    parsedAlacrittyConfig.import = [themePath];
  } else {
    parsedAlacrittyConfig.import[currentThemeIndex] = themePath;
  }

  const newContent = TOML.stringify(parsedAlacrittyConfig);

  const themeName = path.parse(themePath).name;

  return fsPromises
    .writeFile(tomlPath, newContent, 'utf8')
    .then(() => {
      if (!preview) {
        console.log(`The theme "${themeName}" has been applied successfully!`);
      }
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateTheme(theme, themesPath, tomlPath, preview = false) {
  const isSpecificFile =
    fs.existsSync(theme) && !fs.lstatSync(theme).isDirectory();
  const themePath = isSpecificFile ? theme : themeFilePath(theme, themesPath);

  return updateThemeWithFile(themePath, themesPath, tomlPath, preview);
}

function applyTheme(theme, themesFolder, preview = false) {
  const tomlPath = getAlacrittyConfig();
  return updateTheme(theme, themesFolder, tomlPath, preview);
}

module.exports = {
  applyTheme,
  createConfigFile,
  getAlacrittyConfig,
  getCurrentTheme
};
