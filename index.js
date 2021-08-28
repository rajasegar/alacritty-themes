const YAML = require('yaml');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { Pair } = require('yaml/types');

const { possibleLocations } = require('./bin/helpers');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const noConfigErr = new Error(
  'No configuration file for alacritty found. Expected one of the following files to exist:\n' +
    possibleLocations().join('\n')
);

function getAlacrittyConfig() {
  // pick the correct config file or handle errors, if it doesn't exist
  function findExistingFile(files) {
    for (let configPath of files)
      if (fs.existsSync(configPath)) return configPath;

    throw noConfigErr;
  }

  return findExistingFile(possibleLocations());
}

function createConfigFile() {
  const templatePath = path.join(__dirname, 'alacritty.yml');
  const configTemplate = fs.readFileSync(templatePath, 'utf8');

  const homeDir =
    process.env.OS === 'Windows_NT'
      ? path.join(process.env.APPDATA, 'alacritty/')
      : path.join(process.env.HOME, '.config/alacritty/');

  // If .config/alacritty folder doesn't exists, create one
  if (!fs.existsSync(homeDir)) {
    fs.mkdirSync(homeDir);
  }

  const configFile = `${homeDir}/alacritty.yml`;

  return writeFile(configFile, configTemplate, 'utf8')
    .then(() => {
      console.log('New config file created.');
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateTheme(data, theme, ymlPath, preview = false) {
  const themePath = path.join(__dirname, `themes/${theme}.yml`);
  const themeFile = fs.readFileSync(themePath, 'utf8');

  const doc = YAML.parseDocument(data);

  const themeDoc = YAML.parseDocument(themeFile);

  // Find the colors key in user's alacritty.yml
  const colors = doc.contents.items.filter((i) => i.key.value === 'colors')[0];

  // Find the colors key in theme.yml
  const themeColors = themeDoc.contents.items.filter(
    (i) => i.key.value === 'colors'
  )[0];

  // colors key is commented out or not available
  if (!colors) {
    // Create new colors key and assign value from theme
    doc.contents.items.push(new Pair('colors', themeColors.value));
  } else {
    // Update colors key
    colors.value = themeColors.value;
  }

  const newContent = YAML.stringify(doc);

  return writeFile(ymlPath, newContent, 'utf8')
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
  return readFile(ymlPath, 'utf8').then((data) => {
    return updateTheme(data, theme, ymlPath, preview);
  });
}

module.exports = {
  applyTheme,
  createConfigFile,
  getAlacrittyConfig,
  noConfigErr,
};
