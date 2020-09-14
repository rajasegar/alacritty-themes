#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const applyTheme = require("../index");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy");

const themesDir = path.join(__dirname, "..", "themes/");
const themes = fs.readdirSync(themesDir).map((f) => f.replace(".yml", ""));
const themePrompts = {
  type: "autocomplete",
  name: "theme",
  message: "Select a theme:",
  source: searchThemes,
};

function searchThemes(answers, input) {
  input = input || '';
  return new Promise(function (resolve) {
    setTimeout(function () {
      var fuzzyResult = fuzzy.filter(input, themes);
      resolve(
        fuzzyResult.map(function (el) {
          return el.original;
        })
      );
    }, 100);
  });
}

function main() {
  inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
  inquirer.prompt(themePrompts).then((answers) => {
    const { theme } = answers;
    applyTheme(theme);
  });
}

main();
