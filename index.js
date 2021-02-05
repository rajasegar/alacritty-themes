const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const { Pair } = require('yaml/types');

// alacritty.yml path
const ymlPath =
  process.env.OS === 'Windows_NT'
    ? path.resolve(process.env.APPDATA, 'alacritty/alacritty.yml')
    : path.resolve(process.env.HOME, '.config/alacritty/alacritty.yml');

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

  fs.writeFileSync(ymlPath, configTemplate, 'utf8');
  console.log('New config file created.');
}

function updateTheme(data, theme, preview = false) {
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

  const newContent = String(doc);

  fs.writeFile(ymlPath, newContent, 'utf8', (err) => {
    if (err) throw err;

    if (!preview) {
      console.log(`The theme ${theme} has been applied successfully!`);
    }
  });
}

function applyTheme(theme, preview = false) {
  fs.readFile(ymlPath, 'utf8', (err, data) => {
    updateTheme(data, theme, preview);
  });
}

module.exports = {
  applyTheme,
  ymlPath,
  createConfigFile,
};
