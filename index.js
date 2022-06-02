const YAML = require('yaml');
const fs = require('fs');
const fsPromises = fs.promises;
const { Pair } = require('yaml/types');

const {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplatePath,
  pathToAlacrittyFile,
  themeFilePath,
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
  const configFile = `${directories}alacritty.yml`;

  // If .config/alacritty folder doesn't exists, create one
  if (!fs.existsSync(directories)) {
    fs.mkdirSync(directories);
  }

  return fsPromises
    .writeFile(configFile, configTemplate, 'utf8')
    .then(() => {
      console.log(
        `The alacritty.yml config file was created here ${configFile}`
      );
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function getCurrentTheme() {
  if (!alacrittyConfigPath()) {
    console.log(
      'No Alacritty configuration file found\nRun: `alacritty-themes -C` to create one'
    );
    exit(1);
  }
  const themeFile = fs.readFileSync(alacrittyConfigPath(), 'utf8');
  const themeDoc = YAML.parse(themeFile);

  return themeDoc.theme ? themeDoc.theme : 'default';
}

function updateThemeWithFile(
  data,
  themeName,
  themePath,
  ymlPath,
  preview = false
) {
  const themeFile = fs.readFileSync(themePath, 'utf8');
  const themeDoc = YAML.parseDocument(themeFile);
  const themeColors = themeDoc.contents.items.find(
    (i) => i.key.value === 'colors'
  );

  const alacrittyDoc = YAML.parseDocument(data);
  if (alacrittyDoc.contents === null) {
    alacrittyDoc.contents = { items: [] };
  }
  const alacrittyColors = alacrittyDoc.contents.items.find(
    (i) => i.key.value === 'colors'
  );

  if (alacrittyColors) {
    alacrittyColors.value = themeColors.value;
  } else {
    alacrittyDoc.contents.items.push(new Pair('colors', themeColors.value));
  }

  const alacrittyTheme = alacrittyDoc.contents.items.find(
    (i) => i.key.value === 'theme'
  );

  if (alacrittyTheme) {
    alacrittyTheme.value = themeName;
  } else {
    alacrittyDoc.contents.items.push(new Pair('theme', themeName));
  }

  const newContent = String(alacrittyDoc);

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      if (!preview) {
        console.log(`The theme "${themeName}" has been applied successfully!`);
      }
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateTheme(data, theme, themesFolder, ymlPath, preview = false) {
  const isSpecificFile =
    fs.existsSync(theme) && !fs.lstatSync(theme).isDirectory();
  const themePath = isSpecificFile ? theme : themeFilePath(theme, themesFolder);

  return updateThemeWithFile(data, theme, themePath, ymlPath, preview);
}

function applyTheme(theme, themesFolder, preview = false) {
  const ymlPath = getAlacrittyConfig();

  return fsPromises.readFile(ymlPath, 'utf8').then((data) => {
    return updateTheme(data, theme, themesFolder, ymlPath, preview);
  });
}

module.exports = {
  applyTheme,
  createConfigFile,
  getAlacrittyConfig,
  getCurrentTheme,
};
