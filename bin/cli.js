#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const applyTheme = require("../index");
const inquirer = require("inquirer");

const themesDir = path.join(__dirname, "themes/");
const themes = fs.readdirSync(themesDir).map((f) => f.replace(".yml", ""));
const themePrompts = {
  type: "list",
  name: "theme",
  message: "Select a theme:",
  choices: themes,
};

function main() {
  inquirer.prompt(themePrompts).then((answers) => {
    const { theme } = answers;
    applyTheme(theme);
  });
}

main();
