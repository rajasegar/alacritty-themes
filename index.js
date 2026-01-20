const YAML = require('yaml');
const fs = require('fs');
const fsPromises = fs.promises;
const { Pair, YAMLMap } = require('yaml/types');

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

function getCurrentFont() {
  if (!alacrittyConfigPath()) {
    console.log(
      'No Alacritty configuration file found\nRun: `alacritty-themes -C` to create one'
    );
    exit(1);
  }
  const configFile = fs.readFileSync(alacrittyConfigPath(), 'utf8');
  const configDoc = YAML.parse(configFile);

  const font = configDoc.font || {};
  const normal = font.normal || {};
  return {
    family: normal.family || 'monospace',
    size: font.size || 11,
  };
}

function getCurrentOpacity() {
  if (!alacrittyConfigPath()) {
    console.log(
      'No Alacritty configuration file found\nRun: `alacritty-themes -C` to create one'
    );
    exit(1);
  }
  const configFile = fs.readFileSync(alacrittyConfigPath(), 'utf8');
  const configDoc = YAML.parse(configFile);

  const window = configDoc.window || {};
  return window.opacity !== undefined ? window.opacity : 1.0;
}

function applyOpacity(opacity, preview = false) {
  const ymlPath = getAlacrittyConfig();
  const data = fs.readFileSync(ymlPath, 'utf8');

  if (!data || data.trim().length === 0) {
    if (!preview) console.log('Config file is empty, cannot apply opacity');
    return Promise.resolve();
  }

  const alacrittyDoc = YAML.parseDocument(data);

  if (!alacrittyDoc.contents || !alacrittyDoc.contents.items) {
    if (!preview) console.log('Invalid config structure');
    return Promise.resolve();
  }

  alacrittyDoc.setIn(['window', 'opacity'], opacity);

  const newContent = String(alacrittyDoc);

  // Use sync write for preview to avoid race conditions
  if (preview) {
    fs.writeFileSync(ymlPath, newContent, 'utf8');
    return Promise.resolve();
  }

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      console.log(`Opacity set to ${opacity}`);
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function applyFontSize(size, preview = false) {
  const ymlPath = getAlacrittyConfig();
  const data = fs.readFileSync(ymlPath, 'utf8');

  if (!data || data.trim().length === 0) {
    if (!preview) console.log('Config file is empty, cannot apply font size');
    return Promise.resolve();
  }

  const alacrittyDoc = YAML.parseDocument(data);

  if (!alacrittyDoc.contents || !alacrittyDoc.contents.items) {
    if (!preview) console.log('Invalid config structure');
    return Promise.resolve();
  }

  alacrittyDoc.setIn(['font', 'size'], size);

  const newContent = String(alacrittyDoc);

  if (preview) {
    fs.writeFileSync(ymlPath, newContent, 'utf8');
    return Promise.resolve();
  }

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      console.log(`Font size set to ${size}`);
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function applyFontFamily(family, preview = false) {
  const ymlPath = getAlacrittyConfig();
  const data = fs.readFileSync(ymlPath, 'utf8');

  if (!data || data.trim().length === 0) {
    if (!preview) console.log('Config file is empty, cannot apply font family');
    return Promise.resolve();
  }

  const alacrittyDoc = YAML.parseDocument(data);

  if (!alacrittyDoc.contents || !alacrittyDoc.contents.items) {
    if (!preview) console.log('Invalid config structure');
    return Promise.resolve();
  }

  alacrittyDoc.setIn(['font', 'normal', 'family'], family);

  const newContent = String(alacrittyDoc);

  if (preview) {
    fs.writeFileSync(ymlPath, newContent, 'utf8');
    return Promise.resolve();
  }

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      console.log(`Font family set to "${family}"`);
    })
    .catch((err) => {
      if (err) throw err;
    });
}

function updateThemeWithFile(
  data,
  themeName,
  themePath,
  ymlPath,
  preview = false
) {
  if (!data || data.trim().length === 0) {
    if (!preview) console.log('Config file is empty, cannot apply theme');
    return Promise.resolve();
  }

  const themeFile = fs.readFileSync(themePath, 'utf8');
  const themeDoc = YAML.parseDocument(themeFile);
  const themeColors = themeDoc.contents.items.find(
    (i) => i.key.value === 'colors'
  );

  const alacrittyDoc = YAML.parseDocument(data);
  if (!alacrittyDoc.contents || !alacrittyDoc.contents.items) {
    if (!preview) console.log('Invalid config structure');
    return Promise.resolve();
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

  // Use sync write for preview to avoid race conditions
  if (preview) {
    fs.writeFileSync(ymlPath, newContent, 'utf8');
    return Promise.resolve();
  }

  return fsPromises
    .writeFile(ymlPath, newContent, 'utf8')
    .then(() => {
      console.log(`The theme "${themeName}" has been applied successfully!`);
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
  const data = fs.readFileSync(ymlPath, 'utf8');
  return updateTheme(data, theme, themesFolder, ymlPath, preview);
}

module.exports = {
  applyTheme,
  applyFontSize,
  applyFontFamily,
  applyOpacity,
  createConfigFile,
  getAlacrittyConfig,
  getCurrentTheme,
  getCurrentFont,
  getCurrentOpacity,
};
