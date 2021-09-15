const YAML = require('yaml');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { Pair } = require('yaml/types');

const {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplatePath,
  isWindows,
  themeFilePath,
} = require('./src/helpers');

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

  const homeDir = isWindows()
    ? path.join(process.env.APPDATA, 'alacritty/')
    : path.join(process.env.HOME, '.config/alacritty/');

  // If .config/alacritty folder doesn't exists, create one
  if (!fs.existsSync(homeDir)) {
    fs.mkdirSync(homeDir);
  }

  const configFile = `${homeDir}/alacritty.yml`;

  return fsPromises
    .writeFile(configFile, configTemplate, 'utf8')
    .then(() => {
      console.log('New config file created.');
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateTheme(data, theme, ymlPath, preview = false) {
  const themePath = themeFilePath(theme);
  const themeFile = fs.readFileSync(themePath, 'utf8');
  const themeDoc = YAML.parseDocument(themeFile);
  const themeColors = themeDoc.contents.items.filter(
    (i) => i.key.value === 'colors'
  )[0];

  const alacrittyDoc = YAML.parseDocument(data);
  if (alacrittyDoc.contents === null) {
    alacrittyDoc.contents = { items: [] };
  }
  const alacrittyColors = alacrittyDoc.contents.items.filter(
    (i) => i.key.value === 'colors'
  )[0];

  if (alacrittyColors) {
    alacrittyColors.value = themeColors.value;
  } else {
    alacrittyDoc.contents.items.push(new Pair('colors', themeColors.value));
  }

  const newContent = String(alacrittyDoc);

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      if (!preview) {
        console.log(`The theme ${theme} has been applied successfully!`);
      }
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function applyTheme(theme, preview = false) {
  // alacritty.yml path
  const ymlPath = getAlacrittyConfig();
  return fsPromises.readFile(ymlPath, 'utf8').then((data) => {
    return updateTheme(data, theme, ymlPath, preview);
  });
}

module.exports = {
  applyTheme,
  createConfigFile,
  getAlacrittyConfig,
};
