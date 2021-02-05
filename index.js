const YAML = require("yaml");
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");
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


function createConfigFile() {

  const createConfigPrompt = {
    type: "confirm",
    name: "createConfig",
    message:
    "Looks like you don't have alacritty config file. Do you want to create one?",
  };

  (async () => {

    const answers = await prompts(createConfigPrompt);

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

      fs.writeFileSync(ymlPath, configTemplate, "utf8");
      console.log("New config file created.");
    }

  })();
}

function getPrevTheme() {
  let colors;
  if(!fs.existsSync(ymlPath)) {
    console.log('file not exists');
    createConfigFile();

    const themePath = path.join(__dirname, `themes/Dracula.yml`);
    const themeFile = fs.readFileSync(themePath, "utf8");

    const themeDoc = YAML.parseDocument(themeFile);

    // Find the colors key in theme.yml
    colors  = themeDoc.contents.items.filter(
      (i) => i.key.value === "colors"
    )[0];
  } else {
    console.log('file exists');

    const data = fs.readFileSync(ymlPath, "utf8");

    const doc = YAML.parseDocument(data);

    // Find the colors key in user's alacritty.yml
    colors = doc.contents.items.filter((i) => i.key.value === "colors")[0];


  }

  return colors;

}

function updateTheme(data, theme, preview = false) {
  let prevColors;
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

    // Save previous colors
    prevColors = colors.value;
    // Update colors key
    colors.value = themeColors.value;
  }

  const newContent = String(doc);

  fs.writeFile(ymlPath, newContent, "utf8", (err) => {
    if (err) throw err;
    if(!preview) {
      console.log(`The theme ${theme} has been applied successfully!`);
    }
  });
}

function restoreColors(oldColors) {

  fs.readFile(ymlPath, "utf8", (err, data) => {
    const doc = YAML.parseDocument(data);

    // Find the colors key in user's alacritty.yml
    const colors = doc.contents.items.filter((i) => i.key.value === "colors")[0];

    // Restore colors value
    colors.value = oldColors.value;

    const newContent = String(doc);

    fs.writeFile(ymlPath, newContent, "utf8", (err) => {
      if (err) throw err;
    });
  });
}

function applyTheme(theme, preview = false) {
  fs.readFile(ymlPath, "utf8", (err, data) => {
    updateTheme(data, theme, preview);
  });
};

module.exports = {
  applyTheme,
  getPrevTheme,
  restoreColors,
  ymlPath,
  createConfigFile
};
