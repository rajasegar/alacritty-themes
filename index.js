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

function updateThemeWithFile(data, themePath, ymlPath, preview = false) {
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

  const newContent = String(alacrittyDoc);

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      if (!preview) {
        const namePairs = alacrittyColors
          ? alacrittyColors.value.items.filter((i) => i.key.value === 'name')
          : [];
        const themeName = namePairs.length === 0 ? null : namePairs[0].value;
        if (themeName) {
          console.log(
            `The theme "${themeName}" has been applied successfully!`
          );
        } else {
          console.log(`The theme has been applied successfully!`);
        }
      }
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateTheme(data, theme, ymlPath, preview = false) {
  const isSpecificFile =
    fs.existsSync(theme) && !fs.lstatSync(theme).isDirectory();
  const themePath = isSpecificFile ? theme : themeFilePath(theme);

  return updateThemeWithFile(data, themePath, ymlPath, preview);
}

function applyTheme(theme, preview = false) {
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
