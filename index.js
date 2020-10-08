const YAML = require("yaml");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { Pair } = require("yaml/types");

// alacritty.yml path
const ymlPath = (process.env.OS === "Windows_NT")
  ? path.resolve(
    process.env.APPDATA,
    "alacritty/alacritty.yml"
  )
  : path.resolve(
    process.env.HOME,
    ".config/alacritty/alacritty.yml"
  );

function updateTheme(data, theme) {
  const themePath = path.join(__dirname, `themes/${theme}.yml`);
  const themeFile = fs.readFileSync(themePath, "utf8");

  const doc = YAML.parseDocument(data);

  const themeDoc = YAML.parseDocument(themeFile);

  // Find the colors key in user's alacritty.yml
  const colors = doc.contents.items.filter((i) => i.key.value === "colors")[0];

  // Find the colors key in theme.yml
  const themeColors = themeDoc.contents.items.filter(
    (i) => i.key.value === "colors"
  )[0];

  // colors key is commented out or not available
  if (!colors) {
    // Create new colors key and assign value from theme
    doc.contents.items.push(new Pair("colors", themeColors.value));
  } else {
    // Update colors key
    colors.value = themeColors.value;
  }

  const newContent = String(doc);

  fs.writeFile(ymlPath, newContent, "utf8", (err) => {
    if (err) throw err;
    console.log(`The theme ${theme} has been applied successfully!`);
  });
}

module.exports = function (theme) {
  fs.readFile(ymlPath, "utf8", (err, data) => {
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

          const homeDir = (process.env.OS === "Windows_NT")
            ? path.join(process.env.APPDATA, "alacritty/")
            : path.join(process.env.HOME, ".config/alacritty/");

          // If .config/alacritty folder doesn't exists, create one
          if (!fs.existsSync(homeDir)) {
            fs.mkdirSync(homeDir);
          }

          fs.writeFile(ymlPath, configTemplate, "utf8", (err) => {
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
};
