const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const { Pair } = require('yaml/types');

const {
  NoAlacrittyFileFoundError,
  alacrittyConfigPath,
  alacrittyFileExists,
  alacrittyTemplateContent,
  useUserAlacrittyPath,
  readFile,
  writeFile,
} = require('./src/helpers');

// pick the correct config file or handle errors, if it doesn't exist
function getAlacrittyConfig() {
  if (!alacrittyFileExists()) {
    throw NoAlacrittyFileFoundError;
  }

  return alacrittyConfigPath();
}

async function createConfigFile() {
  const template = alacrittyTemplateContent();
  const alacrittyPath = useUserAlacrittyPath();
  const newAlacrittyFile = `${alacrittyPath}alacritty.yml`;

  try {
    await writeFile(newAlacrittyFile, template);
    console.log(`Alacritty file was created: ${newAlacrittyFile}`);
  } catch (e) {
    if (e) throw e;
  }
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
};
