const path = require("path");

// Alacritty config directory
const alacrittyConfigDir = (process.env.OS === "Windows_NT")
  ? path.join(process.env.APPDATA, "alacritty")
  : path.join(process.env.HOME, ".config/alacritty");

// Alacritty config path
const alacrittyConfigPath = `${alacrittyConfigDir}/alacritty.yml`;

// Get path to yml for given theme name
function getThemeYmlPath(theme) {
  return path.join(__dirname, `themes/${theme}.yml`);
}

// Find the colors key in yml
function getColors(doc) {
  return doc.contents.items.filter((i) => i.key.value === "colors")[0];
}

module.exports = {
  alacrittyConfigDir: alacrittyConfigDir,
  alacrittyConfigPath: alacrittyConfigPath,
  getThemeYmlPath: getThemeYmlPath,
  getColors: getColors
};

