const YAML = require("yaml");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { Pair } = require("yaml/types");
const {
  alacrittyConfigDir,
  alacrittyConfigPath,
  getThemeYmlPath,
  getColors
} = require("./utils");


function updateTheme(data, theme) {
  const themePath = getThemeYmlPath(theme);
  const themeFile = fs.readFileSync(themePath, "utf8");

  const doc = YAML.parseDocument(data);
  const colors = getColors(doc);

  const themeDoc = YAML.parseDocument(themeFile);
  const themeColors = getColors(themeDoc);

  // colors key is commented out or not available
  if (!colors) {
    // Create new colors key and assign value from theme
    doc.contents.items.push(new Pair("colors", themeColors.value));
  } else {
    // Update colors key
    colors.value = themeColors.value;
  }

  const newContent = String(doc);

  fs.writeFile(alacrittyConfigPath, newContent, "utf8", (err) => {
    if (err) throw err;
    console.log(`The theme ${theme} has been applied successfully!`);
  });
}

function applyTheme(theme) {
  fs.readFile(alacrittyConfigPath, "utf8", (err, data) => {
    if (err) {
      const createConfigPrompt = {
        type: "confirm",
        name: "createConfig",
        message:
          "Looks like you don't have alacritty config file. Do you want to create one?",
      };

      inquirer.prompt(createConfigPrompt).then((answers) => {
        if (answers.createConfig) {
          const templatePath = path.join(__dirname, "alacritty.yml");
          const configTemplate = fs.readFileSync(templatePath, "utf8");

          if (!fs.existsSync(alacrittyConfigDir)) {
            fs.mkdirSync(alacrittyConfigDir);
          }

          fs.writeFile(alacrittyConfigPath, configTemplate, "utf8", (err) => {
            if (err) throw err;
            console.log("New config file created.");
            updateTheme(configTemplate, theme);
          });
        }
      });
    } else {
      updateTheme(data, theme);
    }
  });
}

module.exports = {
  applyTheme: applyTheme
};
